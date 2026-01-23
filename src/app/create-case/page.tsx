'use client';

import { withAuthProtection } from '@/shared/HOC/withAuth';
import { CreateCasePage } from '@/views/create-case';

function CreateCase() {
  return <CreateCasePage />;
}

export default withAuthProtection(CreateCase);