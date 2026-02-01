import * as Types from '../../../../../../types/hosting/graphql-base';

import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type UpdateGoogleVerificationMutationVariables = Types.Exact<{
    verificationCode: Types.Scalars['String']['input'];
}>;


export type UpdateGoogleVerificationMutation = { __typename?: 'Mutation', updateGoogleVerification: { __typename?: 'UpdateGoogleVerificationMutation', success: boolean | null, message: string | null, error: string | null } | null };


export const UpdateGoogleVerificationDocument = { "kind": "Document", "definitions": [{ "kind": "OperationDefinition", "operation": "mutation", "name": { "kind": "Name", "value": "UpdateGoogleVerification" }, "variableDefinitions": [{ "kind": "VariableDefinition", "variable": { "kind": "Variable", "name": { "kind": "Name", "value": "verificationCode" } }, "type": { "kind": "NonNullType", "type": { "kind": "NamedType", "name": { "kind": "Name", "value": "String" } } } }], "selectionSet": { "kind": "SelectionSet", "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "updateGoogleVerification" }, "arguments": [{ "kind": "Argument", "name": { "kind": "Name", "value": "verificationCode" }, "value": { "kind": "Variable", "name": { "kind": "Name", "value": "verificationCode" } } }], "selectionSet": { "kind": "SelectionSet", "selections": [{ "kind": "Field", "name": { "kind": "Name", "value": "success" } }, { "kind": "Field", "name": { "kind": "Name", "value": "message" } }, { "kind": "Field", "name": { "kind": "Name", "value": "error" } }] } }] } }] } as unknown as DocumentNode<UpdateGoogleVerificationMutation, UpdateGoogleVerificationMutationVariables>;
