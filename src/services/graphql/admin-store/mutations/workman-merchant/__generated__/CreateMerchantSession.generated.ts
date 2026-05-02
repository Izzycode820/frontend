import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CreateMerchantSessionMutationVariables = Types.Exact<{
  title: Types.Scalars['String']['input'];
}>;


export type CreateMerchantSessionMutation = { __typename?: 'Mutation', createMerchantSession: { __typename?: 'CreateMerchantSession', success: boolean | null, errorCode: string | null, responseMessage: string | null, session: { __typename?: 'WorkmanChatSessionType', id: string, title: string } | null } | null };


export const CreateMerchantSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMerchantSession"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"title"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMerchantSession"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"title"},"value":{"kind":"Variable","name":{"kind":"Name","value":"title"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"session"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"errorCode"}},{"kind":"Field","name":{"kind":"Name","value":"responseMessage"}}]}}]}}]} as unknown as DocumentNode<CreateMerchantSessionMutation, CreateMerchantSessionMutationVariables>;