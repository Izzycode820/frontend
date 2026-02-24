import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type UpdateNavigationMutationVariables = Types.Exact<{
  workspaceId: Types.Scalars['ID']['input'];
  id: Types.Scalars['ID']['input'];
  input: Types.NavigationInput;
}>;


export type UpdateNavigationMutation = { __typename?: 'Mutation', navigationUpdate: { __typename?: 'NavigationUpdate', success: boolean | null, error: string | null, navigation: { __typename?: 'NavigationType', id: string, title: string, handle: string } | null } | null };


export const UpdateNavigationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateNavigation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NavigationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"navigationUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"navigation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<UpdateNavigationMutation, UpdateNavigationMutationVariables>;