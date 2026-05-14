/**
 * authService.js, Phase 2 stub
 *
 * Auth is optional, the app is fully functional without signing in.
 * Signing in enables settings sync and personal entry storage across devices.
 *
 * To activate: wire the stub functions to Supabase Auth calls.
 * See supabaseClient.js for setup instructions.
 *
 * Usage (when implemented):
 *   import { signInWithGoogle, signInWithGithub, signOut, getUser, onAuthStateChange } from './authService'
 *
 *   // Initiate OAuth flow (redirects to provider, then back to app)
 *   await signInWithGoogle()
 *   await signInWithGithub()
 *
 *   // Get current session user (null if not signed in)
 *   const user = await getUser()   // { id, email, avatar_url, display_name }
 *
 *   // Subscribe to sign-in / sign-out events
 *   const unsub = onAuthStateChange(user => { ... })
 *   unsub()  // call to remove listener
 *
 *   // Sign out
 *   await signOut()
 */

// Phase 2 implementation:
//   import { supabase } from './supabaseClient'
//
//   export async function signInWithGoogle() {
//     return supabase.auth.signInWithOAuth({ provider: 'google',
//       options: { redirectTo: window.location.origin } })
//   }
//   export async function signInWithGithub() {
//     return supabase.auth.signInWithOAuth({ provider: 'github',
//       options: { redirectTo: window.location.origin } })
//   }
//   export async function signOut() {
//     return supabase.auth.signOut()
//   }
//   export async function getUser() {
//     const { data: { user } } = await supabase.auth.getUser()
//     if (!user) return null
//     return {
//       id:           user.id,
//       email:        user.email,
//       displayName:  user.user_metadata?.full_name || user.email,
//       avatarUrl:    user.user_metadata?.avatar_url || null,
//       provider:     user.app_metadata?.provider,   // 'google' | 'github'
//     }
//   }
//   export function onAuthStateChange(callback) {
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       (_event, session) => callback(session?.user ? {
//         id:          session.user.id,
//         email:       session.user.email,
//         displayName: session.user.user_metadata?.full_name || session.user.email,
//         avatarUrl:   session.user.user_metadata?.avatar_url || null,
//         provider:    session.user.app_metadata?.provider,
//       } : null)
//     )
//     return () => subscription.unsubscribe()
//   }

export async function signInWithGoogle() {
  throw new Error('Auth not yet implemented, see authService.js Phase 2 comments')
}

export async function signInWithGithub() {
  throw new Error('Auth not yet implemented, see authService.js Phase 2 comments')
}

export async function signOut() {
  throw new Error('Auth not yet implemented, see authService.js Phase 2 comments')
}

export async function getUser() {
  return null
}

export function onAuthStateChange(_callback) {
  return () => {}
}
