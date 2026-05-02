import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetStrategicInsightsQueryVariables = Types.Exact<{
  conversationId: Types.Scalars['ID']['input'];
}>;


export type GetStrategicInsightsQuery = { __typename?: 'Query', inboxConversation: { __typename?: 'InboxConversationType', id: string, isAiActive: boolean, aiAutonomyMode: Types.AiAutonomyModeEnum | null, cartValue: any, aiStrategyContext: any } | null };


export const GetStrategicInsightsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetStrategicInsights"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"inboxConversation"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"conversationId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isAiActive"}},{"kind":"Field","name":{"kind":"Name","value":"aiAutonomyMode"}},{"kind":"Field","name":{"kind":"Name","value":"cartValue"}},{"kind":"Field","name":{"kind":"Name","value":"aiStrategyContext"}}]}}]}}]} as unknown as DocumentNode<GetStrategicInsightsQuery, GetStrategicInsightsQueryVariables>;