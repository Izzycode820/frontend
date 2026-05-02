import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetWhatsAppTemplateLibraryQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetWhatsAppTemplateLibraryQuery = { __typename?: 'Query', marketingWhatsappTemplateLibrary: Array<{ __typename?: 'WhatsAppLibraryTemplateType', id: string, name: string, category: string | null, language: string | null, components: any | null, bodyText: string | null, headerText: string | null, footerText: string | null, buttons: any | null } | null> | null };


export const GetWhatsAppTemplateLibraryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWhatsAppTemplateLibrary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketingWhatsappTemplateLibrary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"language"}},{"kind":"Field","name":{"kind":"Name","value":"components"}},{"kind":"Field","name":{"kind":"Name","value":"bodyText"}},{"kind":"Field","name":{"kind":"Name","value":"headerText"}},{"kind":"Field","name":{"kind":"Name","value":"footerText"}},{"kind":"Field","name":{"kind":"Name","value":"buttons"}}]}}]}}]} as unknown as DocumentNode<GetWhatsAppTemplateLibraryQuery, GetWhatsAppTemplateLibraryQueryVariables>;