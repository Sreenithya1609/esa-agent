// ESA Intent Detection — client-side keyword matching
// Detects query intent and returns which agents should be activated
import type { AgentKey } from '@/lib/mockData';

export type IntentType = 'strategy' | 'data' | 'research' | 'search' | 'multi-agent';

export interface DetectedIntent {
  type: IntentType;
  agents: AgentKey[];
  keywords: string[];
  needsInlineForm: boolean; // deterministic: strategy queries with "build" or "create"
}

const INTENT_KEYWORDS: Record<string, { type: Exclude<IntentType, 'multi-agent'>; agent: AgentKey }> = {
  // Strategy
  strategy: { type: 'strategy', agent: 'strategy' },
  gtm: { type: 'strategy', agent: 'strategy' },
  plan: { type: 'strategy', agent: 'strategy' },
  recommend: { type: 'strategy', agent: 'strategy' },
  recommendation: { type: 'strategy', agent: 'strategy' },
  positioning: { type: 'strategy', agent: 'strategy' },
  swot: { type: 'strategy', agent: 'strategy' },

  // Data Analysis
  analyze: { type: 'data', agent: 'data' },
  analysis: { type: 'data', agent: 'data' },
  chart: { type: 'data', agent: 'data' },
  trend: { type: 'data', agent: 'data' },
  trends: { type: 'data', agent: 'data' },
  data: { type: 'data', agent: 'data' },
  visualize: { type: 'data', agent: 'data' },
  revenue: { type: 'data', agent: 'data' },
  metrics: { type: 'data', agent: 'data' },
  anomaly: { type: 'data', agent: 'data' },
  anomalies: { type: 'data', agent: 'data' },
  forecast: { type: 'data', agent: 'data' },
  churn: { type: 'data', agent: 'data' },

  // Research
  market: { type: 'research', agent: 'research' },
  competitor: { type: 'research', agent: 'research' },
  competitors: { type: 'research', agent: 'research' },
  benchmark: { type: 'research', agent: 'research' },
  research: { type: 'research', agent: 'research' },
  landscape: { type: 'research', agent: 'research' },
  industry: { type: 'research', agent: 'research' },

  // Search
  find: { type: 'search', agent: 'search' },
  search: { type: 'search', agent: 'search' },
  policy: { type: 'search', agent: 'search' },
  document: { type: 'search', agent: 'search' },
  lookup: { type: 'search', agent: 'search' },
  locate: { type: 'search', agent: 'search' },
};

/**
 * Detect intent from a user query.
 * @param query - The user's input text
 * @param activeAgents - Agents available in the current persona (from PersonaContext)
 * @returns DetectedIntent with type, agents, matched keywords, and inline form flag
 */
export function detectIntent(query: string, activeAgents?: AgentKey[]): DetectedIntent {
  const words = query.toLowerCase().split(/\s+/);
  const matchedKeywords: string[] = [];
  const detectedTypes = new Set<Exclude<IntentType, 'multi-agent'>>();
  const detectedAgents = new Set<AgentKey>();

  for (const word of words) {
    // Strip punctuation for matching
    const clean = word.replace(/[^a-z]/g, '');
    const match = INTENT_KEYWORDS[clean];
    if (match) {
      matchedKeywords.push(clean);
      detectedTypes.add(match.type);
      detectedAgents.add(match.agent);
    }
  }

  // Filter agents by persona availability if provided
  let agents = Array.from(detectedAgents);
  const unavailableAgents: AgentKey[] = [];
  if (activeAgents && activeAgents.length > 0) {
    unavailableAgents.push(...agents.filter((a) => !activeAgents.includes(a)));
    agents = agents.filter((a) => activeAgents.includes(a));
  }

  // Determine type
  let type: IntentType;
  if (detectedTypes.size > 1) {
    type = 'multi-agent';
  } else if (detectedTypes.size === 1) {
    type = Array.from(detectedTypes)[0];
  } else {
    // Default to strategy for unrecognized queries
    type = 'strategy';
    agents = activeAgents ? [activeAgents[0]] : ['strategy'];
  }

  // If only one agent survived after persona filtering, downgrade from multi-agent
  if (type === 'multi-agent' && agents.length <= 1) {
    type = agents.length === 1
      ? (INTENT_KEYWORDS[matchedKeywords[0]]?.type ?? 'strategy')
      : 'strategy';
    if (agents.length === 0) {
      agents = activeAgents ? [activeAgents[0]] : ['strategy'];
    }
  }

  // Deterministic inline form trigger: strategy queries with "build" or "create"
  const needsInlineForm =
    (type === 'strategy' || type === 'multi-agent') &&
    words.some((w) => w === 'build' || w === 'create');

  return {
    type,
    agents: agents.length > 0 ? agents : ['strategy'],
    keywords: matchedKeywords,
    needsInlineForm,
  };
}

/**
 * Get a message describing unavailable agents for the user
 */
export function getUnavailableAgentMessage(
  query: string,
  activeAgents: AgentKey[],
): string | null {
  const words = query.toLowerCase().split(/\s+/);
  const unavailable: string[] = [];

  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, '');
    const match = INTENT_KEYWORDS[clean];
    if (match && !activeAgents.includes(match.agent)) {
      const agentNames: Record<AgentKey, string> = {
        strategy: 'Strategy Agent',
        data: 'Data Analyst Agent',
        search: 'Search Agent',
        research: 'Research Agent',
      };
      const name = agentNames[match.agent];
      if (!unavailable.includes(name)) {
        unavailable.push(name);
      }
    }
  }

  if (unavailable.length === 0) return null;

  return `${unavailable.join(' and ')} is disabled for your current persona.`;
}
