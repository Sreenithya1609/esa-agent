import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { AgentKey } from '@/lib/mockData';
import { detectIntent, getUnavailableAgentMessage, type DetectedIntent } from '@/lib/intentDetector';
import { usePersona } from '@/lib/PersonaContext';
import { usePermissions } from '@/lib/PermissionsContext';
import {
  STRATEGY_RESPONSE,
  DATA_ANALYSIS_RESPONSE,
  RESEARCH_RESPONSE,
  SEARCH_RESPONSE,
  MULTI_AGENT_RESPONSE,
  type StrategyResponseData,
  type DataAnalysisResponseData,
  type ResearchResponseData,
  type SearchResponseData,
  type MultiAgentResponseData,
  type ConfidenceLevel,
} from '@/mock/responses';
import { AGENT_ACTIVITIES, AGENT_SOURCES } from '@/mock/agents';

// ── Types ────────────────────────────────────────────────────────────────────

export type ResponseType = 'strategy' | 'data' | 'research' | 'search' | 'multi-agent';

export interface OrchestrationStep {
  id: string;
  type: 'intent' | 'dispatch' | 'activity' | 'merge' | 'complete';
  content: string;
  agentKey?: AgentKey;
  agentColor?: string;
  status: 'pending' | 'active' | 'done';
  activities?: string[];
  sources?: string[];
}

export interface OrchestrationTraceData {
  steps: OrchestrationStep[];
  intents: { type: string; color: string }[];
  agents: { key: AgentKey; name: string; color: string }[];
  totalDuration: number; // ms
  isCollapsed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  responseType?: ResponseType;
  responseData?: StrategyResponseData | DataAnalysisResponseData | ResearchResponseData | SearchResponseData | MultiAgentResponseData;
  trace?: OrchestrationTraceData;
  citations?: number[];
  memoryApplied?: { label: string; detail: string }[];
  followUpPrompts?: string[];
  needsInlineForm?: boolean;
  unavailableAgentMessage?: string | null;
}

