"use client";
import { forwardRef } from "react";

interface BaseFormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

interface InputProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface TextareaProps extends BaseFormFieldProps {
  type: 'textarea';
  placeholder?: string;
  value: string;
  rows?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

interface SelectProps extends BaseFormFieldProps {
  type: 'select';
  value: string | number;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

type FormFieldProps = InputProps | TextareaProps | SelectProps;

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(({ label, name, required = false, hint, error, className = "", disabled = false, ...props }, ref) => {
  const baseInputClassName = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-colors ${
    error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
  } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''} ${className}`;

  const renderInput = () => {
    if ('type' in props && props.type === 'textarea') {
      const textareaProps = props as TextareaProps;
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={name}
          name={name}
          value={textareaProps.value}
          onChange={textareaProps.onChange}
          rows={textareaProps.rows || 6}
          placeholder={textareaProps.placeholder}
          className={`${baseInputClassName} resize-vertical`}
          required={required}
          disabled={disabled}
        />
      );
    }

    if ('type' in props && props.type === 'select') {
      const selectProps = props as SelectProps;
      return (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          id={name}
          name={name}
          value={selectProps.value}
          onChange={selectProps.onChange}
          className={baseInputClassName}
          required={required}
          disabled={disabled}
        >
          {selectProps.placeholder && (
            <option value="">{selectProps.placeholder}</option>
          )}
          {selectProps.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Default to input
    const inputProps = props as InputProps;
    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        type={inputProps.type || 'text'}
        id={name}
        name={name}
        value={inputProps.value}
        onChange={inputProps.onChange}
        placeholder={inputProps.placeholder}
        className={baseInputClassName}
        required={required}
        disabled={disabled}
      />
    );
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-strong900 mb-2"
      >
        {label} {required && '*'}
      </label>
      {renderInput()}
      {hint && (
        <p className="text-xs text-sub600 mt-1">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';