import * as Types from '../../../../../../types/admin-store/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type GetSystemRoutesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetSystemRoutesQuery = { __typename?: 'Query', availableSystemRoutes: Array<{ __typename?: 'SystemRouteType', label: string | null, value: string | null, url: string | null } | null> | null };


export const GetSystemRoutesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSystemRoutes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availableSystemRoutes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]} as unknown as DocumentNode<GetSystemRoutesQuery, GetSystemRoutesQueryVariables>;