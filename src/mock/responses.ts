// ESA Mock Response Data — pre-built structured data for each card type
// Used by GenerativeResponse to populate StrategyCard, DataAnalysisCard, etc.

import type { Citation } from './citations';
import { MOCK_CITATIONS } from './citations';

// ── Confidence levels for sections ───────────────────────────────────────────
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// ── Strategy Response ────────────────────────────────────────────────────────
export interface StrategySection {
  id: string;
  title: string;
  content: string;
  confidence: ConfidenceLevel;
  citations: number[]; // citation IDs
}

export interface ActionPlanRow {
  owner: string;
  step: string;
  timeline: string;
  status: 'not_started' | 'in_progress' | 'done';
}

export interface StrategyResponseData {
  title: string;
  sections: StrategySection[];
  actionPlan: ActionPlanRow[];
  followUpPrompts: string[];
  memoryApplied: { label: string; detail: string }[];
}

export const STRATEGY_RESPONSE: StrategyResponseData = {
  title: 'GTM Strategy: APAC Enterprise Expansion',
  sections: [
    { id: 's1', title: 'Situation', content: 'The APAC SaaS market is projected to reach $45B by 2027, growing at 18% CAGR. India and Southeast Asia represent the highest-growth segments. Our current market share in APAC is <1%, with no local presence or partnerships. Competitors like Salesforce and Zoho have established APAC operations with localized pricing.', confidence: 'high', citations: [2, 5] },
    { id: 's2', title: 'Objectives', content: 'Achieve $5M ARR from APAC within 18 months of launch. Establish partnerships with 3 regional system integrators. Reach 200 enterprise customers in India by Q4 2027. Build a local team of 15 across sales, support, and partnerships.', confidence: 'high', citations: [9] },
    { id: 's3', title: 'Strategy', content: 'Lead with a product-led growth (PLG) model for SMB acquisition while running a direct enterprise sales motion for accounts >$50K ARR. Price 40% below US rates to match local purchasing power. Partner with TCS and Infosys for enterprise distribution. Position as "AI-native analytics" to differentiate from legacy CRM vendors.', confidence: 'medium', citations: [5, 10] },
    { id: 's4', title: 'Tactics', content: 'Launch a freemium tier with 2 agents (Data Analyst + Search) for Indian market. Host 4 industry roundtables in Mumbai, Bangalore, Singapore, and Jakarta. Run targeted LinkedIn campaigns with region-specific case studies. Build an India-specific compliance module for DPDP Act.', confidence: 'medium', citations: [12] },
    { id: 's5', title: 'KPIs', content: 'Pipeline generated: $15M in 12 months. Win rate: 25% for enterprise deals. Time-to-first-value: <48 hours for PLG signups. NPS in APAC: >50 within 6 months of launch. Partner-sourced revenue: 30% of total APAC revenue.', confidence: 'high', citations: [1, 4] },
    { id: 's6', title: 'Risks', content: 'Regulatory complexity across APAC markets (data localization requirements vary by country). Price-sensitive market may resist premium AI features. Competitor response — Salesforce may cut APAC pricing. Talent acquisition in India is hyper-competitive for AI/ML roles. Currency fluctuation risk for INR-denominated contracts.', confidence: 'low', citations: [12] },
  ],
  actionPlan: [
    { owner: 'Arjun Mehta', step: 'Finalize APAC pricing model', timeline: 'Week 1-2', status: 'in_progress' },
    { owner: 'Meera Iyer', step: 'Research and shortlist SI partners', timeline: 'Week 2-4', status: 'not_started' },
    { owner: 'Priya Nair', step: 'Build India compliance module spec', timeline: 'Week 3-6', status: 'not_started' },
    { owner: 'Karan Bose', step: 'Set up APAC analytics dashboard', timeline: 'Week 2-3', status: 'not_started' },
    { owner: 'Rohan Sharma', step: 'Draft APAC launch announcement', timeline: 'Week 4-5', status: 'not_started' },
    { owner: 'Arjun Mehta', step: 'Recruit India country manager', timeline: 'Week 1-8', status: 'in_progress' },
  ],
  followUpPrompts: [
    'What are the risks of pricing 40% below US rates?',
    'Compare our APAC strategy vs Salesforce\'s',
    'Export this as a board presentation',
  ],
  memoryApplied: [
    { label: 'GTM Strategy Document template', detail: 'Applied the GTM Strategy Document template based on your team\'s default configuration. Sections follow the standard 8-part framework.' },
  ],
};

