"use client";
import { useAccessRequest } from "../model";

interface RequestAccessButtonProps {
  caseId: string;
  onSuccess?: (caseId: string) => void;
  onError?: (message: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function RequestAccessButton({ 
  caseId, 
  onSuccess, 
  onError, 
  className = "px-3 py-1.5 text-xs bg-brand text-white rounded hover:bg-brand-orange-600 transition-colors cursor-pointer",
  children = "Request Access"
}: RequestAccessButtonProps) {
  const { isRequesting, handleRequestAccess } = useAccessRequest();

  const handleClick = () => {
    handleRequestAccess(caseId, onSuccess, onError);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRequesting}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isRequesting ? "Requesting..." : children}
    </button>
  );
}