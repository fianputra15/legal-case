import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCase} from "../api";
import { CreateCaseFormData } from "@/shared/types";

export function useCreateCase() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateCase = async (formData: CreateCaseFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Basic client-side validation
      if (!formData.title.trim() || !formData.category || !formData.description.trim()) {
        throw new Error("Please fill in all required fields");
      }

      const result = await createCase(formData);

      if (result.success) {
        // Redirect to the cases page or show success message
        router.push("/my-cases?created=true");
        return { success: true };
      } else {
        throw new Error(result.error || "Failed to create case");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create case";
      setError(errorMessage);
      console.error("Error creating case:", err);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    isSubmitting,
    error,
    handleCreateCase,
    clearError,
  };
}