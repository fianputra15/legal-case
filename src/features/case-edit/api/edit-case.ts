import { apiClient } from "@/shared/api";
import {
  EditCaseForm,
  CaseData,
  ApiResponse,
} from "@/shared/types";

export interface EditCaseResponse {
  success: boolean;
  data?: CaseData;
  error?: string;
}

export const fetchCase = async (caseId: string): Promise<CaseData> => {
  const response = await apiClient.get<Promise<{ data: CaseData }>>(
    `/api/cases/${caseId}`,
    {
      credentials: "include",
    },
  );
  const { data } = response;
  return data;
};

export const updateCase = async (
  caseId: string,
  formData: EditCaseForm,
): Promise<EditCaseResponse> => {
  const response = await apiClient.patch<ApiResponse<CaseData>>(
    `/api/cases/${caseId}`,
    formData,
    {
      credentials: "include",
    },
  );
  return response as EditCaseResponse;
};
