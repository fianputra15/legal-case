import { CreateCaseFormData, CaseData, ApiResponse } from "@/shared/types";

export interface CreateCaseResponse {
  success: boolean;
  data?: CaseData;
  error?: string;
}

export const createCase = async (caseData: CreateCaseFormData): Promise<CreateCaseResponse> => {
  const response = await fetch("/api/cases", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(caseData),
  });

  const data: ApiResponse<CaseData> = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return {
    success: data.success,
    data: data.data,
    error: data.message,
  };
};