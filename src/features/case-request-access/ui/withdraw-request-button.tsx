"use client";
import { useAccessRequest } from "../model";

interface WithdrawRequestButtonProps {
  caseId: string;
  onSuccess?: (caseId: string) => void;
  onError?: (message: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function WithdrawRequestButton({ 
  caseId, 
  onSuccess, 
  onError, 
  className = "px-3 py-1.5 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors cursor-pointer",
  children = "Withdraw"
}: WithdrawRequestButtonProps) {
  const { isWithdrawing, handleWithdrawRequest } = useAccessRequest();

  const handleClick = () => {
    handleWithdrawRequest(caseId, onSuccess, onError);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isWithdrawing}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isWithdrawing ? "Withdrawing..." : children}
    </button>
  );
}