// ESA Audit & Function Log Mock Data — used by InstructionProvenance and FunctionLog
import type { AgentKey } from '@/lib/mockData';

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  userInitials: string;
  action: 'prompt_change' | 'permission_change' | 'function_call' | 'config_change';
  module: string;
  agentKey?: AgentKey;
  details: string;
  before?: string;
  after?: string;
}

export interface FunctionLogEntry {
  id: string;
  timestamp: string;
  queryText: string;
  agentKey: AgentKey;
  functionName: string;
  duration: string;
  status: 'success' | 'error' | 'timeout';
  input: string;
  output: string;
}

export const AUDIT_LOG: AuditEntry[] = [
  { id: 'aud_01', timestamp: '2026-05-21 14:32:01', user: 'Arjun Mehta', userInitials: 'AM', action: 'prompt_change', module: 'Strategy Agent', agentKey: 'strategy', details: 'Updated system prompt to include India market context', before: 'You are a senior strategy consultant. Analyze business data...', after: 'You are a senior strategy consultant. Always consider India market dynamics first. Analyze business data...' },
  { id: 'aud_02', timestamp: '2026-05-21 12:15:30', user: 'Priya Nair', userInitials: 'PN', action: 'permission_change', module: 'Data Analyst Agent', agentKey: 'data', details: 'Granted access to snowflake_db', before: 'Denied', after: 'Permitted' },
  { id: 'aud_03', timestamp: '2026-05-20 16:45:12', user: 'Arjun Mehta', userInitials: 'AM', action: 'prompt_change', module: 'Research Agent', agentKey: 'research', details: 'Added source reliability scoring requirement', before: 'Conduct external research on markets...', after: 'Conduct external research on markets. Always cite sources with reliability scores (1-5)...' },
  { id: 'aud_04', timestamp: '2026-05-20 11:20:00', user: 'Rahul Sharma', userInitials: 'RS', action: 'permission_change', module: 'Search Agent', agentKey: 'search', details: 'Revoked access to competitor_filings/', before: 'Permitted', after: 'Denied' },
  { id: 'aud_05', timestamp: '2026-05-19 15:33:45', user: 'Arjun Mehta', userInitials: 'AM', action: 'config_change', module: 'Memory', details: 'Changed data retention from 90 to 180 days' },
  { id: 'aud_06', timestamp: '2026-05-19 10:05:22', user: 'Meera Iyer', userInitials: 'MI', action: 'prompt_change', module: 'Data Analyst Agent', agentKey: 'data', details: 'Added anomaly detection instructions', before: 'Analyze datasets, detect anomalies...', after: 'Analyze datasets with statistical rigor. Flag anomalies using 2σ threshold...' },
  { id: 'aud_07', timestamp: '2026-05-18 14:12:00', user: 'Arjun Mehta', userInitials: 'AM', action: 'prompt_change', module: 'Strategy Agent', agentKey: 'strategy', details: 'Adjusted output format to include risk matrix', before: 'Structure output as: Situation → Objectives → Strategy → Tactics → KPIs.', after: 'Structure output as: Situation → Objectives → Strategy → Tactics → KPIs → Risks. Include a 3×3 risk matrix.' },
  { id: 'aud_08', timestamp: '2026-05-17 09:30:00', user: 'Priya Nair', userInitials: 'PN', action: 'permission_change', module: 'Research Agent', agentKey: 'research', details: 'Granted access to market_research/', before: 'Denied', after: 'Permitted' },
  { id: 'aud_09', timestamp: '2026-05-16 16:00:00', user: 'Karan Bose', userInitials: 'KB', action: 'config_change', module: 'Brand Voice', details: 'Updated brand voice to formal, data-driven tone' },
  { id: 'aud_10', timestamp: '2026-05-15 11:45:00', user: 'Arjun Mehta', userInitials: 'AM', action: 'prompt_change', module: 'Search Agent', agentKey: 'search', details: 'Added document metadata requirements', before: 'Search across internal documents...', after: 'Search across internal documents. Always show title, type, date, owning team for each result.' },
];

