require("dotenv").config();
const admin = require("firebase-admin");

// Parse the JSON string from the env variable
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
