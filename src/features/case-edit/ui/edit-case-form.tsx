"use client";
import {  useState } from "react";
import { useEditCase, categoryOptions, statusOptions } from "../model";
import { FormField } from "@/shared/ui";
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
    status: caseData?.status || "OPEN",
  }));

  // Update form when caseData changes
  const formData = {
    title: caseData?.title || "",
    category: caseData?.category || "",
    description: caseData?.description || "",
    status: caseData?.status || "OPEN",
  };

  // Only update form if caseData has actually changed
  if (caseData && (
    form.title !== formData.title ||
    form.category !== formData.category ||
    form.description !== formData.description ||
    form.status !== formData.status
  )) {
    setForm(formData);
  }


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Allow only status changes when case is closed
    if (isCaseClosed && name !== 'status') {
      return;
    }
    
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

  // Check if case is closed to disable editing
  const originalIsClosed = caseData?.status === 'CLOSED';
  const isCaseClosed = originalIsClosed && form.status === 'CLOSED';
  const isReopening = originalIsClosed && form.status === 'OPEN';

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
      {isCaseClosed && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-amber-600 text-lg mr-2">🔒</div>
            <p className="text-amber-700 text-sm">
              This case is closed and cannot be edited. Only status can be changed to reopen the case.
            </p>
          </div>
        </div>
      )}

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
        <FormField
          name="title"
          label="Case Title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter a descriptive title for your case"
          className={isCaseClosed ? 'bg-gray-100' : ''}
          disabled={isCaseClosed}
          required
        />

        {/* Case Category */}
        <FormField
          type="select"
          name="category"
          label="Legal Category"
          value={form.category}
          onChange={handleChange}
          options={categoryOptions}
          placeholder="Select a legal category"
          className={isCaseClosed ? 'bg-gray-100' : ''}
          disabled={isCaseClosed}
          required
        />

        {/* Case Status */}
        <FormField
          type="select"
          name="status"
          label="Case Status"
          value={form.status}
          onChange={handleChange}
          options={statusOptions}
          hint={form.status === 'CLOSED' ? 'Closing this case will prevent further edits and document uploads' : undefined}
        />

        {/* Case Description */}
        <FormField
          type="textarea"
          name="description"
          label="Case Description"
          value={form.description}
          onChange={handleChange}
          placeholder="Provide detailed information about your case..."
          rows={6}
          className={isCaseClosed ? 'bg-gray-100' : ''}
          disabled={isCaseClosed}
          required
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-sub600 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            {isCaseClosed ? 'Back' : 'Cancel'}
          </button>
          {!isCaseClosed && (
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
          )}
          {/* Special button for reopening closed cases */}
          {isReopening && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Reopening...
                </div>
              ) : (
                "Reopen Case"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}