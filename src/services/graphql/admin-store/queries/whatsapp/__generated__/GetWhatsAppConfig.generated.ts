import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetWhatsAppConfigQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetWhatsAppConfigQuery = { __typename?: 'Query', marketingWhatsappConfig: { __typename?: 'WhatsAppConfigType', appId: string | null } | null };


export const GetWhatsAppConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWhatsAppConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketingWhatsappConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"appId"}}]}}]}}]} as unknown as DocumentNode<GetWhatsAppConfigQuery, GetWhatsAppConfigQueryVariables>;