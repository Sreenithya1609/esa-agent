// ESA Mock Citations / Sources — used by CitationBadge, SourcePopover, SourcesPanel

export interface Citation {
  id: number;
  name: string;
  type: 'document' | 'web' | 'database';
  url: string;
  reliabilityScore: number; // 1-5
  excerpt: string;
  dateIndexed: string;
}

export const MOCK_CITATIONS: Citation[] = [
  { id: 1, name: 'Q3 Revenue Report 2026', type: 'document', url: '/docs/q3-revenue-2026.pdf', reliabilityScore: 5, excerpt: 'Total Q3 revenue reached $61.4M, representing a 14.3% increase over Q2 and exceeding the quarterly target of $58M by 5.9%.', dateIndexed: '2026-05-15' },
  { id: 2, name: 'Gartner SaaS Market Report', type: 'web', url: 'https://gartner.com/saas-market-2026', reliabilityScore: 5, excerpt: 'The global SaaS market is projected to reach $295B by 2027, driven by enterprise digital transformation and AI-native platforms.', dateIndexed: '2026-04-28' },
  { id: 3, name: 'Salesforce 10-K Filing', type: 'web', url: 'https://sec.gov/salesforce-10k', reliabilityScore: 5, excerpt: 'Salesforce reported $36.8B in annual revenue for FY2026, with enterprise segment growing 22% year-over-year.', dateIndexed: '2026-05-01' },
  { id: 4, name: 'Internal CRM Analytics', type: 'database', url: '/data/crm-analytics', reliabilityScore: 4, excerpt: 'Customer acquisition cost (CAC) averaged $142 in Q3, down 12% from Q2 due to improved organic channel performance.', dateIndexed: '2026-05-20' },
  { id: 5, name: 'McKinsey India SaaS Report', type: 'web', url: 'https://mckinsey.com/india-saas-2026', reliabilityScore: 4, excerpt: 'India\'s SaaS industry is on track to generate $35B in revenue by 2027, with AI-powered analytics emerging as the fastest-growing segment.', dateIndexed: '2026-03-15' },
  { id: 6, name: 'HR Policy Document v4.2', type: 'document', url: '/docs/hr-policy-v4.2.pdf', reliabilityScore: 5, excerpt: 'Remote employees are entitled to 24 days of annual leave. Work-from-home arrangements require manager approval and quarterly in-office check-ins.', dateIndexed: '2026-01-10' },
  { id: 7, name: 'Competitor Pricing Analysis', type: 'document', url: '/docs/competitor-pricing.xlsx', reliabilityScore: 4, excerpt: 'Among the top 5 CRM vendors, pricing ranges from $29/user/month (Pipedrive) to $165/user/month (Salesforce Enterprise).', dateIndexed: '2026-05-08' },
  { id: 8, name: 'Snowflake Analytics DW', type: 'database', url: '/data/snowflake', reliabilityScore: 4, excerpt: 'Churn rate for Q3 was 2.1%, down from 2.5% in Q2. Enterprise segment showed the lowest churn at 0.8%.', dateIndexed: '2026-05-21' },
  { id: 9, name: 'Board Strategy Deck Q2', type: 'document', url: '/docs/board-strategy-q2.pptx', reliabilityScore: 3, excerpt: 'Strategic priority for H2 2026 is APAC expansion with a focus on India and Southeast Asia markets.', dateIndexed: '2026-04-15' },
  { id: 10, name: 'Industry Forum Thread', type: 'web', url: 'https://forum.saas/thread-8291', reliabilityScore: 2, excerpt: 'Several SaaS founders report that pricing above $50/user/month in emerging markets leads to significantly lower conversion rates.', dateIndexed: '2026-05-10' },
  { id: 11, name: 'Customer NPS Survey Q3', type: 'document', url: '/docs/nps-q3-2026.csv', reliabilityScore: 5, excerpt: 'NPS improved to 62 in Q3 from 54 in Q2, driven by improved onboarding experience and faster support response times.', dateIndexed: '2026-05-18' },
  { id: 12, name: 'Market Entry Playbook', type: 'document', url: '/docs/market-entry-playbook.pdf', reliabilityScore: 3, excerpt: 'Successful market entry in APAC typically requires 12-18 months of groundwork, local partnerships, and regulatory compliance.', dateIndexed: '2026-02-20' },
];
