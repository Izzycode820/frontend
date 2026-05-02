import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ResumeWorkmanMutationVariables = Types.Exact<{
  customerPhone: Types.Scalars['String']['input'];
}>;


export type ResumeWorkmanMutation = { __typename?: 'Mutation', resumeWorkman: { __typename?: 'ResumeWorkman', success: boolean | null, message: string | null } | null };


export const ResumeWorkmanDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResumeWorkman"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"customerPhone"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resumeWorkman"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"customerPhone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"customerPhone"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ResumeWorkmanMutation, ResumeWorkmanMutationVariables>;