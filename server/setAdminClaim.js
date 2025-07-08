const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin with your service account key
const serviceAccount = require(process.env.FIREBASE_ADMIN_CREDENTIALS ||
  "./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = "FfowsFZdtIN8jRrIRP9IZR2ybtl2"; // Replace with your user's UID

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
