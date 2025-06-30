// ⚠️ DEV ONLY — Never run in production without safeguards!
const admin = require("firebase-admin");
const mongoose = require("mongoose");
const User = require("./models/User"); // Your MongoDB User model
const serviceAccount = require("./serviceAccountKey.json");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

mongoose.connect(process.env.MONGO_URI);

admin
  .auth()
  .listUsers()
  .then(async (listUsersResult) => {
    for (const userRecord of listUsersResult.users) {
      const { email, displayName, uid } = userRecord;

      // Check if already exists in MongoDB
      const exists = await User.findOne({ email });
      if (!exists) {
        await User.create({
          email,
          name: displayName || email.split("@")[0],
          firebaseUid: uid,
          blocked: false,
        });
        console.log(`✅ Added: ${email}`);
      }
    }
    process.exit();
  })
  .catch((error) => {
    console.error("❌ Error fetching users:", error);
    process.exit(1);
  });
