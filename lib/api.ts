import { authHeaders } from "./auth";

export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(path, { cache: "no-store", headers: { ...authHeaders() } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<{ data: T | null; error?: string; status: number }> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json", ...authHeaders() },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as T & { error?: string };
    if (!res.ok) return { data: null, error: json?.error || "Request failed", status: res.status };
    return { data: json as T, status: res.status };
  } catch {
    return { data: null, error: "Network error", status: 0 };
  }
}