export interface ChatContextType {
  messages: ChatMessage[];
  isProcessing: boolean;
  currentTrace: OrchestrationTraceData | null;
  traceStep: number; // which step is currently active (0-4)
  detectedIntent: DetectedIntent | null;
  sendMessage: (text: string, activeAgents?: AgentKey[]) => void;
  interruptQuery: () => void;
  regenerateResponse: (messageId: string, activeAgents?: AgentKey[]) => void;
  toggleTraceCollapse: (messageId: string) => void;
  clearHistory: () => void;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  isProcessing: false,
  currentTrace: null,
  traceStep: -1,
  detectedIntent: null,
  sendMessage: () => {},
  interruptQuery: () => {},
  regenerateResponse: () => {},
  toggleTraceCollapse: () => {},
  clearHistory: () => {},
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function ts() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function uid() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

const AGENT_META_MAP: Record<AgentKey, { name: string; color: string }> = {
  strategy: { name: 'Strategy Agent', color: '#4A6CF7' },
  data: { name: 'Data Analyst Agent', color: '#0FC4A7' },
  search: { name: 'Search Agent', color: '#9B72F7' },
  research: { name: 'Research Agent', color: '#F7924A' },
};

const INTENT_COLORS: Record<string, string> = {
  strategy: '#4A6CF7',
  data: '#0FC4A7',
  research: '#F7924A',
  search: '#9B72F7',
};

function getResponseData(type: ResponseType): ChatMessage['responseData'] {
  switch (type) {
    case 'strategy': return STRATEGY_RESPONSE;
    case 'data': return DATA_ANALYSIS_RESPONSE;
    case 'research': return RESEARCH_RESPONSE;
    case 'search': return SEARCH_RESPONSE;
    case 'multi-agent': return MULTI_AGENT_RESPONSE;
    default: return STRATEGY_RESPONSE;
  }
}

function getFollowUpPrompts(type: ResponseType): string[] {
  const data = getResponseData(type);
  if (data && 'followUpPrompts' in data) return (data as { followUpPrompts: string[] }).followUpPrompts;
  return ['Tell me more', 'Export this', 'Compare with last quarter'];
}

function getMemoryApplied(type: ResponseType): { label: string; detail: string }[] {
  if (type === 'strategy') return STRATEGY_RESPONSE.memoryApplied;
  if (type === 'data') return [{ label: 'Weekly Revenue Review template', detail: 'Applied based on your query pattern and preferred data format.' }];
  return [];
}

function getCitationIds(type: ResponseType): number[] {
  switch (type) {
    case 'strategy': return [1, 2, 4, 5, 9, 10, 12];
    case 'data': return [1, 4, 8];
    case 'research': return [2, 3, 4, 5, 7, 11];
    case 'search': return [6];
    case 'multi-agent': return [1, 2, 4, 5, 8, 9];
    default: return [];
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTrace, setCurrentTrace] = useState<OrchestrationTraceData | null>(null);
  const [traceStep, setTraceStep] = useState(-1);
  const [detectedIntent, setDetectedIntent] = useState<DetectedIntent | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelledRef = useRef(false);
  const { activePersona } = usePersona();
  const { agentStatus } = usePermissions();

  const cleanup = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, delay: number) => {
    const timer = setTimeout(() => {
      if (!cancelledRef.current) fn();
    }, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const sendMessage = useCallback((text: string, activeAgents?: AgentKey[]) => {
    cancelledRef.current = false;
    cleanup();

    // Add user message
    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      content: text,
      timestamp: ts(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    const baseAgents = activeAgents || activePersona.agents;
    
    // Filter target agents by both the active persona and global active settings
    const targetAgents = baseAgents.filter((a) => agentStatus[a] === 'active');

    // Detect intent
    const intent = detectIntent(text, targetAgents);
    setDetectedIntent(intent);

    // Build unavailable notice if matched query maps to a disabled agent
    let unavailableMsg = getUnavailableAgentMessage(text, targetAgents);
    if (!unavailableMsg) {
      const personaDisabledMsg = getUnavailableAgentMessage(text, activePersona.agents);
      if (personaDisabledMsg) {
        unavailableMsg = personaDisabledMsg;
      } else {
        const globalDisabledMsg = getUnavailableAgentMessage(
          text,
          (Object.keys(agentStatus) as AgentKey[]).filter((a) => agentStatus[a] === 'active')
        );
        if (globalDisabledMsg) {
          const globallyDisabledAgents = Object.entries(agentStatus)
            .filter(([_, status]) => status === 'disabled')
            .map(([key]) => key) as AgentKey[];
          const agentNames: Record<AgentKey, string> = {
            strategy: 'Strategy Agent',
            data: 'Data Analyst Agent',
            search: 'Search Agent',
            research: 'Research Agent',
          };
          const disabledName = globallyDisabledAgents
            .map((a) => agentNames[a])
            .filter((name) => text.toLowerCase().includes(name.toLowerCase().split(' ')[0]))
            .join(' and ');
          if (disabledName) {
            unavailableMsg = `${disabledName} is disabled in your workspace configuration.`;
          } else {
            unavailableMsg = globalDisabledMsg.replace('for your current persona', 'in your workspace configuration');
          }
        }
      }
    }

    const agentMetas = intent.agents.map((k) => ({
      key: k,
      ...AGENT_META_MAP[k],
    }));

    const intentChips = Array.from(new Set(intent.agents.map((a) => {
      const typeMap: Record<AgentKey, string> = { strategy: 'Strategy', data: 'Data Analysis', search: 'Search', research: 'Research' };
      return { type: typeMap[a], color: INTENT_COLORS[a] || '#4F6EF7' };
    })));

    // Build trace
    const trace: OrchestrationTraceData = {
      steps: [],
      intents: intentChips,
      agents: agentMetas,
      totalDuration: 0,
      isCollapsed: false,
    };

    setCurrentTrace(trace);

    // Timing: simple 1.5-2.5s, multi-agent 3-5s
    const isMulti = intent.type === 'multi-agent';
    const baseDelay = isMulti ? 600 : 400;

    // Step 1: Intent classification (400ms)
    setTraceStep(0);
    addTimer(() => {
      if (cancelledRef.current) return;
      setTraceStep(1);
    }, baseDelay);

    // Step 2: Agent dispatch (staggered 200ms per agent)
    const dispatchStart = baseDelay + 300;
    agentMetas.forEach((_, i) => {
      addTimer(() => {
        if (cancelledRef.current) return;
        // Just advances the step — OrchestrationTrace component handles individual agent reveals
      }, dispatchStart + i * 200);
    });

    // Step 3: Live activity
    addTimer(() => {
      if (cancelledRef.current) return;
      setTraceStep(2);
    }, dispatchStart + agentMetas.length * 200 + 200);

    // Step 4: Merge
    const mergeStart = dispatchStart + agentMetas.length * 200 + (isMulti ? 1800 : 1000);
    addTimer(() => {
      if (cancelledRef.current) return;
      setTraceStep(3);
    }, mergeStart);

    // Step 5: Complete — render response
    const completeDelay = mergeStart + (isMulti ? 1000 : 600);
    addTimer(() => {
      if (cancelledRef.current) return;
      setTraceStep(4);

      const startTime = Date.now();
      const totalDuration = completeDelay;

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: '',
        timestamp: ts(),
        responseType: intent.type,
        responseData: getResponseData(intent.type),
        trace: {
          ...trace,
          totalDuration,
          isCollapsed: true,
        },
        citations: getCitationIds(intent.type),
        memoryApplied: getMemoryApplied(intent.type),
        followUpPrompts: getFollowUpPrompts(intent.type),
        needsInlineForm: intent.needsInlineForm,
        unavailableAgentMessage: unavailableMsg,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
      setCurrentTrace(null);
      setTraceStep(-1);
      setDetectedIntent(null);
    }, completeDelay);
  }, [cleanup, addTimer, activePersona]);

  const interruptQuery = useCallback(() => {
    cancelledRef.current = true;
    cleanup();
    setIsProcessing(false);
    setCurrentTrace(null);
    setTraceStep(-1);
    setDetectedIntent(null);
  }, [cleanup]);

  const regenerateResponse = useCallback((messageId: string, activeAgents?: AgentKey[]) => {
    setMessages((prev) => {
      // Find the assistant message and the user message before it
      const idx = prev.findIndex((m) => m.id === messageId);
      if (idx < 0) return prev;
      // Find the preceding user message
      let userMsgIdx = idx - 1;
      while (userMsgIdx >= 0 && prev[userMsgIdx].role !== 'user') userMsgIdx--;
      if (userMsgIdx < 0) return prev;

      const userText = prev[userMsgIdx].content;
      // Remove the assistant message
      const newMessages = prev.filter((_, i) => i !== idx);

      // Re-send after a tick
      setTimeout(() => sendMessage(userText, activeAgents), 50);
      return newMessages;
    });
  }, [sendMessage]);

  const toggleTraceCollapse = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.trace
          ? { ...m, trace: { ...m.trace, isCollapsed: !m.trace.isCollapsed } }
          : m,
      ),
    );
  }, []);

  const clearHistory = useCallback(() => {
    cleanup();
    setMessages([]);
    setIsProcessing(false);
    setCurrentTrace(null);
    setTraceStep(-1);
    setDetectedIntent(null);
  }, [cleanup]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isProcessing,
        currentTrace,
        traceStep,
        detectedIntent,
        sendMessage,
        interruptQuery,
        regenerateResponse,
        toggleTraceCollapse,
        clearHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
