import { apiClient } from "@/shared/api";

// Types
export interface AccessRequestResponse {
  success: boolean;
  message: string;
  requestSubmitted: boolean;
}

export interface WithdrawRequestResponse {
  success: boolean;
  message: string;
}

// API functions
export async function requestCaseAccess(caseId: string): Promise<AccessRequestResponse> {
  const response = await apiClient.post<AccessRequestResponse>(`/api/cases/${caseId}/request-access`);
  return response;
}

export async function withdrawAccessRequest(caseId: string): Promise<WithdrawRequestResponse> {
  const response = await apiClient.delete<WithdrawRequestResponse>(`/api/cases/${caseId}/request-access`);
  return response;
}

export async function approveLawyerAccess(caseId: string, lawyerId: string): Promise<any> {
  const response = await apiClient.post(`/api/cases/${caseId}/access`, {
    lawyerId
  });
  return response;
}

export async function rejectAccessRequest(caseId: string, lawyerId: string, requestId: string): Promise<any> {
  const response = await apiClient.put(`/api/cases/${caseId}/access-requests`, {
    action: 'reject',
    lawyerId
  });
  return response;
}