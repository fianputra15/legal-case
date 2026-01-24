export { 
  requestCaseAccess, 
  withdrawAccessRequest,
  approveLawyerAccess,
  rejectAccessRequest
} from "./access-request";

// Re-export types from shared
export type { AccessRequestResponse, WithdrawRequestResponse } from '@/shared/types';