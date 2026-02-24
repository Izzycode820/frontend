import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetBlogsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetBlogsQuery = { __typename?: 'Query', blogs: { __typename?: 'BlogConnection', totalCount: number | null, edges: Array<{ __typename?: 'BlogEdge', node: { __typename?: 'BlogType', id: string, title: string, handle: string, commentPolicy: Types.WorkspaceStoreBlogCommentPolicyChoices, articleCount: number | null } | null } | null> } | null };


export const GetBlogsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBlogs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blogs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"commentPolicy"}},{"kind":"Field","name":{"kind":"Name","value":"articleCount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<GetBlogsQuery, GetBlogsQueryVariables>;