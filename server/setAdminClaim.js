// setAdminClaim.js
const admin = require("firebase-admin");

// Initialize Firebase Admin with your service account key
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "6rYPRI4VfbY8uRUF6q3Ykl7aFC63"; // Replace with your user's UID

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Admin claim set for UID: ${uid}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error setting custom claims:", err);
    process.exit(1);
  });
