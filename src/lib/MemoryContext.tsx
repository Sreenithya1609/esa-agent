import { createContext, useContext, useState, type ReactNode } from 'react';
import { MEMORY_ITEMS, DEFAULT_GLOSSARY, DEFAULT_REPORT_SECTIONS } from '@/mock/memoryItems';

export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
}

export interface ReportSectionItem {
  id: string;
  name: string;
  visible: boolean;
}

export interface GovernanceSettings {
  allowQueryPatterns: boolean;
  allowFeedbackLearning: boolean;
  includeTeamTemplates: boolean;
  retentionDays: 30 | 60 | 90 | 180;
}

interface MemoryContextType {
  brandVoice: string;
  glossary: GlossaryItem[];
  reportSections: ReportSectionItem[];
  preferredChartTypes: string[];
  outputLevel: number; // 0 (Technical) → 100 (Executive)
  governance: GovernanceSettings;
  analystPreferences: string[]; // from memoryItems.ts initially
  setBrandVoice: (v: string) => void;
  addGlossaryTerm: (term: string, definition: string) => void;
  removeGlossaryTerm: (id: string) => void;
  reorderReportSections: (sections: ReportSectionItem[]) => void;
  toggleSectionVisibility: (id: string) => void;
  setPreferredChartTypes: (types: string[]) => void;
  setOutputLevel: (v: number) => void;
  setGovernance: (g: Partial<GovernanceSettings>) => void;
  removeAnalystPreference: (index: number) => void;
  clearAnalystPreferences: () => void;
  clearAllMemory: () => void;
}

const DEFAULT_BRAND_VOICE = '';

const defaultGovernance: GovernanceSettings = {
  allowQueryPatterns: true,
  allowFeedbackLearning: true,
  includeTeamTemplates: true,
  retentionDays: 90,
};

// Map default glossary to include IDs
const initialGlossary: GlossaryItem[] = DEFAULT_GLOSSARY.map((item, index) => ({
  id: `glo_${index + 1}`,
  term: item.term,
  definition: item.definition,
}));

const MemoryContext = createContext<MemoryContextType>({
  brandVoice: DEFAULT_BRAND_VOICE,
  glossary: [],
  reportSections: [],
  preferredChartTypes: [],
  outputLevel: 50,
  governance: defaultGovernance,
  analystPreferences: [],
  setBrandVoice: () => {},
  addGlossaryTerm: () => {},
  removeGlossaryTerm: () => {},
  reorderReportSections: () => {},
  toggleSectionVisibility: () => {},
  setPreferredChartTypes: () => {},
  setOutputLevel: () => {},
  setGovernance: () => {},
  removeAnalystPreference: () => {},
  clearAnalystPreferences: () => {},
  clearAllMemory: () => {},
});

