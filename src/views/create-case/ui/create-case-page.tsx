"use client";
import { MainLayout } from "@/widgets/layout";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateCaseForm {
  title: string;
  category: string;
  description: string;
  priority?: number;
}

const categoryOptions = [
  { value: "EMPLOYMENT_LAW", label: "Employment Law" },
  { value: "FAMILY_LAW", label: "Family Law" },
  { value: "COMMERCIAL_LAW", label: "Commercial Law" },
  { value: "INTELLECTUAL_PROPERTY", label: "Intellectual Property" },
  { value: "CRIMINAL_LAW", label: "Criminal Law" },
  { value: "CIVIL_LAW", label: "Civil Law" },
  { value: "CORPORATE_LAW", label: "Corporate Law" },
];

const priorityOptions = [
  { value: 1, label: "Low Priority" },
  { value: 2, label: "Medium Priority" },
  { value: 3, label: "High Priority" },
  { value: 4, label: "Urgent" },
];

export function CreateCasePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateCaseForm>({
    title: "",
    category: "",
    description: "",
    priority: 2,
  });

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

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        // Redirect to the cases page or show success message
        router.push("/my-cases?created=true");
      } else {
        throw new Error(data.error || "Failed to create case");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create case");
      console.error("Error creating case:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <MainLayout headerTitle="Create New Case" showFooter={false}>
      <div className="mx-auto bg-white p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-strong900 mb-2">
            Create New Legal Case
          </h1>
          <p className="text-sub600">
            Please provide the details for your new legal case. All fields marked with * are required.
          </p>
        </div>

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
            <p className="text-xs text-sub600 mt-1">
              Be specific and descriptive to help lawyers understand your case quickly.
            </p>
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
            <p className="text-xs text-sub600 mt-1">
              Choose the category that best describes your legal matter.
            </p>
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-strong900 mb-2"
            >
              Priority Level
            </label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-colors"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-sub600 mt-1">
              Indicate how urgent this case is for you.
            </p>
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
              placeholder="Provide detailed information about your case, including relevant facts, timeline, and what kind of legal assistance you need..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-colors resize-vertical"
              required
            />
            <p className="text-xs text-sub600 mt-1">
              Include as much relevant detail as possible. This helps lawyers understand your situation and provide better assistance.
            </p>
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
                  Creating...
                </div>
              ) : (
                "Create Case"
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}