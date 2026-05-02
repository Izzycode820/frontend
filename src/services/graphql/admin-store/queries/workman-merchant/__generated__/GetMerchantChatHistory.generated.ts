import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetMerchantChatHistoryQueryVariables = Types.Exact<{
  sessionId: Types.Scalars['String']['input'];
}>;


export type GetMerchantChatHistoryQuery = { __typename?: 'Query', merchantChatHistory: Array<{ __typename?: 'WorkmanMerchantConversationType', id: string, prompt: string, response: any | null, domain: Types.WorkmanWorkmanMerchantConversationDomainChoices, intent: Types.WorkmanWorkmanMerchantConversationIntentChoices, createdAt: string }> | null };


export const GetMerchantChatHistoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMerchantChatHistory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"merchantChatHistory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sessionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sessionId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"response"}},{"kind":"Field","name":{"kind":"Name","value":"domain"}},{"kind":"Field","name":{"kind":"Name","value":"intent"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<GetMerchantChatHistoryQuery, GetMerchantChatHistoryQueryVariables>;