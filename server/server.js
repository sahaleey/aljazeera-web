const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const blogRoutes = require("./routes/blogRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Use proper CORS config BEFORE the routes
app.use(
  cors({
    origin: ["http://localhost:5173", "https://aljazeera-web.vercel.app"],
    credentials: true,
  })
);

// ✅ Required for reading JSON body
app.use(express.json());

// ✅ Routes
app.use("/api/blogs", blogRoutes);
app.use("/api/users", adminRoutes);

// ✅ Home route
app.get("/", (req, res) => {
  res.send("API is running 💨");
});

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB Error:", err));
