import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AgentKey } from '@/lib/mockData';
import { DATA_SOURCES } from '@/mock/dataSources';

export interface PermissionDetails {
  permitted: boolean;
  grantedBy: string;
  grantedDate: string;
}

export type PermissionMatrixType = Record<AgentKey, Record<string, PermissionDetails>>;

interface PermissionsContextType {
  matrix: PermissionMatrixType;
  agentStatus: Record<AgentKey, 'active' | 'disabled'>;
  togglePermission: (agent: AgentKey, sourceId: string) => void;
  toggleAgentStatus: (agent: AgentKey) => void;
}

const defaultMatrix = (): PermissionMatrixType => {
  const agents: AgentKey[] = ['strategy', 'data', 'search', 'research'];
  const sources = DATA_SOURCES.map((ds) => ds.id);
  const matrix: Partial<PermissionMatrixType> = {};

  agents.forEach((agent) => {
    matrix[agent] = {};
    sources.forEach((sourceId) => {
      let permitted = true;
      // Default configurations for visual variance
      if (agent === 'research' && sourceId === 'ds_4') permitted = false; // snowflake
      if (agent === 'data' && sourceId === 'ds_2') permitted = false; // HR policy
      if (agent === 'strategy' && sourceId === 'ds_2') permitted = false; // HR policy
      if (agent === 'research' && sourceId === 'ds_1') permitted = false; // Sales data

      matrix[agent]![sourceId] = {
        permitted,
        grantedBy: 'Rahul Sharma',
        grantedDate: 'Apr 12 2026',
      };
    });
  });

  return matrix as PermissionMatrixType;
};

const PermissionsContext = createContext<PermissionsContextType>({
  matrix: {} as PermissionMatrixType,
  agentStatus: {
    strategy: 'active',
    data: 'active',
    search: 'active',
    research: 'active',
  },
  togglePermission: () => {},
  toggleAgentStatus: () => {},
});

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [matrix, setMatrix] = useState<PermissionMatrixType>(() => {
    try {
      const stored = localStorage.getItem('esa_permissions_matrix');
      return stored ? JSON.parse(stored) : defaultMatrix();
    } catch {
      return defaultMatrix();
    }
  });

  const [agentStatus, setAgentStatus] = useState<Record<AgentKey, 'active' | 'disabled'>>(() => {
    try {
      const stored = localStorage.getItem('esa_agent_status');
      return stored ? JSON.parse(stored) : {
        strategy: 'active',
        data: 'active',
        search: 'active',
        research: 'active',
      };
    } catch {
      return {
        strategy: 'active',
        data: 'active',
        search: 'active',
        research: 'active',
      };
    }
  });

  const togglePermission = (agent: AgentKey, sourceId: string) => {
    setMatrix((prev) => {
      const current = prev[agent][sourceId];
      const updated = {
        ...prev,
        [agent]: {
          ...prev[agent],
          [sourceId]: {
            ...current,
            permitted: !current.permitted,
            grantedBy: 'Arjun Mehta',
            grantedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          },
        },
      };
      localStorage.setItem('esa_permissions_matrix', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleAgentStatus = (agent: AgentKey) => {
    setAgentStatus((prev) => {
      const updated = {
        ...prev,
        [agent]: prev[agent] === 'active' ? 'disabled' : 'active',
      };
      localStorage.setItem('esa_agent_status', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <PermissionsContext.Provider value={{ matrix, agentStatus, togglePermission, toggleAgentStatus }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionsContext);
}