// ── Data Analysis Response ───────────────────────────────────────────────────
export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface DataAnalysisResponseData {
  title: string;
  summary: string;
  chartData: ChartDataPoint[];
  chartType: 'bar' | 'line' | 'pie' | 'scatter';
  xKey: string;
  yKeys: { key: string; label: string; color: string }[];
  anomalies: { index: number; label: string; description: string }[];
  insights: string[];
  citations: number[];
  confidence: ConfidenceLevel;
  followUpPrompts: string[];
}

export const DATA_ANALYSIS_RESPONSE: DataAnalysisResponseData = {
  title: 'Q3 Revenue Trend Analysis',
  summary: 'Q3 2026 revenue reached $61.4M, exceeding the target of $58M by 5.9%. Three anomalies were detected: a revenue spike in Week 8 (attributed to a large enterprise deal closing), a dip in Week 5 (seasonal pattern), and an unusual churn spike in the SMB segment during Week 10.',
  chartData: [
    { week: 'W1', revenue: 4.2, target: 4.1, churn: 2.1 },
    { week: 'W2', revenue: 4.5, target: 4.3, churn: 1.8 },
    { week: 'W3', revenue: 4.8, target: 4.5, churn: 2.0 },
    { week: 'W4', revenue: 4.3, target: 4.6, churn: 2.2 },
    { week: 'W5', revenue: 3.9, target: 4.8, churn: 2.5 },
    { week: 'W6', revenue: 5.1, target: 4.9, churn: 1.9 },
    { week: 'W7', revenue: 5.4, target: 5.1, churn: 1.7 },
    { week: 'W8', revenue: 7.2, target: 5.2, churn: 1.5 },
    { week: 'W9', revenue: 5.8, target: 5.3, churn: 1.8 },
    { week: 'W10', revenue: 5.5, target: 5.4, churn: 3.1 },
    { week: 'W11', revenue: 5.3, target: 5.5, churn: 2.0 },
    { week: 'W12', revenue: 5.4, target: 5.3, churn: 1.9 },
  ],
  chartType: 'line',
  xKey: 'week',
  yKeys: [
    { key: 'revenue', label: 'Revenue ($M)', color: '#0FC4A7' },
    { key: 'target', label: 'Target ($M)', color: '#4A6CF7' },
  ],
  anomalies: [
    { index: 4, label: 'W5', description: 'Revenue dip to $3.9M — consistent with seasonal slowdown pattern observed in prior years.' },
    { index: 7, label: 'W8', description: 'Revenue spike to $7.2M — attributed to Acme Enterprise deal ($2.1M) closing on Aug 22.' },
    { index: 9, label: 'W10', description: 'Churn spike to 3.1% in SMB segment — correlates with competitor promotional pricing.' },
  ],
  insights: [
    'Overall Q3 performance exceeded target by 5.9%',
    'Enterprise segment drove 68% of growth',
    'SMB churn requires immediate attention — 3.1% in W10',
    'Week 8 spike was non-recurring (one-time deal)',
  ],
  citations: [1, 4, 8],
  confidence: 'high',
  followUpPrompts: [
    'What drove the W10 churn spike?',
    'Show this as a bar chart',
    'Compare Q3 vs Q2 revenue',
  ],
};

// ── Research Response ────────────────────────────────────────────────────────
export interface CompetitorRow {
  name: string;
  price: string;
  users: string;
  aiFeatures: boolean;
  nps: number;
  marketShare: string;
  isYou: boolean;
}

