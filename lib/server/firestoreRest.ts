const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function authedFetch(url: string, idToken: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore REST error ${res.status}: ${text}`);
  }
  return res;
}

export async function getDocument(path: string, idToken: string) {
  const res = await authedFetch(`${BASE}/${encodeURIComponent(path)}`, idToken);
  return res.json();
}

export async function runQuery(structuredQuery: any, idToken: string) {
  const res = await authedFetch(`${BASE}:runQuery`, idToken, {
    method: 'POST',
    body: JSON.stringify({ structuredQuery }),
  });
  return res.json();
}

export async function addDocument(parentPath: string, collectionId: string, doc: any, idToken: string) {
  const res = await authedFetch(`${BASE}/${encodeURIComponent(parentPath)}/${collectionId}`, idToken, {
    method: 'POST',
    body: JSON.stringify({ fields: doc }),
  });
  return res.json();
}

export async function patchDocument(docName: string, fields: any, idToken: string) {
  const updateMask = Object.keys(fields).join(',');
  const res = await authedFetch(`${BASE}/${encodeURIComponent(docName)}?updateMask.fieldPaths=${encodeURIComponent(updateMask)}`, idToken, {
    method: 'PATCH',
    body: JSON.stringify({ fields }),
  });
  return res.json();
}

export async function deleteDocument(docName: string, idToken: string) {
  const res = await authedFetch(`${BASE}/${encodeURIComponent(docName)}`, idToken, {
    method: 'DELETE',
  });
  // Firestore REST DELETE returns empty body; normalize to success indicator
  return { deleted: true };
}

// Helpers to encode basic Firestore Value types
export const fs = {
  string: (v: string) => ({ stringValue: v }),
  number: (v: number) => ({ integerValue: String(Math.trunc(v)) }),
  double: (v: number) => ({ doubleValue: v }),
  bool: (v: boolean) => ({ booleanValue: v }),
  timestamp: (d: Date) => ({ timestampValue: d.toISOString() }),
  array: (values: any[]) => ({ arrayValue: { values } }),
};
