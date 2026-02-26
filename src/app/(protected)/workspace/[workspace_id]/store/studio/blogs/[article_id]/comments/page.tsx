'use client';

import React, { use } from 'react';
import CommentsListContainer from '@/components/workspace/store/studio/blogs/comments/CommentsListContainer';

export default function ArticleCommentsPage({ params }: { params: Promise<{ article_id: string }> }) {
  const { article_id } = use(params);
  return <CommentsListContainer articleId={article_id} />;
}
