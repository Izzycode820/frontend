import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type CreateBlogMutationVariables = Types.Exact<{
  input: Types.BlogInput;
}>;


export type CreateBlogMutation = { __typename?: 'Mutation', createBlog: { __typename?: 'CreateBlog', success: boolean | null, message: string | null, blog: { __typename?: 'BlogType', id: string, title: string, handle: string, commentPolicy: Types.WorkspaceStoreBlogCommentPolicyChoices } | null } | null };


export const CreateBlogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateBlog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BlogInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createBlog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"blog"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"commentPolicy"}}]}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<CreateBlogMutation, CreateBlogMutationVariables>;