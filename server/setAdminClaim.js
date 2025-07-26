require("dotenv").config();
const admin = require("firebase-admin");

// ✅ Decode base64 credentials from environment variable
const decoded = Buffer.from(
  process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64,
  "base64"
).toString("utf-8");
const serviceAccount = JSON.parse(decoded);

// ✅ Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ Your array of UIDs to make admins
const uids = ["xTXNS3exNtWdvQZBM89tYla27QP2", "WDJ6sTmIlAQPYa91YLprIkxTj913"];

const makeAdmins = async () => {
  try {
    for (const uid of uids) {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      console.log(`✅ Admin claim set for UID: ${uid}`);
    }
    process.exit(0);
  } catch (err) {
    console.error("❌ Error setting custom claims:", err);
    process.exit(1);
  }
};

makeAdmins();
