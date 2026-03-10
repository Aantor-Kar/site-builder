import { createAuthClient } from "better-auth/react";

function normalizeAppBaseURL(raw: string | undefined) {
  const base = (raw ?? "").trim().replace(/\/+$/, "");
  if (!base) {
    // Dev-friendly fallback: if the env isn't loaded, assume API is on port 3000
    // on the same host as the frontend.
    if (typeof window !== "undefined") {
      const { protocol, hostname } = window.location;
      return `${protocol}//${hostname}:3000`;
    }
    return undefined;
  }
  return base.replace(/\/api\/auth$/i, "");
}

export const authClient = createAuthClient({
  // Better Auth will append `basePath` (default: `/api/auth`) to `baseURL` internally.
  baseURL: normalizeAppBaseURL(import.meta.env.VITE_BASEURL),
  fetchOptions: { credentials: "include" },
});

export const { signIn, signUp, useSession } = authClient;