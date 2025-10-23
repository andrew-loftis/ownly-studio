import admin from "firebase-admin";

let initialized = false;

function initAdminIfNeeded() {
  if (initialized) return;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey && privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey: privateKey as string }),
      });
    } else {
      // If service account not provided, initialize default app (may still fail in some environments)
      try {
        admin.initializeApp();
      } catch (e) {
        // swallow; will raise when used if truly unavailable
      }
    }
  }

  initialized = true;
}

export function getAdminAuth() {
  initAdminIfNeeded();
  return admin.auth();
}

export function getAdminDb() {
  initAdminIfNeeded();
  return admin.firestore();
}
