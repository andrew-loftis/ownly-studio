import admin from "firebase-admin";

let initialized = false;
let adminAvailable = false;
let detectedProjectId: string | undefined;

function initAdminIfNeeded() {
  if (initialized) return;

  // Accept multiple ways to configure service account:
  // 1) FIREBASE_ADMIN_SERVICE_ACCOUNT (raw JSON string)
  // 2) FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64 (base64-encoded JSON)
  // 3) Individual fields: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY
  let projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  let clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  try {
    const saJsonRaw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
    const saJsonB64 = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_BASE64;
    let saObj: any | undefined;
    if (saJsonRaw) {
      saObj = JSON.parse(saJsonRaw);
    } else if (saJsonB64) {
      const decoded = Buffer.from(saJsonB64, 'base64').toString('utf8');
      saObj = JSON.parse(decoded);
    }
    if (saObj) {
      projectId = saObj.project_id || projectId;
      clientEmail = saObj.client_email || clientEmail;
      privateKey = saObj.private_key || privateKey;
    }
  } catch {
    // ignore parse errors; fall back to individual envs
  }

  if (privateKey && privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
      const pk = (privateKey as string).includes("\\n") ? (privateKey as string).replace(/\\n/g, "\n") : (privateKey as string);
      admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey: pk }),
      });
      adminAvailable = true;
      detectedProjectId = projectId;
    } else {
      // Do NOT attempt to initialize with application default unless running on GCP with ADC set.
      // Leave admin uninitialized and surface a clear error to the caller.
      adminAvailable = false;
    }
  } else {
    adminAvailable = true;
    try {
      detectedProjectId = admin.app().options.projectId;
    } catch {
      // ignore
    }
  }

  initialized = true;
}

export function isAdminAvailable() {
  initAdminIfNeeded();
  return adminAvailable;
}

export function getAdminProjectId(): string | undefined {
  initAdminIfNeeded();
  return detectedProjectId;
}

export function getAdminAuth() {
  initAdminIfNeeded();
  if (!adminAvailable) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY (with \n newlines)."
    );
  }
  return admin.auth();
}

export function getAdminDb() {
  initAdminIfNeeded();
  if (!adminAvailable) {
    throw new Error(
      "Firebase Admin SDK is not configured. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY (with \n newlines)."
    );
  }
  return admin.firestore();
}
