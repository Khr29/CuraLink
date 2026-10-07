// Build-time safety checks for VITE_BACKEND_URL (shared shape with
// admin/viteEnvGuard.js — keep the two in sync).
//
// - Dev server: must talk to a local backend, so a stray production URL in
//   .env can never make local testing hit (and write to) production. Set
//   VITE_ALLOW_REMOTE_BACKEND=true to deliberately point a dev server at a
//   remote staging backend.
// - Production build: VITE_BACKEND_URL must be set (it is inlined into the
//   bundle; a missing value ships an app that calls "undefined/api/...").

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])

export const isLocalUrl = (value) => {
  try {
    const { hostname } = new URL(value)
    return LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost')
  } catch {
    return false
  }
}

export const checkBackendUrl = ({ command, isPreview, env }) => {
  const url = env.VITE_BACKEND_URL

  if (command === 'serve' && !isPreview) {
    if (!url) {
      throw new Error('[env] VITE_BACKEND_URL is not set for the dev server — expected it in .env.development.')
    }
    if (!isLocalUrl(url) && env.VITE_ALLOW_REMOTE_BACKEND !== 'true') {
      throw new Error(
        `[env] Refusing to start the dev server against a non-local backend (${url}). ` +
          'Local development must use http://localhost:4000 (see .env.development). ' +
          'Set VITE_ALLOW_REMOTE_BACKEND=true only to deliberately target a staging backend.'
      )
    }
  }

  if (command === 'build' && !url) {
    throw new Error('[env] VITE_BACKEND_URL must be set in the build environment for a production build.')
  }
}
