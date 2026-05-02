import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetMerchantChatSessionsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetMerchantChatSessionsQuery = { __typename?: 'Query', merchantChatSessions: Array<{ __typename?: 'WorkmanChatSessionType', id: string, title: string, createdAt: string, updatedAt: string }> | null };


export const GetMerchantChatSessionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMerchantChatSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"merchantChatSessions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetMerchantChatSessionsQuery, GetMerchantChatSessionsQueryVariables>;