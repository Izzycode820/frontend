import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ImportTemplateMutationVariables = Types.Exact<{
  libraryId: Types.Scalars['String']['input'];
  accountId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
}>;


export type ImportTemplateMutation = { __typename?: 'Mutation', importWhatsappTemplate: { __typename?: 'ImportWhatsAppTemplate', success: boolean | null, error: string | null, template: { __typename?: 'WhatsAppTemplateType', id: string, name: string, status: Types.WorkspaceMarketingWhatsAppTemplateStatusChoices } | null } | null };


export const ImportTemplateDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ImportTemplate"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"libraryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"importWhatsappTemplate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"libraryTemplateId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"libraryId"}}},{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"template"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<ImportTemplateMutation, ImportTemplateMutationVariables>;