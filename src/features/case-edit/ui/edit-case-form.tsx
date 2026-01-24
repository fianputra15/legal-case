"use client";
import { useState } from "react";
import { useEditCase, categoryOptions } from "../model";
import type { EditCaseForm } from "../api";

interface EditCaseFormProps {
  caseId: string;
  onCancel?: () => void;
}

export function EditCaseForm({ caseId, onCancel }: EditCaseFormProps) {
  const { 
    caseData, 
    isLoading, 
    isSubmitting, 
    error, 
    handleUpdateCase, 
    clearError 
  } = useEditCase(caseId);
  
  // Initialize form state with case data or empty values
  const [form, setForm] = useState(() => ({
    title: caseData?.title || "",
    category: caseData?.category || "",
    description: caseData?.description || "",
  }));

  // Update form when case data loads (only if form is currently empty)
  const [hasInitialized, setHasInitialized] = useState(false);
  
  if (caseData && !hasInitialized && !form.title && !form.category && !form.description) {
    setForm({
      title: caseData.title,
      category: caseData.category,
      description: caseData.description,
    });
    setHasInitialized(true);
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleUpdateCase(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sub600">Loading case...</span>
        </div>
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-6">
        <div className="flex items-center">
          <div className="text-red-600 text-lg mr-2">⚠️</div>
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
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
            onClick={onCancel}
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
  );
}