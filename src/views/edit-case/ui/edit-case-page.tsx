"use client";
import { MainLayout } from "@/widgets/layout";
import { EditCaseForm } from "@/features/case-edit";
import { useRouter } from "next/navigation";

interface EditCasePageProps {
  caseId: string;
}

export function EditCasePage({ caseId }: EditCasePageProps) {
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };

  return (
    <MainLayout headerTitle="Edit Case" showFooter={false}>
      <EditCaseForm caseId={caseId} onCancel={handleCancel} />
    </MainLayout>
  );
}