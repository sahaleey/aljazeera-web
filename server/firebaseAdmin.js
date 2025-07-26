const admin = require("firebase-admin");

const base64 = process.env.FIREBASE_ADMIN_CREDENTIALS_BASE64;

if (!base64) {
  throw new Error(
    "Firebase Admin credentials not found in environment variables."
  );
}

const serviceAccount = JSON.parse(
  Buffer.from(base64, "base64").toString("utf-8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
