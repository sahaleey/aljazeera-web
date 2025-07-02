import { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Create user with Firebase
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;
      const token = await user.getIdToken();

      // 2️⃣ Register the user in your backend (MongoDB)
      const registerRes = await fetch(
        "http://localhost:5000/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Important!
          },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName || "", // Optional, fallback
          }),
        }
      );

      if (!registerRes.ok) {
        const errorText = await registerRes.text();
        throw new Error("Registration failed: " + errorText);
      }

      // 3️⃣ Check if user is blocked
      const blockCheckRes = await fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = await blockCheckRes.json();

      if (userData.blocked) {
        alert("❌ لقد تم حظرك من استخدام هذا الموقع.");
        await signOut(auth);
        navigate("/home");
        return;
      }

      alert("✅ تم التسجيل بنجاح!");
      navigate("/home");
    } catch (err) {
      console.error("Signup error:", err);
      alert("🚫 حدث خطأ: " + (err.message || "Something went wrong."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSignup}
      style={{
        fontFamily: "tajawal, sans-serif",
        maxWidth: "400px",
        margin: "auto",
        padding: "2rem",
      }}
    >
      <h2 className="text-2xl font-bold mb-4 text-center">📝 التسجيل</h2>
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full p-3 mb-4 border border-gray-300 rounded"
      />
      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-3 mb-4 border border-gray-300 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 text-white font-semibold rounded ${
          loading
            ? "bg-green-400 cursor-not-allowed"
            : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        }`}
      >
        {loading ? "⏳ جاري التسجيل..." : "تسجيل حساب جديد"}
      </button>
    </form>
  );
}
