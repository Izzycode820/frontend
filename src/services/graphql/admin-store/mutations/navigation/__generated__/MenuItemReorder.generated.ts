import * as Types from '../../../../../../types/workspace/store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type MenuItemReorderMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  newPosition: Types.Scalars['Int']['input'];
  newParentId?: Types.InputMaybe<Types.Scalars['ID']['input']>;
}>;


export type MenuItemReorderMutation = { __typename?: 'Mutation', menuItemReorder: { __typename?: 'MenuItemReorder', success: boolean | null, error: string | null, menuItem: { __typename?: 'NavigationItemType', id: string, position: number, parentId: string | null } | null } | null };


export const MenuItemReorderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MenuItemReorder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newPosition"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newParentId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"menuItemReorder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"newPosition"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newPosition"}}},{"kind":"Argument","name":{"kind":"Name","value":"newParentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newParentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"menuItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<MenuItemReorderMutation, MenuItemReorderMutationVariables>;