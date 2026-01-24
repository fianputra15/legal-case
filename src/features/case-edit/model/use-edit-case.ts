import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchCase, updateCase, type EditCaseForm, type CaseData } from "../api";
import { ApiError } from "@/shared/api";

export function useEditCase(caseId: string) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<CaseData | null>(null);

  // Fetch case data
  useEffect(() => {
    const loadCase = async () => {
      if (!caseId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCase(caseId);
        setCaseData(data);
      } catch (err) {
        console.error('Error fetching case:', err);
        if (err instanceof ApiError) {
          setError(`Failed to load case: ${err.message}`);
        } else {
          setError('Failed to load case. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCase();
  }, [caseId]);

  const handleUpdateCase = async (formData: EditCaseForm) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Basic client-side validation
      if (!formData.title.trim() || !formData.category || !formData.description.trim()) {
        throw new Error("Please fill in all required fields");
      }

      await updateCase(caseId, formData);
      alert("Case updated successfully");
      router.push("/my-cases");
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "Failed to update case";
      setError(errorMessage);
      console.error("Error updating case:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    caseData,
    isLoading,
    isSubmitting,
    error,
    handleUpdateCase,
    clearError,
  };
}