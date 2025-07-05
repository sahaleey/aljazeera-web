import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();

      // 🟢 Register user in MongoDB
      await fetch("https://aljazeera-web.onrender.com/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: cred.user.email }),
      });

      // 🚫 Check if user is blocked
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
        alert("❌ لقد تم حظرك من دخول الموقع.");
        await auth.signOut();
        return navigate("/home");
      }

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const token = await cred.user.getIdToken();

      // 🟢 Register user in MongoDB
      await fetch("https://aljazeera-web.onrender.com/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: cred.user.email }),
      });

      // 🚫 Check if blocked
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
        alert("❌ لقد تم حظرك من دخول الموقع.");
        await auth.signOut();
        return navigate("/home");
      }

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "البريد الإلكتروني غير صحيح";
      case "auth/user-disabled":
        return "هذا الحساب معطل";
      case "auth/user-not-found":
        return "لا يوجد حساب بهذا البريد الإلكتروني";
      case "auth/wrong-password":
        return "كلمة المرور غير صحيحة";
      case "auth/too-many-requests":
        return "محاولات تسجيل دخول كثيرة جداً، حاول لاحقاً";
      case "auth/popup-closed-by-user":
        return "تم إغلاق نافذة تسجيل الدخول";
      default:
        return "حدث خطأ أثناء تسجيل الدخول";
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
              تسجيل الدخول
            </h2>
            <p className="text-green-100 mt-1">
              مرحباً بعودتك! يرجى إدخال بياناتك
            </p>
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

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-700 mb-1 text-right"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    className="w-full pr-3 pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-right"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-700 mb-1 text-right"
                >
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-3 pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 text-right"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-green-600 hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  loading
                    ? "bg-green-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                }`}
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </motion.button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500">أو</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <motion.button
              onClick={handleGoogleLogin}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <FcGoogle className="text-xl ml-2" />
              تسجيل الدخول باستخدام Google
            </motion.button>
          </div>
          <div className="text-center text-sm text-gray-700 p-4">
            ليس لديك حساب؟{" "}
            <Link to="/signup" className="text-green-600 hover:underline">
              أنشئ حساباً جديداً
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
