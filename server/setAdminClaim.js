const admin = require("firebase-admin");

// Initialize Firebase Admin with your service account key
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = "ajua46244@gmail.com"; // 🔁 Replace with your user's email

admin
  .auth()
  .getUserByEmail(email)
  .then((userRecord) => {
    const uid = userRecord.uid;
    return admin.auth().setCustomUserClaims(uid, { admin: true });
  })
  .then(() => {
    console.log(`✅ Admin claim set for email: ${email}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error setting custom claims:", err);
    process.exit(1);
  });
