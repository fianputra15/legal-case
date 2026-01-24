export interface CreateCaseForm {
  title: string;
  category: string;
  description: string;
  priority?: number;
}

export interface CreateCaseResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const createCase = async (caseData: CreateCaseForm): Promise<CreateCaseResponse> => {
  const response = await fetch("/api/cases", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(caseData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
};