import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AgentKey } from '@/lib/mockData';

export interface Persona {
  id: string;
  name: string;
  icon: string;
  agents: AgentKey[];
  suggestedPrompts: string[];
  defaultTemplate: string;
  outputLevel: 'technical' | 'executive';
  customContext?: string;
  assignedTeams?: string[];
  isDefault?: boolean;
}

interface PersonaContextType {
  activePersona: Persona;
  setActivePersona: (id: string) => void;
  personas: Persona[];
  addPersona: (p: Persona) => void;
  updatePersona: (id: string, p: Partial<Persona>) => void;
  deletePersona: (id: string) => void;
}

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'per_strategy',
    name: 'Strategy Lead',
    icon: 'TrendingUp',
    agents: ['strategy', 'research', 'search'],
    suggestedPrompts: [
      'Generate a GTM strategy for enterprise SaaS market entry',
      'Conduct a SWOT analysis for Acme Corp vs Salesforce',
      'Create a board-level strategy report for Q4 objectives',
      'What are our main strategic risks in the next 12 months?'
    ],
    defaultTemplate: 'tpl_2', // GTM Strategy Document
    outputLevel: 'executive',
    customContext: 'Focus on strategic recommendations and high-level summaries.',
    assignedTeams: ['Strategy', 'Leadership'],
    isDefault: true,
  },
  {
    id: 'per_data',
    name: 'Data Analyst',
    icon: 'BarChart2',
    agents: ['data', 'search'],
    suggestedPrompts: [
      'Show Q3 revenue trends and detect anomalies',
      'Analyze customer churn drivers from sales_data.csv',
      'Generate weekly revenue review report',
      'Create a scatter plot comparing pricing vs NPS score'
    ],
    defaultTemplate: 'tpl_3', // Weekly Revenue Review
    outputLevel: 'technical',
    customContext: 'Focus on statistical significance, anomaly details, and charts.',
    assignedTeams: ['Analytics', 'Finance'],
    isDefault: true,
  },
  {
    id: 'per_research',
    name: 'Researcher',
    icon: 'Globe',
    agents: ['research', 'search'],
    suggestedPrompts: [
      'Research the APAC SaaS market sizing and trends',
      'Benchmark pricing models of top 5 CRM vendors',
      'Find competitor filings related to AI investments',
      'Create a competitive matrix for Salesforce vs HubSpot'
    ],
    defaultTemplate: 'tpl_1', // Competitive Analysis Brief
    outputLevel: 'technical',
    customContext: 'Focus on citation reliability, competitor profiles, and raw facts.',
    assignedTeams: ['Market Intel', 'Product'],
    isDefault: true,
  },
  {
    id: 'per_executive',
    name: 'Executive (Viewer)',
    icon: 'Presentation',
    agents: ['strategy', 'data', 'search', 'research'],
    suggestedPrompts: [
      'Show an executive summary of our pricing benchmarks',
      'Review consolidated Q3 performance metrics',
      'What are the key market opportunities in India for SaaS?',
      'Summarize our current product positioning and risks'
    ],
    defaultTemplate: 'tpl_5', // Board Strategy Summary
    outputLevel: 'executive',
    customContext: 'Provide high-level, clear, slides-friendly content with no jargon.',
    assignedTeams: ['Leadership', 'Board'],
    isDefault: true,
  },
];

const PersonaContext = createContext<PersonaContextType>({
  activePersona: DEFAULT_PERSONAS[0],
  setActivePersona: () => {},
  personas: DEFAULT_PERSONAS,
  addPersona: () => {},
  updatePersona: () => {},
  deletePersona: () => {},
});

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [personas, setPersonas] = useState<Persona[]>(() => {
    try {
      const stored = localStorage.getItem('esa_personas');
      return stored ? JSON.parse(stored) : DEFAULT_PERSONAS;
    } catch {
      return DEFAULT_PERSONAS;
    }
  });

  const [activePersonaId, setActivePersonaId] = useState<string>(() => {
    return localStorage.getItem('esa_active_persona_id') ?? DEFAULT_PERSONAS[0].id;
  });

  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0] || DEFAULT_PERSONAS[0];

  const setActivePersona = (id: string) => {
    setActivePersonaId(id);
    localStorage.setItem('esa_active_persona_id', id);
  };

  const addPersona = (p: Persona) => {
    setPersonas((prev) => {
      const updated = [...prev, p];
      localStorage.setItem('esa_personas', JSON.stringify(updated));
      return updated;
    });
  };

  const updatePersona = (id: string, updatedFields: Partial<Persona>) => {
    setPersonas((prev) => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updatedFields } : p);
      localStorage.setItem('esa_personas', JSON.stringify(updated));
      return updated;
    });
  };

  const deletePersona = (id: string) => {
    // Prevent deletion of active persona or default personas
    const personaToDelete = personas.find(p => p.id === id);
    if (!personaToDelete || personaToDelete.isDefault) return;

    setPersonas((prev) => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('esa_personas', JSON.stringify(updated));
      return updated;
    });

    if (activePersonaId === id) {
      setActivePersonaId(DEFAULT_PERSONAS[0].id);
      localStorage.setItem('esa_active_persona_id', DEFAULT_PERSONAS[0].id);
    }
  };

  return (
    <PersonaContext.Provider value={{
      activePersona,
      setActivePersona,
      personas,
      addPersona,
      updatePersona,
      deletePersona
    }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}
