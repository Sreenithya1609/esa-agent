// ESA Agent Definitions — extended metadata for admin/control-room and orchestration trace
import type { AgentKey } from '@/lib/mockData';

export interface AgentDefinition {
  key: AgentKey;
  name: string;
  fullName: string;
  color: string;
  icon: string;
  description: string;
  status: 'active' | 'disabled';
  systemPrompt: string;
  lastModified: { by: string; date: string };
  capabilities: string[];
}

export const AGENTS: Record<AgentKey, AgentDefinition> = {
  strategy: {
    key: 'strategy',
    name: 'Strategy',
    fullName: 'Strategy Agent',
    color: '#4A6CF7',
    icon: 'TrendingUp',
    description: 'Business strategies, GTM plans, competitive analysis, and strategic recommendations.',
    status: 'active',
    systemPrompt:
      'You are a senior strategy consultant. Analyze business data, market conditions, and competitive landscape to provide actionable strategic recommendations. Always structure your output as: Situation → Objectives → Strategy → Tactics → KPIs → Risks. Use data-driven insights and cite sources for every claim. Prefer concise, executive-ready language unless instructed otherwise.',
    lastModified: { by: 'Arjun Mehta', date: '2026-05-21' },
    capabilities: [
      'GTM strategy generation',
      'SWOT analysis',
      'Competitive positioning',
      'Risk assessment',
      'Action plan creation',
      'KPI framework design',
    ],
  },
  data: {
    key: 'data',
    name: 'Data Analyst',
    fullName: 'Data Analyst Agent',
    color: '#0FC4A7',
    icon: 'BarChart2',
    description: 'Statistical analysis, anomaly detection, trend visualization, and data-driven insights.',
    status: 'active',
    systemPrompt:
      'You are a senior data analyst. Analyze datasets, detect anomalies, identify trends, and generate visualizations. Always show your data methodology. Present findings as: Key Metrics → Trend Analysis → Anomalies → Insights → Recommendations. Use charts and tables where possible. Flag data quality issues proactively.',
    lastModified: { by: 'Priya Nair', date: '2026-05-19' },
    capabilities: [
      'Statistical analysis',
      'Trend detection',
      'Anomaly detection',
      'Chart generation',
      'Data aggregation',
      'Forecast modeling',
    ],
  },
  search: {
    key: 'search',
    name: 'Search',
    fullName: 'Search Agent',
    color: '#9B72F7',
    icon: 'Search',
    description: 'Semantic search across internal documents, policies, knowledge bases, and archives.',
    status: 'active',
    systemPrompt:
      'You are an enterprise search agent. Search across internal documents, policies, and knowledge bases. Rank results by relevance and recency. Always provide document metadata (title, type, date, team). Highlight exact matching passages. Support filters by source type, date range, and team.',
    lastModified: { by: 'Arjun Mehta', date: '2026-05-15' },
    capabilities: [
      'Semantic document search',
      'Policy lookup',
      'Knowledge base query',
      'Document ranking',
      'Passage extraction',
      'Filter & facet search',
    ],
  },
  research: {
    key: 'research',
    name: 'Research',
    fullName: 'Research Agent',
    color: '#F7924A',
    icon: 'Globe',
    description: 'External market research, competitor benchmarks, industry trends, and market sizing.',
    status: 'active',
    systemPrompt:
      'You are a market research analyst. Conduct external research on markets, competitors, and industry trends. Structure findings as: Market Overview → Key Players → Trends → Benchmarks. Always cite sources with reliability scores. Build competitive matrices for side-by-side comparisons. Flag outdated sources.',
    lastModified: { by: 'Meera Iyer', date: '2026-05-18' },
    capabilities: [
      'Market research',
      'Competitor analysis',
      'Industry benchmarking',
      'Market sizing',
      'Trend analysis',
      'Source verification',
    ],
  },
};

export const AGENT_KEYS: AgentKey[] = ['strategy', 'data', 'search', 'research'];

// Mock orchestration activity messages per agent — used by OrchestrationTrace
export const AGENT_ACTIVITIES: Record<AgentKey, string[]> = {
  strategy: [
    'Analyzing competitive landscape...',
    'Evaluating market positioning...',
    'Building strategic framework...',
    'Generating action plan...',
    'Assessing risk factors...',
  ],
  data: [
    'Reading sales_q3.csv...',
    'Detected 3 anomalies in Q3 revenue...',
    'Computing trend analysis...',
    'Generating visualization...',
    'Building forecast model...',
  ],
  search: [
    'Scanning 2,847 internal documents...',
    'Ranking results by relevance...',
    'Extracting matching passages...',
    'Filtering by team and date...',
    'Compiling search results...',
  ],
  research: [
    'Searching external market databases...',
    'Analyzing competitor filings...',
    'Cross-referencing industry benchmarks...',
    'Building competitive matrix...',
    'Verifying source reliability...',
  ],
};

// Mock data sources read by each agent — used by OrchestrationTrace
export const AGENT_SOURCES: Record<AgentKey, string[]> = {
  strategy: ['market_analysis_2026.pdf', 'competitor_matrix.xlsx', 'board_strategy_q2.pptx'],
  data: ['sales_q3.csv', 'revenue_forecast.xlsx', 'snowflake_analytics_dw'],
  search: ['hr_policy_drive/', 'compliance_docs/', 'knowledge_base_v3/'],
  research: ['gartner_report_2026.pdf', 'mckinsey_saas_trends.pdf', 'crunchbase_data/'],
};
