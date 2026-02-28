import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type VerifyPaymentMethodMutationVariables = Types.Exact<{
  methodId: Types.Scalars['ID']['input'];
}>;


export type VerifyPaymentMethodMutation = { __typename?: 'Mutation', verifyPaymentMethod: { __typename?: 'VerifyPaymentMethod', success: boolean | null, message: string | null, error: string | null, paymentMethod: { __typename?: 'MerchantPaymentMethodType', id: string, verified: boolean, credentialVerifiedAt: string | null } | null } | null };


export const VerifyPaymentMethodDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyPaymentMethod"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"methodId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyPaymentMethod"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"methodId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"methodId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"error"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"verified"}},{"kind":"Field","name":{"kind":"Name","value":"credentialVerifiedAt"}}]}}]}}]}}]} as unknown as DocumentNode<VerifyPaymentMethodMutation, VerifyPaymentMethodMutationVariables>;