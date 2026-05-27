// ESA Analyst Preference Mock Items — used by AnalystPreferences component

export const MEMORY_ITEMS: string[] = [
  'You prefer bar charts over line charts',
  'You usually ask for executive-level summaries',
  'You query sales_data.csv in 80% of sessions',
  'You typically request Q3 data first when analyzing revenue',
  'You prefer GTM Strategy Document template for strategy queries',
  'You reference competitor pricing frequently',
  'You request Indian market context in 60% of research queries',
  'You prefer data tables alongside charts for comparison views',
];

// Default glossary terms — used by MemorySettings
export const DEFAULT_GLOSSARY: { term: string; definition: string }[] = [
  { term: 'ARR', definition: 'Annual Recurring Revenue — total annualized value of all active subscription contracts.' },
  { term: 'MRR', definition: 'Monthly Recurring Revenue — total monthly value of active subscriptions.' },
  { term: 'NPS', definition: 'Net Promoter Score — customer loyalty metric ranging from -100 to 100.' },
  { term: 'TAM', definition: 'Total Addressable Market — total revenue opportunity if 100% market share is achieved.' },
  { term: 'CAC', definition: 'Customer Acquisition Cost — average cost to acquire a new customer.' },
  { term: 'LTV', definition: 'Lifetime Value — total revenue expected from a single customer over the relationship.' },
  { term: 'GTM', definition: 'Go-To-Market — strategy and plan for launching a product to market.' },
];

// Default report sections — used by drag-and-drop section builder
export const DEFAULT_REPORT_SECTIONS: { id: string; name: string; visible: boolean }[] = [
  { id: 'sec_1', name: 'Executive Summary', visible: true },
  { id: 'sec_2', name: 'Data Analysis', visible: true },
  { id: 'sec_3', name: 'Strategic Recommendations', visible: true },
  { id: 'sec_4', name: 'Action Plan', visible: true },
  { id: 'sec_5', name: 'Risks', visible: true },
  { id: 'sec_6', name: 'Appendix', visible: true },
];
