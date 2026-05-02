import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetMerchantOnboardingStatusQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetMerchantOnboardingStatusQuery = { __typename?: 'Query', merchantOnboardingStatus: { __typename?: 'OnboardingStatusType', currentStepId: string | null, merchantTier: string | null, steps: Array<{ __typename?: 'OnboardingStepType', id: string | null, status: string | null, metadata: any | null } | null> | null } | null };


export const GetMerchantOnboardingStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMerchantOnboardingStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"merchantOnboardingStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"steps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"metadata"}}]}},{"kind":"Field","name":{"kind":"Name","value":"currentStepId"}},{"kind":"Field","name":{"kind":"Name","value":"merchantTier"}}]}}]}}]} as unknown as DocumentNode<GetMerchantOnboardingStatusQuery, GetMerchantOnboardingStatusQueryVariables>;