import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { FaUserShield } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";

import {
  FiTrash2,
  FiUserX,
  FiUserCheck,
  FiAlertCircle,
  FiEye,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";
import { FaRegNewspaper } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RiAdminLine } from "react-icons/ri";

const AuthenticatorDashboard = () => {
  const [user, setUser] = useState(null);
  const [verifying, setVerifying] = useState(null);

  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [communityPoints, setCommunityPoints] = useState({});

  const [loading, setLoading] = useState({
    users: false,
    blogs: false,
    actions: false,
    points: false,
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalBlogs: 0,
  });

  const navigate = useNavigate();
  const adminEmails = ["ajua46244@gmail.com"];

  const notify = {
    success: (message) =>
      toast.success(message, {
        position: "top-right",
        icon: <FiCheckCircle className="text-xl" />,
      }),
    error: (message) =>
      toast.error(message, {
        position: "top-right",
        icon: <FiAlertCircle className="text-xl" />,
      }),
    info: (message) =>
      toast.info(message, {
        position: "top-right",
      }),
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        notify.error("يجب تسجيل الدخول أولاً");
        return navigate("/home");
      }

      if (!adminEmails.includes(currentUser.email)) {
        notify.error("🚫 ليس لديك صلاحية الوصول إلى لوحة التحكم");
        return navigate("/home");
      }

      setUser(currentUser);
      setCheckingAdmin(false);

      try {
        const token = await currentUser.getIdToken();

        await axios.post(
          "https://aljazeera-web.onrender.com/api/users/register",
          {
            email: currentUser.email,
            name: currentUser.displayName || currentUser.email.split("@")[0],
            photoUrl: currentUser.photoURL || "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Token added here
            },
          }
        );

        await checkBlocked(currentUser);
        notify.success(`مرحباً ${currentUser.displayName || "المسؤول"}`);

        await fetchUsers(token);
        await fetchBlogs(token);
        await fetchCommunityPoints(token);
      } catch (err) {
        console.error("[AuthDash] Error during admin flow:", err);
        notify.error("حدث خطأ أثناء التحقق من البيانات");
        navigate("/home");
      }
    });

    return unsubscribe;
  }, []);

  const fetchCommunityPoints = async (token) => {
    setLoading((prev) => ({ ...prev, points: true }));
    try {
      const res = await axios.get(
        "https://aljazeera-web.onrender.com/api/blogs/points",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCommunityPoints(res.data);
      notify.info("✅ تم تحميل نقاط المجتمعات");
    } catch (err) {
      console.error("❌ Error fetching points:", err);
      notify.error("فشل تحميل نقاط المجتمعات");
    } finally {
      setLoading((prev) => ({ ...prev, points: false }));
    }
  };
  const calculatePoints = (blogs) => {
    return blogs.reduce((sum, blog) => {
      return blog.verified ? sum + 1 : sum;
    }, 0);
  };

  //to verify or unverify a blog

  const toggleVerifyBlog = async (id) => {
    setVerifying(id);
    try {
      const token = await user.getIdToken();
      const res = await axios.put(
        `https://aljazeera-web.onrender.com/api/users/blogs/verify/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      notify.success(
        res.data.verified
          ? "✅ تم التحقق من المقال"
          : "❎ تم إزالة التحقق من المقال"
      );
      await fetchBlogs(token);
      await fetchCommunityPoints(token);
    } catch (err) {
      console.error("❌ Error verifying blog:", err);
      notify.error("حدث خطأ أثناء التحقق من المقال");
    } finally {
      setVerifying(null);
    }
  };

  const checkBlocked = async (currentUser) => {
    try {
      const token = await currentUser.getIdToken();
      const res = await axios.get(
        "https://aljazeera-web.onrender.com/api/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.blocked) {
        notify.error("تم حظرك من استخدام هذا الموقع");
        await auth.signOut();
        navigate("/home");
      }
    } catch (err) {
      console.error("⚠️ Error checking blocked status:", err.message);
      notify.error("حدث خطأ أثناء التحقق من حالة الحظر");
    }
  };

  const fetchUsers = async (token) => {
    setLoading((prev) => ({ ...prev, users: true }));
    try {
      const res = await axios.get(
        "https://aljazeera-web.onrender.com/api/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data);

      const blockedCount = res.data.filter((u) => u.blocked).length;
      setStats((prev) => ({
        ...prev,
        totalUsers: res.data.length,
        activeUsers: res.data.length - blockedCount,
        blockedUsers: blockedCount,
      }));

      notify.info("تم تحديث بيانات المستخدمين");
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      notify.error("فشل تحميل بيانات المستخدمين");
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  const fetchBlogs = async (token) => {
    setLoading((prev) => ({ ...prev, blogs: true }));
    try {
      const res = await axios.get(
        "https://aljazeera-web.onrender.com/api/blogs",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBlogs(res.data);
      setStats((prev) => ({ ...prev, totalBlogs: res.data.length }));
      notify.info("تم تحديث المقالات");
    } catch (err) {
      console.error("❌ Error fetching blogs:", err);
      notify.error("فشل تحميل المقالات");
    } finally {
      setLoading((prev) => ({ ...prev, blogs: false }));
    }
  };

  const toggleBlockUser = async (id) => {
    setLoading((prev) => ({ ...prev, actions: true }));
    try {
      const token = await user.getIdToken();
      const userToUpdate = users.find((u) => u._id === id);

      await axios.put(
        `https://aljazeera-web.onrender.com/api/users/block/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchUsers(token);
      notify.success(
        userToUpdate.blocked
          ? `تم إلغاء حظر ${userToUpdate.name || userToUpdate.email}`
          : `تم حظر ${userToUpdate.name || userToUpdate.email}`
      );
    } catch (err) {
      console.error("❌ Error blocking/unblocking user:", err);
      notify.error("حدث خطأ أثناء محاولة حظر/إلغاء حظر المستخدم");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه المقالة؟")) return;

    setLoading((prev) => ({ ...prev, actions: true }));
    try {
      const token = await user.getIdToken();
      const blogToDelete = blogs.find((b) => b._id === id);

      await axios.delete(`https://aljazeera-web.onrender.com/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchBlogs(token);
      notify.success(`تم حذف مقال "${blogToDelete.title}"`);
    } catch (err) {
      console.error("❌ Error deleting blog:", err);
      notify.error("حدث خطأ أثناء محاولة حذف المقال");
    } finally {
      setLoading((prev) => ({ ...prev, actions: false }));
    }
  };

  const refreshData = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    await Promise.all([fetchUsers(token), fetchBlogs(token)]);
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Animated loading indicator */}
          <div className="relative h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-blue-600 rounded-full animate-loading-pulse"
              style={{ width: "70%" }}
            ></div>
          </div>

          {/* Content with better typography */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">
              جارٍ التحقق من صلاحيات المشرف
            </h3>
            <p className="text-gray-500 text-sm">
              قد تستغرق العملية بضع ثوانٍ، الرجاء الانتظار...
            </p>
          </div>

          {/* Optional decorative elements */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6"
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-br from-blue-100 to-indigo-200 p-1 rounded-full shadow-lg"
            >
              <div className="absolute -inset-1.5 bg-gradient-to-br from-blue-300 to-indigo-400 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              {user.photoUrl ? (
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  src={user.photoUrl}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white border-4 border-white flex items-center justify-center">
                  <RiAdminLine className="text-indigo-700 text-2xl" />
                </div>
              )}
            </motion.div>
            <div>
              <motion.h1
                whileHover={{ x: 5 }}
                className="text-2xl md:text-3xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text "
              >
                لوحة تحكم المسؤول
              </motion.h1>
              <motion.p
                whileHover={{ x: 5 }}
                className="text-gray-600 font-medium"
              >
                مرحباً، {user.displayName || user.email.split("@")[0]}
              </motion.p>
            </div>
          </div>

          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            disabled={loading.users || loading.blogs}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            {loading.users || loading.blogs ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <FiRefreshCw className="text-lg" />
            )}
            <span>تحديث البيانات</span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-white to-blue-50 p-5 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي المستخدمين
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.totalUsers}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaUserShield className="text-xl" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-blue-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-blue-400 to-indigo-500"
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-white to-green-50 p-5 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  المستخدمون النشطون
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.activeUsers}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiUserCheck className="text-xl" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-green-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-white to-red-50 p-5 rounded-2xl shadow-sm border border-red-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  المستخدمون المحظورون
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.blockedUsers}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FiUserX className="text-xl" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-red-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.4 }}
                className="h-full bg-gradient-to-r from-red-400 to-pink-500"
              />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-white to-purple-50 p-5 rounded-2xl shadow-sm border border-purple-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي المقالات
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stats.totalBlogs}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaRegNewspaper className="text-xl" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-purple-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-full bg-gradient-to-r from-purple-400 to-violet-500"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Users Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center justify-between">
              <motion.h2
                whileHover={{ scale: 1.01 }}
                className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3"
              >
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FaUserShield className="text-xl" />
                </div>
                <span>إدارة المستخدمين</span>
              </motion.h2>
              {loading.users && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"
                />
              )}
            </div>
          </div>

          {users.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                لا يوجد مستخدمين مسجلين
              </h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المستخدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {users.map((u) => (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              {u.name?.charAt(0) ||
                                u.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">
                                {u.name || "بدون اسم"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(u.createdAt).toLocaleDateString(
                                  "ar-EG"
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              u.blocked
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {u.blocked ? "محظور" : "نشط"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <motion.button
                            whileHover={{
                              scale: 1.1,
                              backgroundColor: u.blocked
                                ? "rgba(16, 185, 129, 0.1)"
                                : "rgba(220, 38, 38, 0.1)",
                            }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleBlockUser(u._id)}
                            disabled={loading.actions}
                            className={`p-2 rounded-lg ${
                              u.blocked
                                ? "text-green-600 hover:bg-green-50"
                                : "text-red-600 hover:bg-red-50"
                            } transition-colors`}
                            title={u.blocked ? "إلغاء الحظر" : "حظر المستخدم"}
                          >
                            {loading.actions ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                              />
                            ) : u.blocked ? (
                              <FiUserCheck className="text-lg" />
                            ) : (
                              <FiUserX className="text-lg" />
                            )}
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* Community Points Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 100 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 mt-6"
        >
          {/* Header with gradient and animated icon */}
          <div className="p-6 border-b border-white/20 bg-gradient-to-r from-yellow-400/10 via-yellow-100/50 to-white">
            <div className="flex items-center justify-between">
              <motion.h2
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-4"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "mirror",
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl text-white shadow-lg"
                >
                  🏆
                </motion.div>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600">
                  نقاط المجتمعات
                </span>
              </motion.h2>
            </div>
          </div>

          {/* Content Area */}
          {loading.points ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="inline-block mb-4 text-yellow-500"
              >
                <FiRefreshCw className="text-3xl" />
              </motion.div>
              <p className="text-gray-500 animate-pulse">يتم تحميل النقاط...</p>
            </motion.div>
          ) : Object.keys(communityPoints).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <div className="inline-block p-4 mb-3 bg-yellow-100/50 rounded-full">
                <FiAlertCircle className="text-2xl text-yellow-600" />
              </div>
              <p className="text-gray-500">لا توجد نقاط بعد</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6"
            >
              {Object.entries(communityPoints).map(
                ([community, blogs], index) => (
                  <motion.div
                    key={community}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.2)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative overflow-hidden rounded-xl shadow-md ${
                      index % 3 === 0
                        ? "bg-gradient-to-br from-yellow-50 to-amber-50 border border-amber-100"
                        : index % 3 === 1
                        ? "bg-gradient-to-br from-amber-50 to-white border border-amber-50"
                        : "bg-gradient-to-br from-white to-yellow-50 border border-yellow-100"
                    }`}
                  >
                    {/* Animated background element */}
                    <motion.div
                      className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-amber-400"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: index * 0.15 }}
                    />

                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <motion.h4
                            whileHover={{ x: 3 }}
                            className="text-lg font-bold text-gray-800 capitalize flex items-center gap-2"
                          >
                            <span
                              className={`p-1 rounded-full ${
                                index % 3 === 0
                                  ? "bg-yellow-100 text-yellow-600"
                                  : index % 3 === 1
                                  ? "bg-amber-100 text-amber-600"
                                  : "bg-orange-100 text-orange-600"
                              }`}
                            >
                              {index + 1}
                            </span>
                            {community}
                          </motion.h4>
                          <p className="text-sm text-gray-600 mt-1">
                            عدد المقالات:{" "}
                            {Array.isArray(blogs) ? blogs.length : 0}
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className={`text-2xl font-bold ${
                            index % 3 === 0
                              ? "text-yellow-600"
                              : index % 3 === 1
                              ? "text-amber-600"
                              : "text-orange-600"
                          }`}
                        >
                          {Array.isArray(blogs) ? calculatePoints(blogs) : 0}
                        </motion.div>
                      </div>

                      {/* Animated progress bar */}
                      <div className="mt-4">
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(
                                ((Array.isArray(blogs)
                                  ? calculatePoints(blogs)
                                  : 0) /
                                  (Math.max(
                                    ...Object.values(communityPoints).map((b) =>
                                      Array.isArray(b) ? calculatePoints(b) : 0
                                    )
                                  ) || 1)) *
                                  100,
                                100
                              )}%`,
                            }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-full ${
                              index % 3 === 0
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                : index % 3 === 1
                                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                : "bg-gradient-to-r from-orange-400 to-orange-500"
                            }`}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-left">
                          {Math.round(
                            ((Array.isArray(blogs)
                              ? calculatePoints(blogs)
                              : 0) /
                              (Math.max(
                                ...Object.values(communityPoints).map((b) =>
                                  Array.isArray(b) ? calculatePoints(b) : 0
                                )
                              ) || 1)) *
                              100
                          )}
                          % من أعلى نقاط
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </motion.div>
          )}
        </motion.section>

        {/* Blogs Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex items-center justify-between">
              <motion.h2
                whileHover={{ scale: 1.01 }}
                className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3"
              >
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                  <FaRegNewspaper className="text-xl" />
                </div>
                <span>إدارة المقالات</span>
              </motion.h2>
              {loading.blogs && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"
                />
              )}
            </div>
          </div>

          {blogs.length === 0 ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-5xl mb-4"
              >
                📝
              </motion.div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                لا يوجد مقالات منشورة
              </h3>
            </div>
          ) : (
            Object.entries(
              blogs.reduce((acc, blog) => {
                const community = blog.community || "بدون قسم";
                if (!acc[community]) acc[community] = [];
                acc[community].push(blog);
                return acc;
              }, {})
            ).map(([communityName, communityBlogs]) => (
              <div key={communityName} className="mb-10">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 border-b pb-1 border-purple-200">
                  🏷️ {communityName}
                </h3>
                <div className="overflow-x-auto rounded-xl border border-purple-100 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          العنوان
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الناشر
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التاريخ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <AnimatePresence>
                        {communityBlogs.map((blog) => (
                          <motion.tr
                            key={blog._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="hover:bg-purple-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {blog.title}
                              </div>
                              <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-2">
                                <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                  {blog.category || "بدون تصنيف"}
                                </span>
                                <span className="flex items-center gap-1 text-xs">
                                  <FiEye className="text-blue-500" />
                                  {blog.views || 0} مشاهدة
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {typeof blog.author === "object"
                                ? blog.author.email || "غير معروف"
                                : blog.author || "غير معروف"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(blog.createdAt).toLocaleDateString(
                                "ar-EG"
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end gap-2">
                                {/* Verify Button */}
                                <motion.button
                                  whileHover={{
                                    scale: 1.1,
                                    backgroundColor: "rgba(34,197,94,0.1)",
                                  }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => toggleVerifyBlog(blog._id)}
                                  disabled={
                                    loading.actions || verifying === blog._id
                                  }
                                  className={`p-2 rounded-lg ${
                                    blog.verified
                                      ? "text-green-600 hover:bg-green-50"
                                      : "text-gray-400 hover:bg-gray-100"
                                  } transition-colors`}
                                  title={
                                    blog.verified
                                      ? "تم التحقق"
                                      : "تحقق من المقال"
                                  }
                                >
                                  {verifying === blog._id ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                                    />
                                  ) : (
                                    <FiCheckCircle className="text-lg" />
                                  )}
                                </motion.button>
                                {/* Delete Button */}
                                <motion.button
                                  whileHover={{
                                    scale: 1.1,
                                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                                  }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => deleteBlog(blog._id)}
                                  disabled={loading.actions}
                                  className="p-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                  title="حذف المقال"
                                >
                                  <FiTrash2 className="text-lg" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </motion.section>
      </div>
    </motion.div>
  );
};

export default AuthenticatorDashboard;
