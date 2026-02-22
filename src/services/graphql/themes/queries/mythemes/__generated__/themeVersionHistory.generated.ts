import * as Types from '../../../../../../types/themes/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ThemeVersionHistoryQueryVariables = Types.Exact<{
  customizationId: Types.Scalars['ID']['input'];
}>;


export type ThemeVersionHistoryQuery = { __typename?: 'Query', themeVersionHistory: Array<{ __typename?: 'ThemeVersionType', id: string, versionNumber: string, isSystemUpdate: boolean, createdAt: string, createdByActor: Types.ThemeTemplateVersionCreatedByActorChoices, status: Types.ThemeTemplateVersionStatusChoices } | null> | null };


export const ThemeVersionHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ThemeVersionHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customizationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"themeVersionHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customizationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customizationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"versionNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isSystemUpdate"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"createdByActor"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<ThemeVersionHistoryQuery, ThemeVersionHistoryQueryVariables>;