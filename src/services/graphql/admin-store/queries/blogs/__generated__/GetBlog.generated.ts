import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetBlogQueryVariables = Types.Exact<{
  id?: Types.InputMaybe<Types.Scalars['ID']['input']>;
  handle?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetBlogQuery = { __typename?: 'Query', blog: { __typename?: 'BlogType', id: string, title: string, handle: string, commentPolicy: Types.WorkspaceStoreBlogCommentPolicyChoices, articleCount: number | null, url: string | null } | null };


export const GetBlogDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetBlog"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"handle"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"blog"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"handle"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"commentPolicy"}},{"kind":"Field","name":{"kind":"Name","value":"articleCount"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<GetBlogQuery, GetBlogQueryVariables>;