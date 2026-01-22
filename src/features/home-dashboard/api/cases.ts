import { apiClient } from '@/shared/api';
import type { Case, CaseStats } from '../model';

export const getCasesStats = async (): Promise<CaseStats> => {
  console.log('HomeDashboard API: Fetching cases for authenticated user');
  
  const response = await apiClient.get('/api/cases?limit=5&page=1') as any;
  
  if (response.success && response.data) {
    const allCases: Case[] = response.data.cases || [];
    const stats: CaseStats = {
      total: response.data.pagination?.total || allCases.length,
      open: allCases.filter((c: Case) => c.status === 'OPEN').length,
      closed: allCases.filter((c: Case) => c.status === 'CLOSED').length,
      recent: allCases.slice(0, 3)
    };
    
    return stats;
  }
  
  throw new Error('Failed to fetch cases data');
};