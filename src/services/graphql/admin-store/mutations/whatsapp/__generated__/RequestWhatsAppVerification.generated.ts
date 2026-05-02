import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type RequestWhatsAppVerificationMutationVariables = Types.Exact<{
  accountId: Types.Scalars['ID']['input'];
  method?: Types.InputMaybe<Types.Scalars['String']['input']>;
  language?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type RequestWhatsAppVerificationMutation = { __typename?: 'Mutation', requestWhatsappVerification: { __typename?: 'RequestWhatsAppVerification', success: boolean | null, error: string | null } | null };


export const RequestWhatsAppVerificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestWhatsAppVerification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"method"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"language"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestWhatsappVerification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}},{"kind":"Argument","name":{"kind":"Name","value":"method"},"value":{"kind":"Variable","name":{"kind":"Name","value":"method"}}},{"kind":"Argument","name":{"kind":"Name","value":"language"},"value":{"kind":"Variable","name":{"kind":"Name","value":"language"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<RequestWhatsAppVerificationMutation, RequestWhatsAppVerificationMutationVariables>;