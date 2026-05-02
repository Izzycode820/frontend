import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetWhatsAppAccountsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetWhatsAppAccountsQuery = { __typename?: 'Query', marketingWhatsappAccounts: Array<{ __typename?: 'WhatsAppBusinessType', id: string, name: string | null, wabaId: string, phoneNumberId: string, displayPhoneNumber: string | null, isActive: boolean, qualityRating: Types.WorkspaceMarketingWhatsAppBusinessAccountQualityRatingChoices } | null> | null };


export const GetWhatsAppAccountsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWhatsAppAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"marketingWhatsappAccounts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"wabaId"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumberId"}},{"kind":"Field","name":{"kind":"Name","value":"displayPhoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"qualityRating"}}]}}]}}]} as unknown as DocumentNode<GetWhatsAppAccountsQuery, GetWhatsAppAccountsQueryVariables>;