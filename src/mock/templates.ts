// ESA Mock Templates — used by TemplateLibrary, TemplateEditor, PersonaContext
import type { AgentKey } from '@/lib/mockData';

export interface Template {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  sections: string[];
  defaultAgents: AgentKey[];
  defaultSources: string[]; // data source IDs
  outputFormat: 'pdf' | 'ppt' | 'doc';
}

export const TEMPLATES: Template[] = [
  {
    id: 'tpl_1',
    name: 'Competitive Analysis Brief',
    icon: 'Swords',
    description: 'Side-by-side competitor comparison with market positioning insights.',
    sections: ['Market Overview', 'Competitor Profiles', 'Feature Matrix', 'Pricing Comparison', 'Strategic Recommendations'],
    defaultAgents: ['research', 'strategy'],
    defaultSources: ['ds_3', 'ds_5'],
    outputFormat: 'pdf',
  },
  {
    id: 'tpl_2',
    name: 'GTM Strategy Document',
    icon: 'Rocket',
    description: 'Go-to-market plan with target segments, positioning, and launch timeline.',
    sections: ['Executive Summary', 'Market Analysis', 'Target Segments', 'Value Proposition', 'Channel Strategy', 'Launch Timeline', 'KPIs', 'Risks'],
    defaultAgents: ['strategy', 'data', 'research'],
    defaultSources: ['ds_1', 'ds_3', 'ds_6'],
    outputFormat: 'ppt',
  },
  {
    id: 'tpl_3',
    name: 'Weekly Revenue Review',
    icon: 'TrendingUp',
    description: 'Automated weekly revenue analysis with variance commentary.',
    sections: ['Revenue Summary', 'Week-over-Week Trends', 'Segment Breakdown', 'Anomaly Flags', 'Action Items'],
    defaultAgents: ['data'],
    defaultSources: ['ds_1', 'ds_4'],
    outputFormat: 'pdf',
  },
  {
    id: 'tpl_4',
    name: 'Market Entry Report',
    icon: 'Globe',
    description: 'Comprehensive analysis for entering a new geographic or product market.',
    sections: ['Market Size & Growth', 'Regulatory Landscape', 'Competitive Dynamics', 'Entry Barriers', 'Opportunity Assessment', 'Recommended Approach'],
    defaultAgents: ['research', 'strategy'],
    defaultSources: ['ds_3', 'ds_5'],
    outputFormat: 'pdf',
  },
  {
    id: 'tpl_5',
    name: 'Board Strategy Summary',
    icon: 'Presentation',
    description: 'Executive-level strategy summary formatted for board presentations.',
    sections: ['Strategic Priorities', 'Key Metrics', 'Competitive Position', 'Risks & Mitigations', 'Next Steps'],
    defaultAgents: ['strategy', 'data'],
    defaultSources: ['ds_1', 'ds_4'],
    outputFormat: 'ppt',
  },
  {
    id: 'tpl_6',
    name: 'Risk Assessment',
    icon: 'ShieldAlert',
    description: 'Structured risk identification, scoring, and mitigation planning.',
    sections: ['Risk Inventory', 'Impact × Likelihood Matrix', 'Top Risks Deep-Dive', 'Mitigation Plans', 'Monitoring Framework'],
    defaultAgents: ['strategy', 'research'],
    defaultSources: ['ds_2', 'ds_5'],
    outputFormat: 'doc',
  },
];
