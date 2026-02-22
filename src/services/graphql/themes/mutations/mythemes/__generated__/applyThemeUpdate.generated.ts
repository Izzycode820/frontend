import * as Types from '../../../../../../types/themes/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ApplyThemeUpdateMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
}>;


export type ApplyThemeUpdateMutation = { __typename?: 'Mutation', applyThemeUpdate: { __typename?: 'ApplyThemeUpdate', success: boolean | null, message: string | null, error: string | null } | null };


export const ApplyThemeUpdateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApplyThemeUpdate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"applyThemeUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<ApplyThemeUpdateMutation, ApplyThemeUpdateMutationVariables>;