export type CaseCardProps = {
  id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  documentCount?: number;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  showOwner?: boolean;
  userRole?: "CLIENT" | "LAWYER" | "ADMIN";
  hasAccess?: boolean;
  grantedAt?: Date | string | null;
  hasPendingRequest?: boolean;
  requestedAt?: Date | string | null;
  onRequestAccess?: (caseId: string) => void;
  onWithdrawRequest?: (caseId: string) => void;
  onRequestSuccess?: (caseId: string) => void;
  onRequestError?: (message: string) => void;
  onWithdrawSuccess?: (caseId: string) => void;
  onWithdrawError?: (message: string) => void;
  onEdit?: (caseId: string) => void;

}