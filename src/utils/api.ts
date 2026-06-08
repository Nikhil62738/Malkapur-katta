// Lightweight authenticated REST client for admin-only backend endpoints
// (sub-admin management). Mirrors the token storage used by the data layer.

// VITE_API_BASE_URL is baked in at build time by Vite.
const RAW_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  "https://malkapur-katta-1.onrender.com";

export const API_BASE = `${RAW_BASE.replace(/\/+$/, "")}/api`;

const TOKEN_KEY = "mk-admin-token";

function authToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = authToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let payload: string | undefined;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
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
    const err: any = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: "admin" | "superadmin";
  permissions: string[];
  createdAt?: string;
}

export const listAdmins = () =>
  request<{ admins: AdminAccount[] }>("GET", "/auth/admins");

export const createAdmin = (input: {
  email: string;
  password: string;
  name?: string;
  permissions: string[];
}) => request<{ admin: AdminAccount }>("POST", "/auth/admins", input);

export const updateAdmin = (
  id: string,
  input: { name?: string; password?: string; permissions?: string[] },
) => request<{ admin: AdminAccount }>("PUT", `/auth/admins/${id}`, input);

export const deleteAdmin = (id: string) =>
  request<{ ok: boolean }>("DELETE", `/auth/admins/${id}`);
