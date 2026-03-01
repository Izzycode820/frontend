import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type SyncOrderPaymentStatusMutationVariables = Types.Exact<{
  orderId: Types.Scalars['String']['input'];
}>;


export type SyncOrderPaymentStatusMutation = { __typename?: 'Mutation', syncOrderPaymentStatus: { __typename?: 'SyncOrderPaymentStatus', success: boolean | null, message: string | null, error: string | null, order: { __typename?: 'OrderType', id: string, status: Types.WorkspaceStoreOrderStatusChoices, paymentStatus: Types.WorkspaceStoreOrderPaymentStatusChoices } | null } | null };


export const SyncOrderPaymentStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncOrderPaymentStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncOrderPaymentStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentStatus"}}]}}]}}]}}]} as unknown as DocumentNode<SyncOrderPaymentStatusMutation, SyncOrderPaymentStatusMutationVariables>;