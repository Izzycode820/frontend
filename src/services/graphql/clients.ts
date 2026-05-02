import { ApolloClient, InMemoryCache, from, ApolloLink, Observable } from '@apollo/client'
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useAuthStore } from '@/stores/authentication/authStore'
import { useWorkspaceStore, workspaceSelectors } from '@/stores/authentication/workspaceStore'
import { API_CONFIG } from '@/services/api/config'

/*
Later (When You Move to CDN):

  When you're ready to switch to S3/Cloudinary/etc., you'll:       
  1. Remove apollo-upload-client
  2. Implement signed URL pattern
  3. Keep @apollo/client@4.x

  */


// Authentication middleware - integrates with Zustand stores
const authLink = setContext((_, { headers }) => {
  // Get auth token from Zustand authStore (property is 'token', not 'accessToken')
  const { token } = useAuthStore.getState()

  // Get current workspace ID from Zustand workspaceStore
  const currentWorkspace = workspaceSelectors.currentWorkspace(useWorkspaceStore.getState())

  // Debug logging
  console.log('[Apollo authLink] Setting headers:', {
    hasToken: !!token,
    workspaceId: currentWorkspace?.id || '(none)',
    timestamp: new Date().toISOString()
  })

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      // Backend reads from HTTP_X_WORKSPACE_ID (Django auto-converts)
      'X-Workspace-Id': currentWorkspace?.id || '',
    }
  }
})

// ─── Email Verification Link ──────────────────────────────────────────────────
// Intercepts EVERY Apollo response (including partial data + errors from errorPolicy:'all')
// and hard-redirects to /auth/verify when EMAIL_NOT_VERIFIED is present.
// Uses Observable subscription instead of .map() for Apollo type compatibility.

const verificationLink = new ApolloLink((operation, forward) =>
  new Observable(observer => {
    const sub = forward(operation).subscribe({
      next(response) {
        const blocked = response.errors?.some(
          (e: any) => e.extensions?.code === 'EMAIL_NOT_VERIFIED'
        )
        if (blocked && typeof window !== 'undefined' && window.location.pathname !== '/auth/verify') {
          console.warn('[Apollo] EMAIL_NOT_VERIFIED — hard redirecting to /auth/verify')
          window.location.href = '/auth/verify'
        }
        observer.next(response)
      },
      error: observer.error.bind(observer),
      complete: observer.complete.bind(observer),
    })
    return () => sub.unsubscribe()
  })
)

// General error logger (network errors, non-verification GraphQL errors)
const errorLink = onError(({ graphQLErrors, networkError }: any) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }: any) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    )
  if (networkError) console.log(`[Network error]: ${networkError}`)
})


// Admin Store API Client (Workspace-scoped)
const uploadLink = new UploadHttpLink({
  uri: `${API_CONFIG.baseURL}/api/workspaces/store/graphql/`,
  credentials: 'include',
})

export const adminStoreClient = new ApolloClient({
  link: from([
    verificationLink,
    errorLink,
    authLink.concat(uploadLink),
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            merge(existing, incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})

// Admin Store API Client (Workspace-scoped)
const hostinguploadLink = new UploadHttpLink({
  uri: `${API_CONFIG.baseURL}/api/workspaces/hosting/graphql/`,
  credentials: 'include',
})

export const hostinClient = new ApolloClient({
  link: from([
    verificationLink,
    errorLink,
    authLink.concat(hostinguploadLink),
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            merge(existing, incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})

// Theme API Client (Public theme store + authenticated mutations)
const themeUploadLink = new UploadHttpLink({
  uri: `${API_CONFIG.baseURL}/api/themes/graphql/`,
  credentials: 'include',
})

export const themeClient = new ApolloClient({
  link: from([
    verificationLink,
    errorLink,
    authLink.concat(themeUploadLink),
  ]),
  cache: new InMemoryCache(),
})

// Subscription API Client (Public plan showcase + authenticated subscription management)
const subscriptionUploadLink = new UploadHttpLink({
  uri: `${API_CONFIG.baseURL}/api/subscriptions/graphql/`,
  credentials: 'include',
})

export const subscriptionClient = new ApolloClient({
  link: from([
    verificationLink,
    errorLink,
    authLink.concat(subscriptionUploadLink),
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          myNotifications: {
            merge(existing, incoming) {
              return incoming
            },
          },
          workspaceNotifications: {
            merge(existing, incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
})

// Notification API Client (Authenticated)
const notificationUploadLink = new UploadHttpLink({
  uri: `${API_CONFIG.baseURL}/api/notifications/graphql/`,
  credentials: 'include',
})

export const notificationClient = new ApolloClient({
  link: from([
    verificationLink,
    errorLink,
    authLink.concat(notificationUploadLink),
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          myNotifications: {
            merge(existing, incoming) {
              return incoming
            },
          },
          workspaceNotifications: {
            merge(existing, incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
})