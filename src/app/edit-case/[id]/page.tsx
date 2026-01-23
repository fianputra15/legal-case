"use client";
import { useParams } from "next/navigation";
import { EditCasePage } from "@/views/edit-case";
import { withAuthProtection } from "@/shared/HOC/withAuth";

function EditCase() {
  const params = useParams();
  const caseId = params.id as string;

  return <EditCasePage caseId={caseId} />;
}

export default withAuthProtection(EditCase);