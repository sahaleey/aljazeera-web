const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const blogRoutes = require("./routes/blogRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

// Debugging line to check the URI
app.use(
  cors({
    origin: ["http://localhost:5173", "https://aljazeera-web.vercel.app"], // add both dev + prod origins
    credentials: true, // this is needed if you're sending cookies or auth headers
  })
);
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/api/blogs", blogRoutes);
app.use("/api/users", adminRoutes);

app.get("/", (req, res) => {
  res.send("API is running 💨");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB Error:", err));