export function MemoryProvider({ children }: { children: ReactNode }) {
  const [brandVoice, setBrandVoiceState] = useState<string>(() => localStorage.getItem('esa_brand_voice') ?? DEFAULT_BRAND_VOICE);
  
  const [glossary, setGlossaryState] = useState<GlossaryItem[]>(() => {
    try {
      const stored = localStorage.getItem('esa_glossary');
      return stored ? JSON.parse(stored) : initialGlossary;
    } catch {
      return initialGlossary;
    }
  });

  const [reportSections, setReportSectionsState] = useState<ReportSectionItem[]>(() => {
    try {
      const stored = localStorage.getItem('esa_report_sections');
      return stored ? JSON.parse(stored) : DEFAULT_REPORT_SECTIONS;
    } catch {
      return DEFAULT_REPORT_SECTIONS;
    }
  });

  const [preferredChartTypes, setPreferredChartTypesState] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('esa_preferred_charts');
      return stored ? JSON.parse(stored) : ['Bar', 'Line'];
    } catch {
      return ['Bar', 'Line'];
    }
  });

  const [outputLevel, setOutputLevelState] = useState<number>(() => {
    const stored = localStorage.getItem('esa_output_level');
    return stored ? Number(stored) : 50;
  });

  const [governance, setGovernanceState] = useState<GovernanceSettings>(() => {
    try {
      const stored = localStorage.getItem('esa_governance');
      return stored ? JSON.parse(stored) : defaultGovernance;
    } catch {
      return defaultGovernance;
    }
  });

  const [analystPreferences, setAnalystPreferencesState] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('esa_analyst_preferences');
      return stored ? JSON.parse(stored) : MEMORY_ITEMS;
    } catch {
      return MEMORY_ITEMS;
    }
  });

  const setBrandVoice = (v: string) => {
    setBrandVoiceState(v);
    localStorage.setItem('esa_brand_voice', v);
  };

  const addGlossaryTerm = (term: string, definition: string) => {
    const newTerm: GlossaryItem = {
      id: `glo_${Date.now()}`,
      term,
      definition,
    };
    const updated = [...glossary.filter(item => item.term.toLowerCase() !== term.toLowerCase()), newTerm];
    setGlossaryState(updated);
    localStorage.setItem('esa_glossary', JSON.stringify(updated));
  };

  const removeGlossaryTerm = (id: string) => {
    const updated = glossary.filter(item => item.id !== id);
    setGlossaryState(updated);
    localStorage.setItem('esa_glossary', JSON.stringify(updated));
  };

  const reorderReportSections = (sections: ReportSectionItem[]) => {
    setReportSectionsState(sections);
    localStorage.setItem('esa_report_sections', JSON.stringify(sections));
  };

  const toggleSectionVisibility = (id: string) => {
    const updated = reportSections.map((sec) =>
      sec.id === id ? { ...sec, visible: !sec.visible } : sec
    );
    reorderReportSections(updated);
  };

  const setPreferredChartTypes = (c: string[]) => {
    setPreferredChartTypesState(c);
    localStorage.setItem('esa_preferred_charts', JSON.stringify(c));
  };

  const setOutputLevel = (l: number) => {
    setOutputLevelState(l);
    localStorage.setItem('esa_output_level', String(l));
  };

  const setGovernance = (g: Partial<GovernanceSettings>) => {
    const updated = { ...governance, ...g };
    setGovernanceState(updated);
    localStorage.setItem('esa_governance', JSON.stringify(updated));
  };

  const removeAnalystPreference = (index: number) => {
    const updated = analystPreferences.filter((_, i) => i !== index);
    setAnalystPreferencesState(updated);
    localStorage.setItem('esa_analyst_preferences', JSON.stringify(updated));
  };

  const clearAnalystPreferences = () => {
    setAnalystPreferencesState([]);
    localStorage.setItem('esa_analyst_preferences', JSON.stringify([]));
  };

  const clearAllMemory = () => {
    setBrandVoiceState('');
    setGlossaryState(initialGlossary);
    setReportSectionsState(DEFAULT_REPORT_SECTIONS);
    setPreferredChartTypesState(['Bar', 'Line']);
    setOutputLevelState(50);
    setGovernanceState(defaultGovernance);
    setAnalystPreferencesState(MEMORY_ITEMS);

    localStorage.removeItem('esa_brand_voice');
    localStorage.setItem('esa_glossary', JSON.stringify(initialGlossary));
    localStorage.setItem('esa_report_sections', JSON.stringify(DEFAULT_REPORT_SECTIONS));
    localStorage.setItem('esa_preferred_charts', JSON.stringify(['Bar', 'Line']));
    localStorage.setItem('esa_output_level', '50');
    localStorage.setItem('esa_governance', JSON.stringify(defaultGovernance));
    localStorage.setItem('esa_analyst_preferences', JSON.stringify(MEMORY_ITEMS));
  };

  return (
    <MemoryContext.Provider value={{
      brandVoice,
      glossary,
      reportSections,
      preferredChartTypes,
      outputLevel,
      governance,
      analystPreferences,
      setBrandVoice,
      addGlossaryTerm,
      removeGlossaryTerm,
      reorderReportSections,
      toggleSectionVisibility,
      setPreferredChartTypes,
      setOutputLevel,
      setGovernance,
      removeAnalystPreference,
      clearAnalystPreferences,
      clearAllMemory
    }}>
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemory() {
  return useContext(MemoryContext);
}
