// REST client + token storage for the Firebase-compatible adapter.
// This file is swapped in for `firebase/*` imports at build time via Vite aliases
// (see vite.config.ts). It talks to the Express + MongoDB backend in `server/`.

// VITE_API_BASE_URL is baked in at build time by Vite.
// Falls back to the production Render URL so the hosted build always works
// even if the env var is somehow missing.
const RAW_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "https://malkapur-katta-1.onrender.com";

export const API_BASE = `${RAW_BASE.replace(/\/+$/, "")}/api`;

const TOKEN_KEY = "mk-admin-token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore storage errors */
  }
}

async function request(
  method: string,
  path: string,
  body?: unknown,
  isForm = false,
): Promise<any> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    if (isForm) {
      payload = body as FormData;
    } else {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload });
  const text = await res.text();
  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const err: any = new Error(
      (data && data.error) || `Request failed with status ${res.status}`,
    );
    err.status = res.status;
    if (data && data.code) err.code = data.code;
    throw err;
  }
  return data;
}

export const apiGet = (path: string) => request("GET", path);
export const apiPost = (path: string, body?: unknown) => request("POST", path, body);
export const apiPut = (path: string, body?: unknown) => request("PUT", path, body);
export const apiDelete = (path: string, body?: unknown) =>
  request("DELETE", path, body);
export const apiUpload = (path: string, form: FormData) =>
  request("POST", path, form, true);
