'use client';

import { withAuthProtection } from '@/shared/HOC/withAuth';
import { CaseDetailPage } from '@/views/case-detail';


function DetailCase() {
  return <CaseDetailPage  />;
}

export default withAuthProtection(DetailCase);