import { useState, useCallback } from "react";
import { 
  requestCaseAccess, 
  withdrawAccessRequest, 
  approveLawyerAccess, 
  rejectAccessRequest 
} from "../api";
import { ApiError } from "@/shared/api";

export function useAccessRequest() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRequestAccess = useCallback(async (
    caseId: string, 
    onSuccess?: (caseId: string) => void,
    onError?: (message: string) => void
  ) => {
    try {
      setIsRequesting(true);
      const response = await requestCaseAccess(caseId);
      
      if (response.success) {
        onSuccess?.(caseId);
      }
    } catch (error) {
      const message = error instanceof ApiError 
        ? error.message 
        : 'Failed to request access';
      onError?.(message);
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const handleWithdrawRequest = useCallback(async (
    caseId: string,
    onSuccess?: (caseId: string) => void,
    onError?: (message: string) => void
  ) => {
    try {
      setIsWithdrawing(true);
      const response = await withdrawAccessRequest(caseId);
      
      if (response.success) {
        onSuccess?.(caseId);
      }
    } catch (error) {
      const message = error instanceof ApiError 
        ? error.message 
        : 'Failed to withdraw request';
      onError?.(message);
    } finally {
      setIsWithdrawing(false);
    }
  }, []);

  const handleApproveAccess = useCallback(async (
    caseId: string,
    lawyerId: string,
    onSuccess?: (requestId: string) => void,
    onError?: (message: string) => void
  ) => {
    try {
      setIsProcessing(true);
      const response = await approveLawyerAccess(caseId, lawyerId);
      
      if (response.success) {
        onSuccess?.(lawyerId);
      }
    } catch (error) {
      const message = error instanceof ApiError 
        ? error.message 
        : 'Failed to approve access';
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleRejectRequest = useCallback(async (
    caseId: string,
    lawyerId: string,
    requestId: string,
    onSuccess?: (requestId: string) => void,
    onError?: (message: string) => void
  ) => {
    try {
      setIsProcessing(true);
      const response = await rejectAccessRequest(caseId, lawyerId);
      
      if (response.success) {
        onSuccess?.(requestId);
      }
    } catch (error) {
      const message = error instanceof ApiError 
        ? error.message 
        : 'Failed to reject request';
      onError?.(message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    // State
    isRequesting,
    isWithdrawing,
    isProcessing,
    
    // Actions
    handleRequestAccess,
    handleWithdrawRequest,
    handleApproveAccess,
    handleRejectRequest,
  };
}