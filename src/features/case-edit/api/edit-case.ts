import { apiClient } from "@/shared/api";

export interface EditCaseForm {
  title: string;
  category: string;
  description: string;
}

export interface CaseData {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  priority: number;
}

export interface EditCaseResponse {
  success: boolean;
  data?: CaseData;
  error?: string;
}

export const fetchCase = async (caseId: string): Promise<CaseData> => {
  const response = await apiClient.get<{ data: CaseData }>(`/api/cases/${caseId}`);
  return response.data;
};

export const updateCase = async (caseId: string, formData: EditCaseForm): Promise<EditCaseResponse> => {
  const response = await apiClient.patch(`/api/cases/${caseId}`, formData);
  return response as EditCaseResponse;
};