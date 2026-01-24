import { apiClient } from "@/shared/api";
import { AccessRequestResponse, WithdrawRequestResponse } from "@/shared/types";

// API functions
export async function requestCaseAccess(caseId: string): Promise<AccessRequestResponse> {
  const response = await apiClient.post<AccessRequestResponse>(`/api/cases/${caseId}/request-access`);
  return response;
}

export async function withdrawAccessRequest(caseId: string): Promise<WithdrawRequestResponse> {
  const response = await apiClient.delete<WithdrawRequestResponse>(`/api/cases/${caseId}/request-access`);
  return response;
}

export async function approveLawyerAccess(caseId: string, lawyerId: string): Promise<AccessRequestResponse> {
  const response = await apiClient.post<Promise<AccessRequestResponse>>(`/api/cases/${caseId}/access`, {
    lawyerId
  });
  return response;
}

export async function rejectAccessRequest(caseId: string, lawyerId: string): Promise<AccessRequestResponse> {
  const response = await apiClient.put<Promise<AccessRequestResponse>>(`/api/cases/${caseId}/access-requests`, {
    action: 'reject',
    lawyerId
  });
  return response;
}