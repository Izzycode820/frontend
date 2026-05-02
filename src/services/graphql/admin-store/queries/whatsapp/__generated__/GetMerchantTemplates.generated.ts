import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetMerchantTemplatesQueryVariables = Types.Exact<{
  accountId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
}>;


export type GetMerchantTemplatesQuery = { __typename?: 'Query', marketingTemplates: Array<{ __typename?: 'WhatsAppTemplateType', id: string, name: string, category: Types.WorkspaceMarketingWhatsAppTemplateCategoryChoices, status: Types.WorkspaceMarketingWhatsAppTemplateStatusChoices, language: string, bodyText: string | null, headerText: string | null, footerText: string | null, buttons: any | null, updatedAt: string } | null> | null };


export const GetMerchantTemplatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMerchantTemplates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketingTemplates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"bodyText"}},{"kind":"Field","name":{"kind":"Name","value":"headerText"}},{"kind":"Field","name":{"kind":"Name","value":"footerText"}},{"kind":"Field","name":{"kind":"Name","value":"buttons"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetMerchantTemplatesQuery, GetMerchantTemplatesQueryVariables>;