'use client';

import { use } from 'react';
import ArticleForm from '@/components/workspace/store/studio/blogs/articles/form/ArticleForm';

export default function EditArticlePage({ params }: { params: Promise<{ article_id: string }> }) {
  const { article_id } = use(params);
  return <ArticleForm articleId={article_id} />;
}
