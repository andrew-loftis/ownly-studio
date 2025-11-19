export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Fetch helpers that automatically include Firebase ID token when available (client-side)
import { auth } from "@/lib/firebase";

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const token = await auth?.currentUser?.getIdToken?.();
    const headers = {
      ...(init?.headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    } as Record<string, string>;
    return fetch(input as any, { ...init, headers });
  } catch {
    return fetch(input as any, init);
  }
}

export async function fetchJsonWithAuth<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetchWithAuth(input, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}
