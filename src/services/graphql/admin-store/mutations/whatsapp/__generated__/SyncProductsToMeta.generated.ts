import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type SyncProductsToMetaMutationVariables = Types.Exact<{
  productIds: Array<Types.Scalars['ID']['input']> | Types.Scalars['ID']['input'];
}>;


export type SyncProductsToMetaMutation = { __typename?: 'Mutation', syncProductsToMeta: { __typename?: 'SyncProductsToMeta', success: boolean | null, count: number | null, error: string | null } | null };


export const SyncProductsToMetaDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SyncProductsToMeta"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncProductsToMeta"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"productIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<SyncProductsToMetaMutation, SyncProductsToMetaMutationVariables>;