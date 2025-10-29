# Firebase setup (Firestore + Auth + Functions)

This repo includes a minimal Firestore security ruleset and schema conventions to support:

- Email/password and Google sign-in
- A per-user profile document at `users/{uid}`
- A server-managed subscription record at `subscriptions/{uid}` written by the Stripe webhook

## Files

- `firebase/firestore.rules` — Security rules. Load these into your Firebase project.
- `firebase/firestore.indexes.json` — Empty placeholder for custom indexes (none required yet).
- `.env.example` — Environment variables required for client SDK and Admin SDK.

## Deploy rules

You can deploy rules via the Firebase Console (Firestore -> Rules) or with the CLI:

1. Install the Firebase CLI
2. Init your project if you haven't: `firebase init`
3. Point `firestore.rules` and `firestore.indexes.json` to the files in the `firebase/` folder
4. Deploy: `firebase deploy --only firestore:rules`

## Auth providers

- Email/Password: Enable in Firebase Console -> Authentication -> Sign-in method
- Google: Enable Google provider and add your domain(s) to Authorized domains

## Custom claims (admins)

Rules reference `request.auth.token.admin == true`. To grant yourself admin for back-office needs, set a custom claim via Admin SDK (for example, a one-off script or an API route):

```ts
import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function setAdmin(uid: string, isAdmin: boolean) {
  const auth = getAdminAuth();
  await auth.setCustomUserClaims(uid, { admin: isAdmin });
}
```

Users will need to refresh their ID token to see new claims (sign out/in or call `getIdToken(true)`).

## Stripe webhook via Cloud Functions (keyless)

Org policies blocking service account keys? Use the provided HTTPS function instead. Files:

- `firebase/functions/src/index.ts` — `stripeWebhook` handler
- `firebase/functions/package.json`, `tsconfig.json` — build config
- `firebase.json` — functions source configuration

Steps:

1. Install Firebase CLI
2. Login and select your project
  - `firebase login`
  - `firebase use <your-project-id>` (example: `ownlystudio-ca1f1`)
3. Install function deps
  - `npm install --prefix ./firebase/functions`
4. Set secrets (stored in Google Secret Manager)
  - `firebase functions:secrets:set STRIPE_SECRET_KEY`
  - `firebase functions:secrets:set STRIPE_WEBHOOK_SECRET`
5. Build and deploy
  - `npm run build --prefix ./firebase/functions`
  - `firebase deploy --only functions`
6. Copy the deployed function URL (e.g., `https://us-central1-<project>.cloudfunctions.net/stripeWebhook`) and set it in Stripe Dashboard → Developers → Webhooks. Select `checkout.session.completed`.

Notes:
- Netlify still needs `STRIPE_SECRET_KEY` for your Next.js `/api/checkout` route.
- You don’t need `FIREBASE_ADMIN_*` env vars with this function—they’re not used.
