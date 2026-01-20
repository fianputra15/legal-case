export interface Case {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface CaseStats {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  recent: Case[];
}

export interface HomePageState {
  caseStats: CaseStats | null;
  casesLoading: boolean;
  casesError: string | null;
}