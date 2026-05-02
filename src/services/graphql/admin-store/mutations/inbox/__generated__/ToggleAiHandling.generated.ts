import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ToggleAiHandlingMutationVariables = Types.Exact<{
  conversationId: Types.Scalars['ID']['input'];
  mode: Types.AiAutonomyModeEnum;
}>;


export type ToggleAiHandlingMutation = { __typename?: 'Mutation', toggleAiHandling: { __typename?: 'ToggleAiHandlingMutation', success: boolean | null, conversation: { __typename?: 'InboxConversationType', id: string, isAiActive: boolean, aiAutonomyMode: Types.AiAutonomyModeEnum | null, status: Types.WorkspaceInboxInboxConversationStatusChoices } | null } | null };


export const ToggleAiHandlingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleAiHandling"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AiAutonomyModeEnum"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleAiHandling"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"conversationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"conversation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isAiActive"}},{"kind":"Field","name":{"kind":"Name","value":"aiAutonomyMode"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<ToggleAiHandlingMutation, ToggleAiHandlingMutationVariables>;