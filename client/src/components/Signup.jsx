import { useState } from "react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCred.user.getIdToken();

      // Check if blocked
      const res = await fetch(
        "https://aljazeera-web.onrender.com/api/users/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.blocked) {
        alert("❌ لقد تم حظرك من استخدام هذا الموقع.");
        await signOut(auth);
        return navigate("/home");
      }

      alert("✅ تم التسجيل بنجاح!");
      navigate("/home");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ: " + err.message);
    }
  };

  return (
    <form onSubmit={handleSignup} style={{ fontFamily: "tajawal, sans-serif" }}>
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}
