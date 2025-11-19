import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
const ISSUER = PROJECT_ID ? `https://securetoken.google.com/${PROJECT_ID}` : '';
const JWK_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJWKS() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(JWK_URL));
  }
  return jwks;
}

export type DecodedFirebaseToken = JWTPayload & {
  user_id?: string;
  uid?: string;
  email?: string;
  name?: string;
  picture?: string;
  auth_time?: number;
};

export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedFirebaseToken> {
  if (!PROJECT_ID) {
    throw new Error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }
  const { payload } = await jwtVerify(idToken, getJWKS(), {
    issuer: ISSUER,
    audience: PROJECT_ID,
  });
  return payload as DecodedFirebaseToken;
}
