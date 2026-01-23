'use client';

import { withAuthProtection } from "@/shared/HOC/withAuth";
import { MyCasesPage } from "@/views/my-cases";

function MyCases() {
  return <MyCasesPage />;
}

export default withAuthProtection(MyCases);