export interface ResearchSection {
  id: string;
  title: string;
  content: string;
  confidence: ConfidenceLevel;
  citations: number[];
}

export interface ResearchResponseData {
  title: string;
  sections: ResearchSection[];
  competitorMatrix: CompetitorRow[];
  followUpPrompts: string[];
}

export const RESEARCH_RESPONSE: ResearchResponseData = {
  title: 'CRM Market: Competitive Landscape 2026',
  sections: [
    { id: 'r1', title: 'Market Overview', content: 'The global CRM market reached $78B in 2026, growing at 12% CAGR. AI-native CRM platforms are the fastest-growing segment at 34% CAGR, driven by demand for predictive analytics and automated workflows. The enterprise segment accounts for 62% of total revenue.', confidence: 'high', citations: [2, 3] },
    { id: 'r2', title: 'Key Players', content: 'Salesforce maintains market leadership with 23% share, followed by Microsoft Dynamics (14%), HubSpot (8%), and Zoho (6%). New entrants like Acme (ESA) are gaining traction in the AI-native segment, particularly in India and Southeast Asia.', confidence: 'high', citations: [3, 7] },
    { id: 'r3', title: 'Trends', content: 'Three major trends are reshaping the market: (1) AI-powered analytics becoming a must-have, not a differentiator. (2) Vertical-specific CRM solutions gaining share over horizontal platforms. (3) Usage-based pricing models replacing per-seat licensing for SMB segments.', confidence: 'medium', citations: [2, 5] },
    { id: 'r4', title: 'Benchmarks', content: 'Enterprise CRM deals average $180K ARR with 14-month sales cycles. SMB self-serve conversion rates average 4.2% for freemium models. NPS benchmarks: Salesforce 41, HubSpot 54, Zoho 48. The top quartile achieves >60 NPS.', confidence: 'high', citations: [4, 7, 11] },
  ],
  competitorMatrix: [
    { name: 'Acme (You)', price: '$49/user', users: 'Unlimited', aiFeatures: true, nps: 62, marketShare: '<1%', isYou: true },
    { name: 'Salesforce', price: '$165/user', users: 'Per seat', aiFeatures: true, nps: 41, marketShare: '23%', isYou: false },
    { name: 'HubSpot', price: '$90/user', users: 'Per seat', aiFeatures: true, nps: 54, marketShare: '8%', isYou: false },
    { name: 'Zoho CRM', price: '$35/user', users: 'Per seat', aiFeatures: false, nps: 48, marketShare: '6%', isYou: false },
    { name: 'Pipedrive', price: '$29/user', users: 'Per seat', aiFeatures: false, nps: 51, marketShare: '3%', isYou: false },
  ],
  followUpPrompts: [
    'Deep dive into Salesforce\'s AI strategy',
    'How does our NPS compare historically?',
    'Create a board-ready competitive summary',
  ],
};

// ── Search Response ──────────────────────────────────────────────────────────
export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  relevanceScore: number; // 0-100
  source: string;
  sourceType: 'pdf' | 'doc' | 'spreadsheet' | 'policy';
  date: string;
  team: string;
  previewContent: string; // mock full text for preview
}

export interface SearchResponseData {
  title: string;
  query: string;
  totalResults: number;
  results: SearchResult[];
  followUpPrompts: string[];
}

