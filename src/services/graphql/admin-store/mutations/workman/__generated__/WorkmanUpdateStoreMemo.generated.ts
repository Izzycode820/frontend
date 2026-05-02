import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type WorkmanUpdateStoreMemoMutationVariables = Types.Exact<{
  memoContent: Types.Scalars['String']['input'];
}>;


export type WorkmanUpdateStoreMemoMutation = { __typename?: 'Mutation', workmanUpdateStoreMemo: { __typename?: 'UpdateStoreMemo', success: boolean | null, message: string | null } | null };


export const WorkmanUpdateStoreMemoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"WorkmanUpdateStoreMemo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"memoContent"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workmanUpdateStoreMemo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"memoContent"},"value":{"kind":"Variable","name":{"kind":"Name","value":"memoContent"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<WorkmanUpdateStoreMemoMutation, WorkmanUpdateStoreMemoMutationVariables>;