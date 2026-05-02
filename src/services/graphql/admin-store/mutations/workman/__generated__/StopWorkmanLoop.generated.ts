import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type StopWorkmanLoopMutationVariables = Types.Exact<{
  conversationId: Types.Scalars['String']['input'];
}>;


export type StopWorkmanLoopMutation = { __typename?: 'Mutation', stopWorkmanLoop: { __typename?: 'StopWorkmanLoop', success: boolean | null, message: string | null } | null };


export const StopWorkmanLoopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StopWorkmanLoop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopWorkmanLoop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"conversationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<StopWorkmanLoopMutation, StopWorkmanLoopMutationVariables>;