// ESA Mock Data Sources — used by PermissionMatrix, OrchestrationTrace, ControlRoom

export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'pdf' | 'database' | 'drive' | 'api';
  icon: string; // Lucide icon name
  status: 'connected' | 'syncing' | 'disconnected';
  lastSync: string;
  size: string;
  team: string;
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'ds_1',
    name: 'sales_data.csv',
    type: 'csv',
    icon: 'FileSpreadsheet',
    status: 'connected',
    lastSync: '2 hours ago',
    size: '2.4 MB',
    team: 'Analytics',
  },
  {
    id: 'ds_2',
    name: 'hr_policy.pdf',
    type: 'pdf',
    icon: 'FileText',
    status: 'connected',
    lastSync: '1 day ago',
    size: '8.1 MB',
    team: 'HR',
  },
  {
    id: 'ds_3',
    name: 'market_research/',
    type: 'drive',
    icon: 'FolderOpen',
    status: 'connected',
    lastSync: '5 hours ago',
    size: '42 MB',
    team: 'Market Intel',
  },
  {
    id: 'ds_4',
    name: 'snowflake_db',
    type: 'database',
    icon: 'Database',
    status: 'syncing',
    lastSync: 'syncing now',
    size: '1.2 GB',
    team: 'Engineering',
  },
  {
    id: 'ds_5',
    name: 'competitor_filings/',
    type: 'drive',
    icon: 'FolderOpen',
    status: 'connected',
    lastSync: '3 days ago',
    size: '156 MB',
    team: 'Strategy',
  },
  {
    id: 'ds_6',
    name: 'crm_api',
    type: 'api',
    icon: 'Cloud',
    status: 'connected',
    lastSync: '15 min ago',
    size: '—',
    team: 'Sales',
  },
];

// Data source IDs used in permission matrix columns
export const PERMISSION_SOURCES = DATA_SOURCES.map((ds) => ds.id);