export const SEARCH_RESPONSE: SearchResponseData = {
  title: 'Search Results: HR Leave Policy',
  query: 'HR leave policy remote work',
  totalResults: 8,
  results: [
    { id: 'sr_1', title: 'Remote Work & Leave Policy v4.2', snippet: 'Remote employees are entitled to 24 days of annual leave. Work-from-home arrangements require manager approval and quarterly in-office check-ins.', relevanceScore: 94, source: 'hr_policy.pdf', sourceType: 'pdf', date: '2026-01-10', team: 'HR', previewContent: 'SECTION 5: REMOTE WORK POLICY\n\n5.1 Eligibility\nAll full-time employees who have completed 6 months of service are eligible for remote work arrangements.\n\n5.2 Leave Entitlement\nRemote employees are entitled to 24 days of annual leave, consistent with in-office employees. Leave must be requested via the HR portal at least 5 business days in advance.\n\n5.3 Check-in Requirements\nRemote employees must attend quarterly in-office check-ins (minimum 2 days per quarter). Travel expenses for check-ins are covered by the company.\n\n5.4 Equipment\nThe company provides a laptop, monitor, and ergonomic chair for remote setups. A monthly stipend of ₹2,000 is provided for internet and utilities.' },
    { id: 'sr_2', title: 'Leave Management Guidelines 2026', snippet: 'Updated leave calendar for FY2026 including 12 public holidays, 24 annual leave days, and 10 sick leave days for all employment types.', relevanceScore: 87, source: 'leave_guidelines_2026.pdf', sourceType: 'pdf', date: '2026-03-01', team: 'HR', previewContent: 'LEAVE MANAGEMENT GUIDELINES FY2026\n\nAnnual Leave: 24 days\nSick Leave: 10 days\nMaternity Leave: 26 weeks\nPaternity Leave: 4 weeks\nPublic Holidays: 12 days\n\nCarry Forward: Up to 5 unused annual leave days may be carried forward to the next fiscal year. Beyond 5 days, unused leave is forfeited unless approved by the department head.' },
    { id: 'sr_3', title: 'Flexible Work Arrangement Policy', snippet: 'Employees may request hybrid (3 office + 2 remote) or fully remote arrangements. Approval process requires HR and manager sign-off.', relevanceScore: 82, source: 'flex_work_policy.doc', sourceType: 'doc', date: '2025-11-15', team: 'HR', previewContent: 'FLEXIBLE WORK ARRANGEMENTS\n\nOption A: Hybrid (3 days office, 2 days remote)\nOption B: Fully Remote (quarterly check-ins required)\nOption C: Compressed Week (4 × 10-hour days)\n\nAll arrangements require approval from direct manager and HR. Review period: 90 days after implementation.' },
    { id: 'sr_4', title: 'Contract Employee Leave Policy', snippet: 'Contract employees are entitled to 12 days of annual leave pro-rated based on contract duration. No carry-forward permitted.', relevanceScore: 76, source: 'contract_leave.pdf', sourceType: 'policy', date: '2025-08-20', team: 'HR', previewContent: 'CONTRACT EMPLOYEE LEAVE POLICY\n\nAnnual Leave: 12 days (pro-rated)\nSick Leave: 5 days\nPublic Holidays: As per office calendar\nCarry Forward: Not permitted\nNotice Period: Leave cannot be taken during the final 2 weeks of a contract.' },
    { id: 'sr_5', title: 'Employee Handbook 2026 Edition', snippet: 'Comprehensive employee handbook covering code of conduct, leave policies, benefits, and workplace guidelines for all employees.', relevanceScore: 71, source: 'employee_handbook_2026.pdf', sourceType: 'pdf', date: '2026-01-01', team: 'HR', previewContent: 'EMPLOYEE HANDBOOK 2026\n\nChapter 7: Leave & Time Off\nSection 7.1: Annual Leave — 24 days per year\nSection 7.2: Sick Leave — 10 days per year, medical certificate required for 3+ consecutive days\nSection 7.3: Parental Leave — See Sections 7.3.1 (Maternity) and 7.3.2 (Paternity)' },
    { id: 'sr_6', title: 'Attendance & Leave Tracker Dashboard', snippet: 'Real-time dashboard showing team-level leave utilization, pending approvals, and seasonal patterns.', relevanceScore: 65, source: 'leave_tracker.xlsx', sourceType: 'spreadsheet', date: '2026-05-15', team: 'Analytics', previewContent: 'LEAVE TRACKER DASHBOARD\n\nTeam utilization Q2 2026:\n- Engineering: 78% leave utilized\n- Sales: 62% leave utilized\n- HR: 85% leave utilized\n- Marketing: 71% leave utilized\n\nPending approvals: 14\nAverage approval time: 1.2 days' },
  ],
  followUpPrompts: [
    'What is the carry-forward policy?',
    'Compare leave policies for contract vs full-time',
    'Summarize key changes from 2025 to 2026',
  ],
};

