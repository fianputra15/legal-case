"use client";
import { MainLayout } from "@/widgets/layout";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient, ApiError } from "@/shared/api";

interface EditCaseForm {
  title: string;
  category: string;
  description: string;
}

interface CaseData {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  priority: number;
}


const categoryOptions = [
    { value: "CRIMINAL_LAW", label: "Criminal Law" },
    { value: "CIVIL_LAW", label: "Civil Law" },
    { value: "CORPORATE_LAW", label: "Corporate Law" },
    { value: "FAMILY_LAW", label: "Family Law" },
    { value: "IMMIGRATION_LAW", label: "Immigration Law" },
    { value: "INTELLECTUAL_PROPERTY", label: "Intellectual Property" },
    { value: "LABOR_LAW", label: "Labor Law" },
    { value: "REAL_ESTATE", label: "Real Estate" },
    { value: "TAX_LAW", label: "Tax Law" },
    { value: "OTHER", label: "Other" },
];


interface EditCasePageProps {
  caseId: string;
}

export function EditCasePage({ caseId }: EditCasePageProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [form, setForm] = useState<EditCaseForm>({
    title: "",
    category: "",
    description: "",
  });

  // Fetch case data
  useEffect(() => {
    const fetchCase = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<{ data: CaseData }>(`/api/cases/${caseId}`);
        const case_data = response.data;
        setCaseData(case_data);
        setForm({
          title: case_data.title,
          category: case_data.category,
          description: case_data.description,
        });
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

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "priority" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Basic client-side validation
      if (!form.title.trim() || !form.category || !form.description.trim()) {
        throw new Error("Please fill in all required fields");
      }

      await apiClient.patch(`/api/cases/${caseId}`, form);
      
      // Redirect back to my-cases with success message
      router.push("/my-cases?updated=true");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update case");
      }
      console.error("Error updating case:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <MainLayout headerTitle="Edit Case" showFooter={false}>
        <div className="flex items-center justify-center min-h-64">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sub600">Loading case...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error && !caseData) {
    return (
      <MainLayout headerTitle="Edit Case" showFooter={false}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-6">
          <div className="flex items-center">
            <div className="text-red-600 text-lg mr-2">⚠️</div>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout headerTitle="Edit Case" showFooter={false}>
      <div className="mx-auto bg-white p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 text-lg mr-2">⚠️</div>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-strong900 mb-2"
            >
              Case Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter a descriptive title for your case"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-colors"
              required
            />
          </div>

          {/* Case Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-strong900 mb-2"
            >
              Legal Category *
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-colors"
              required
            >
              <option value="">Select a legal category</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Case Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-strong900 mb-2"
            >
              Case Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              placeholder="Provide detailed information about your case..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-colors resize-vertical"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-sub600 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Update Case"
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}