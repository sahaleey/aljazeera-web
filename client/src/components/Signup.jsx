import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🧪 Firebase account creation
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const token = await user.getIdToken();

      // 📮 Backend registration
      const res = await fetch(
        "https://aljazeera-web.onrender.com/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName || user.email.split("@")[0],
            photoURL: user.photoURL || "",
          }),
        }
      );

      if (!res.ok) throw new Error("فشل التسجيل في السيرفر");

      // 🛑 Block check
      const blockRes = await fetch(
        "https://aljazeera-web.onrender.com/api/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userData = await blockRes.json();

      if (userData.blocked) {
        toast.error("❌ لقد تم حظرك من استخدام هذا الموقع.");
        await signOut(auth);
        return navigate("/home");
      }

      toast.success("✅ تم التسجيل بنجاح!");
      navigate("/home");
    } catch (err) {
      console.error("Signup error:", err);
      setError(getFriendlyError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const token = await cred.user.getIdToken();

      await fetch("https://aljazeera-web.onrender.com/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: cred.user.email,
          photoURL: cred.user.photoURL || "",
          name: cred.user.displayName || cred.user.email.split("@")[0],
        }),
      });

      const blockRes = await fetch(
        "https://aljazeera-web.onrender.com/api/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userData = await blockRes.json();

      if (userData.blocked) {
        toast.error("❌ لقد تم حظرك من استخدام هذا الموقع.");
        await signOut(auth);
        return navigate("/home");
      }

      toast.success("✅ تم التسجيل بنجاح!");
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(getFriendlyError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/email-already-in-use":
        return "البريد الإلكتروني مستخدم بالفعل";
      case "auth/invalid-email":
        return "البريد الإلكتروني غير صالح";
      case "auth/weak-password":
        return "كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)";
      case "auth/popup-closed-by-user":
        return "تم إغلاق نافذة التسجيل";
      default:
        return "حدث خطأ أثناء إنشاء الحساب";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-50 p-4"
      style={{ fontFamily: "tajawal, sans-serif" }}
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              إنشاء حساب جديد
            </h2>
            <p className="text-green-100 mt-1">مرحباً! لنبدأ رحلتك معنا</p>
          </div>

          {/* Form */}
          <div className="p-6 md:p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center bg-red-50 text-red-600 p-3 rounded-lg mb-4 border border-red-100"
              >
                <FiAlertCircle className="ml-2 text-lg" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-1 text-right">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pr-3 pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-1 text-right">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-3 pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-right"
                    required
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  loading
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                }`}
              >
                {loading ? "جاري إنشاء الحساب..." : "تسجيل حساب جديد"}
              </motion.button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500">أو</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <motion.button
              onClick={handleGoogleSignup}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <FcGoogle className="text-xl ml-2" />
              التسجيل باستخدام Google
            </motion.button>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">لديك حساب بالفعل؟</span>{" "}
              <Link to="/login" className="text-green-600 hover:underline">
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
