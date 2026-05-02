import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type OnMessageAddedSubscriptionVariables = Types.Exact<{
  conversationId: Types.Scalars['ID']['input'];
}>;


export type OnMessageAddedSubscription = { __typename?: 'Subscription', onMessageAdded: { __typename?: 'InboxMessageType', id: string, body: string, senderType: Types.WorkspaceInboxInboxMessageSenderTypeChoices, createdAt: string } | null };


export const OnMessageAddedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"OnMessageAdded"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onMessageAdded"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"conversationId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"senderType"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<OnMessageAddedSubscription, OnMessageAddedSubscriptionVariables>;