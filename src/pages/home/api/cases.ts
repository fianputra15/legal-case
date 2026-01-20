import { apiClient } from '@/shared/api';
import type { Case, CaseStats } from '../model';

export const getCasesStats = async (): Promise<CaseStats> => {
  console.log('HomePage API: Fetching cases for authenticated user');
  
  // Fetch recent cases (limit to 5 for homepage)
  const response = await apiClient.get('/api/cases?limit=5&page=1');
  
  if (response.success && response.data) {
    // Calculate stats from the cases
    const allCases: Case[] = response.data.cases || [];
    const stats: CaseStats = {
      total: response.data.pagination?.total || allCases.length,
      open: allCases.filter((c: Case) => c.status === 'OPEN').length,
      in_progress: allCases.filter((c: Case) => c.status === 'IN_PROGRESS').length,
      closed: allCases.filter((c: Case) => c.status === 'CLOSED').length,
      recent: allCases.slice(0, 3) // Show 3 most recent
    };
    
    return stats;
  }
  
  throw new Error('Failed to fetch cases data');
};