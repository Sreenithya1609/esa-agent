// ESA Live Activity Feed Mock Data — used by LiveActivityFeed in ControlRoom
import type { AgentKey } from '@/lib/mockData';

export interface ActivityEntry {
  id: string;
  userName: string;
  userInitials: string;
  querySummary: string;
  activeAgents: AgentKey[];
  dataSources: string[];
  startedAt: number; // timestamp ms
  status: 'running' | 'complete' | 'failed';
}

// Pool of entries — LiveActivityFeed cycles through these with setInterval
export const ACTIVITY_POOL: Omit<ActivityEntry, 'id' | 'startedAt'>[] = [
  { userName: 'Arjun Mehta', userInitials: 'AM', querySummary: 'Build GTM strategy for APAC enterprise segment', activeAgents: ['strategy', 'research'], dataSources: ['market_research/', 'competitor_filings/'], status: 'running' },
  { userName: 'Priya Nair', userInitials: 'PN', querySummary: 'Show Q3 revenue trends with anomaly detection', activeAgents: ['data'], dataSources: ['sales_data.csv', 'snowflake_db'], status: 'running' },
  { userName: 'Rohan Sharma', userInitials: 'RS', querySummary: 'Find HR leave policy for contract employees', activeAgents: ['search'], dataSources: ['hr_policy.pdf'], status: 'complete' },
  { userName: 'Meera Iyer', userInitials: 'MI', querySummary: 'Benchmark our NPS against top 5 SaaS competitors', activeAgents: ['research', 'data'], dataSources: ['crm_api', 'competitor_filings/'], status: 'running' },
  { userName: 'Karan Bose', userInitials: 'KB', querySummary: 'Analyze churn drivers for H1 2026 cohorts', activeAgents: ['data', 'strategy'], dataSources: ['snowflake_db', 'sales_data.csv'], status: 'complete' },
  { userName: 'Arjun Mehta', userInitials: 'AM', querySummary: 'Create risk assessment for EU market entry', activeAgents: ['strategy', 'research'], dataSources: ['market_research/'], status: 'running' },
  { userName: 'Priya Nair', userInitials: 'PN', querySummary: 'Compare Salesforce vs HubSpot feature matrix', activeAgents: ['research'], dataSources: ['competitor_filings/', 'crm_api'], status: 'complete' },
  { userName: 'Meera Iyer', userInitials: 'MI', querySummary: 'Market size of India fintech 2026-2030', activeAgents: ['research'], dataSources: ['market_research/'], status: 'running' },
  { userName: 'Rohan Sharma', userInitials: 'RS', querySummary: 'Weekly revenue summary with variance analysis', activeAgents: ['data'], dataSources: ['sales_data.csv'], status: 'complete' },
  { userName: 'Karan Bose', userInitials: 'KB', querySummary: 'Search compliance documentation for Q2 audit', activeAgents: ['search'], dataSources: ['hr_policy.pdf'], status: 'failed' },
  { userName: 'Arjun Mehta', userInitials: 'AM', querySummary: 'Build competitive positioning for Series C pitch', activeAgents: ['strategy', 'research', 'data'], dataSources: ['competitor_filings/', 'sales_data.csv'], status: 'running' },
  { userName: 'Priya Nair', userInitials: 'PN', querySummary: 'Forecast Q4 revenue with seasonal adjustment', activeAgents: ['data'], dataSources: ['snowflake_db', 'sales_data.csv'], status: 'running' },
  { userName: 'Meera Iyer', userInitials: 'MI', querySummary: 'Deep research: India SaaS trends 2027', activeAgents: ['research', 'search'], dataSources: ['market_research/'], status: 'complete' },
  { userName: 'Rohan Sharma', userInitials: 'RS', querySummary: 'Find all policies mentioning remote work', activeAgents: ['search'], dataSources: ['hr_policy.pdf'], status: 'complete' },
  { userName: 'Karan Bose', userInitials: 'KB', querySummary: 'Visualize customer acquisition funnel by channel', activeAgents: ['data'], dataSources: ['crm_api', 'snowflake_db'], status: 'running' },
];
