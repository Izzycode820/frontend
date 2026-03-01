import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetFapshiBalanceMutationVariables = Types.Exact<{ [key: string]: never; }>;


export type GetFapshiBalanceMutation = { __typename?: 'Mutation', getFapshiBalance: { __typename?: 'GetFapshiBalance', success: boolean | null, balance: number | null, currency: string | null, serviceName: string | null, error: string | null } | null };


export const GetFapshiBalanceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GetFapshiBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getFapshiBalance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"currency"}},{"kind":"Field","name":{"kind":"Name","value":"serviceName"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<GetFapshiBalanceMutation, GetFapshiBalanceMutationVariables>;