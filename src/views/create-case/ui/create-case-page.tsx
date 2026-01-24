"use client";
import { MainLayout } from "@/widgets/layout";
import { CreateCaseForm } from "@/features/case-create";
import { useRouter } from "next/navigation";

export function CreateCasePage() {
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };

  return (
    <MainLayout headerTitle="Create New Case" showFooter={false}>
      <CreateCaseForm onCancel={handleCancel} />
    </MainLayout>
  );
}