'use client';

import PageForm from '@/components/workspace/store/studio/pages/form/PageForm';
import { useParams } from 'next/navigation';

export default function EditPagePage() {
  const params = useParams();
  const pageId = params?.pageId as string;

  return <PageForm pageId={pageId} />;
}