// ── Multi-Agent Response (conflict scenario) ─────────────────────────────────
export interface MultiAgentResponseData {
  title: string;
  summary: string;
  hasConflict: boolean;
  conflictDescription: string;
  agentOutputs: {
    agentKey: string;
    agentName: string;
    agentColor: string;
    executionTime: string;
    responseType: 'strategy' | 'data' | 'research' | 'search';
    // Each agent's data is one of the response types above
  }[];
  followUpPrompts: string[];
}

export const MULTI_AGENT_RESPONSE: MultiAgentResponseData = {
  title: 'Multi-Agent Analysis: Q3 Performance & Q4 Strategy',
  summary: 'The Data Analyst Agent found Q3 revenue of $61.4M exceeding targets, but identified a concerning churn spike in W10. The Strategy Agent built a Q4 growth plan assuming continued momentum. Note: there is a conflict between the agents on Q4 margin outlook — review both sections carefully.',
  hasConflict: true,
  conflictDescription: 'The Data Analyst found declining Q3 margins (from 72% to 68%) while the Strategy Agent\'s Q4 recommendation assumes margin expansion to 74%. Review both sections before acting.',
  agentOutputs: [
    { agentKey: 'data', agentName: 'Data Analyst Agent', agentColor: '#0FC4A7', executionTime: '2.4s', responseType: 'data' },
    { agentKey: 'strategy', agentName: 'Strategy Agent', agentColor: '#4A6CF7', executionTime: '3.1s', responseType: 'strategy' },
  ],
  followUpPrompts: [
    'Reconcile the margin discrepancy',
    'What would Q4 look like with flat margins?',
    'Show a conservative vs optimistic scenario',
  ],
};

// ── Inline UI Injection Data ─────────────────────────────────────────────────

// Inline chart data — rendered inside a chat bubble when data is referenced
export const INLINE_CHART_DATA = {
  title: 'Revenue Trend (Quick View)',
  data: [
    { month: 'Apr', value: 42.1 },
    { month: 'May', value: 45.8 },
    { month: 'Jun', value: 48.2 },
    { month: 'Jul', value: 48.2 },
    { month: 'Aug', value: 53.7 },
    { month: 'Sep', value: 61.4 },
  ],
  xKey: 'month',
  yKey: 'value',
  color: '#0FC4A7',
};

// Inline comparison table — rendered inside a chat bubble when comparing options
export const INLINE_TABLE_DATA = {
  title: 'Quick Comparison: Enterprise vs SMB',
  headers: ['Metric', 'Enterprise', 'SMB'],
  rows: [
    ['Avg Deal Size', '$180K ARR', '$12K ARR'],
    ['Sales Cycle', '14 months', '21 days'],
    ['Win Rate', '18%', '34%'],
    ['Churn Rate', '0.8%', '3.2%'],
  ],
};

// Inline form fields — shown when ESA needs context (deterministic: "build" or "create" in strategy queries)
export const INLINE_FORM_FIELDS = [
  { id: 'target_market', label: 'Target Market', placeholder: 'e.g. India enterprise, APAC SMB', type: 'text' as const },
  { id: 'budget_range', label: 'Budget Range', placeholder: 'e.g. $500K - $1M', type: 'text' as const },
  { id: 'timeline', label: 'Timeline', placeholder: 'e.g. 6 months, Q4 2026', type: 'text' as const },
];

// ── Helper: get citations by IDs ─────────────────────────────────────────────
export function getCitationsById(ids: number[]): Citation[] {
  return ids.map((id) => MOCK_CITATIONS.find((c) => c.id === id)).filter(Boolean) as Citation[];
}