export const FUNCTION_LOG: FunctionLogEntry[] = [
  { id: 'fn_01', timestamp: '2026-05-21 14:32:05', queryText: 'Show Q3 revenue trends', agentKey: 'data', functionName: 'readDataSource', duration: '0.8s', status: 'success', input: '{ "source": "sales_data.csv", "range": "Q3 2026" }', output: '{ "rows": 847, "columns": 12, "dateRange": "Jul-Sep 2026" }' },
  { id: 'fn_02', timestamp: '2026-05-21 14:32:06', queryText: 'Show Q3 revenue trends', agentKey: 'data', functionName: 'detectAnomalies', duration: '1.2s', status: 'success', input: '{ "column": "revenue", "method": "zscore", "threshold": 2 }', output: '{ "anomalies": 3, "indices": [42, 78, 156] }' },
  { id: 'fn_03', timestamp: '2026-05-21 14:32:07', queryText: 'Show Q3 revenue trends', agentKey: 'data', functionName: 'generateChart', duration: '0.4s', status: 'success', input: '{ "type": "line", "xKey": "date", "yKey": "revenue" }', output: '{ "chartId": "ch_291", "dataPoints": 92 }' },
  { id: 'fn_04', timestamp: '2026-05-21 13:15:00', queryText: 'Build GTM strategy for APAC', agentKey: 'strategy', functionName: 'analyzeMarket', duration: '2.1s', status: 'success', input: '{ "region": "APAC", "vertical": "SaaS" }', output: '{ "tam": "$12.4B", "growth": "18%", "competitors": 23 }' },
  { id: 'fn_05', timestamp: '2026-05-21 13:15:02', queryText: 'Build GTM strategy for APAC', agentKey: 'research', functionName: 'searchExternal', duration: '3.4s', status: 'success', input: '{ "query": "APAC SaaS market 2026-2027" }', output: '{ "sources": 12, "avgReliability": 3.8 }' },
  { id: 'fn_06', timestamp: '2026-05-21 13:15:04', queryText: 'Build GTM strategy for APAC', agentKey: 'strategy', functionName: 'buildFramework', duration: '1.8s', status: 'success', input: '{ "template": "GTM Strategy Document", "market": "APAC" }', output: '{ "sections": 8, "actionItems": 14 }' },
  { id: 'fn_07', timestamp: '2026-05-21 11:00:00', queryText: 'Find HR leave policy for remote workers', agentKey: 'search', functionName: 'semanticSearch', duration: '1.1s', status: 'success', input: '{ "query": "remote work leave policy", "sources": ["hr_policy_drive/"] }', output: '{ "results": 8, "topRelevance": 0.94 }' },
  { id: 'fn_08', timestamp: '2026-05-21 10:30:00', queryText: 'Benchmark pricing vs Salesforce', agentKey: 'research', functionName: 'competitorLookup', duration: '2.8s', status: 'success', input: '{ "competitor": "Salesforce", "metrics": ["pricing", "features"] }', output: '{ "dataPoints": 24, "lastUpdated": "2026-05-15" }' },
  { id: 'fn_09', timestamp: '2026-05-20 16:00:00', queryText: 'Analyze churn by cohort', agentKey: 'data', functionName: 'readDataSource', duration: '0.6s', status: 'success', input: '{ "source": "snowflake_db", "query": "SELECT * FROM churn_cohorts" }', output: '{ "rows": 1240, "cohorts": 6 }' },
  { id: 'fn_10', timestamp: '2026-05-20 16:00:02', queryText: 'Analyze churn by cohort', agentKey: 'data', functionName: 'generateChart', duration: '0.5s', status: 'success', input: '{ "type": "bar", "xKey": "cohort", "yKey": "churnRate" }', output: '{ "chartId": "ch_288", "dataPoints": 6 }' },
  { id: 'fn_11', timestamp: '2026-05-20 14:00:00', queryText: 'Market size of India fintech', agentKey: 'research', functionName: 'searchExternal', duration: '4.2s', status: 'timeout', input: '{ "query": "India fintech market size 2026-2030" }', output: '{ "error": "Request timed out after 4s" }' },
  { id: 'fn_12', timestamp: '2026-05-20 14:00:05', queryText: 'Market size of India fintech', agentKey: 'research', functionName: 'searchExternal', duration: '2.1s', status: 'success', input: '{ "query": "India fintech market size 2026-2030", "retry": true }', output: '{ "sources": 8, "avgReliability": 3.2 }' },
  { id: 'fn_13', timestamp: '2026-05-19 09:00:00', queryText: 'Weekly revenue summary', agentKey: 'data', functionName: 'aggregateMetrics', duration: '1.4s', status: 'success', input: '{ "period": "week", "metrics": ["revenue", "arpu", "churn"] }', output: '{ "revenue": "$2.4M", "arpu": "$49", "churn": "2.1%" }' },
  { id: 'fn_14', timestamp: '2026-05-18 15:30:00', queryText: 'Compare CRM vendors', agentKey: 'research', functionName: 'buildMatrix', duration: '2.6s', status: 'success', input: '{ "vendors": ["Salesforce", "HubSpot", "Zoho", "Pipedrive"] }', output: '{ "dimensions": 8, "vendors": 4 }' },
  { id: 'fn_15', timestamp: '2026-05-18 11:00:00', queryText: 'ESA compliance gap analysis', agentKey: 'search', functionName: 'semanticSearch', duration: '1.8s', status: 'success', input: '{ "query": "compliance gaps Q2 2026", "sources": ["compliance_docs/"] }', output: '{ "results": 14, "gaps": 5 }' },
];
