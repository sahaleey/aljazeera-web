import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLogOut,
  FiTrash2,
  FiPlusCircle,
  FiUser,
  FiEye,
  FiHeart,
  FiAlertCircle,
  FiEdit,
  FiChevronRight,
} from "react-icons/fi";
import { FaRegNewspaper, FaRegComment } from "react-icons/fa";
import { RiPieChart2Line } from "react-icons/ri";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalViews, setTotalViews] = useState(0);
  const [topLikedBlog, setTopLikedBlog] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        const token = await currentUser.getIdToken();
        try {
          const res = await axios.get(
            "https://aljazeera-web.onrender.com/api/users/me",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.data.blocked) {
            alert("❌ تم حظرك من استخدام هذا الموقع");
            await auth.signOut();
            navigate("/home");
            return;
          }

          setUser(currentUser);
          await fetchUserBlogs(currentUser.email);
          setLoading(false);
        } catch (err) {
          console.error("🚫 Block check failed:", err);
          alert("حدث خطأ. الرجاء إعادة تسجيل الدخول.");
          await auth.signOut();
          navigate("/home");
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchUserBlogs = async (email) => {
    try {
      const res = await axios.get(
        `https://aljazeera-web.onrender.com/api/blogs/user?email=${email}`
      );
      const data = res.data;
      setBlogs(data);

      // Calculate stats
      const views = data.reduce((sum, blog) => sum + (blog.views || 0), 0);
      setTotalViews(views);

      const mostLiked = data.reduce(
        (max, blog) =>
          (blog.likes?.length || 0) > (max.likes?.length || 0) ? blog : max,
        data[0] || {}
      );
      setTopLikedBlog(mostLiked);
    } catch (err) {
      console.error("Failed to load blogs:", err);
      setError("حدث خطأ أثناء تحميل المقالات");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/home");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm("هل أنت متأكد من حذف هذه المقالة؟")) {
      try {
        await axios.delete(
          `https://aljazeera-web.onrender.com/api/blogs/${blogId}`
        );
        setBlogs(blogs.filter((blog) => blog._id !== blogId));
        fetchUserBlogs(user.email);
      } catch (err) {
        console.error("Failed to delete blog:", err);
        setError("حدث خطأ أثناء حذف المقالة");
      }
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 py-8 px-4 sm:px-6"
      style={{ fontFamily: "tajawal, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative bg-gradient-to-br from-green-100 to-emerald-200 p-1 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="absolute -inset-1.5 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              {user.photoURL ? (
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  src={user.photoURL}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white border-4 border-white flex items-center justify-center">
                  <FiUser className="text-green-700 text-2xl" />
                </div>
              )}
            </motion.div>
            <div>
              <motion.h1
                whileHover={{ x: 5 }}
                className="text-2xl md:text-3xl font-bold text-gray-800 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text "
              >
                مرحباً، {user.displayName || user.email.split("@")[0]}
              </motion.h1>
              <motion.p
                whileHover={{ x: 5 }}
                className="text-gray-500 font-medium"
              >
                لوحة تحكم مدونة الطالب
              </motion.p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/submit")}
              className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl group"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
              <FiPlusCircle className="text-lg" />
              <span className="font-medium">مقالة جديدة</span>
            </motion.button>

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(220, 38, 38, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="relative flex items-center gap-2 px-6 py-3 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all shadow-sm hover:shadow-md group"
            >
              <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
              <FiLogOut className="text-lg" />
              <span className="font-medium">تسجيل الخروج</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="my-8 grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-green-50 to-white p-5 rounded-2xl shadow-sm border border-green-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  إجمالي المشاهدات
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {totalViews}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FiEye className="text-xl" />
              </div>
            </div>
            <div className="mt-3 h-1 bg-green-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
              />
            </div>
          </motion.div>

          {topLikedBlog && (
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-pink-50 to-white p-5 rounded-2xl shadow-sm border border-pink-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    المقالة الأكثر إعجابًا
                  </p>
                  <Link
                    to={`/blog/${topLikedBlog.slug}`}
                    className="text-lg font-bold text-gray-800 hover:text-pink-600 transition-colors line-clamp-1"
                  >
                    {topLikedBlog.title}
                  </Link>
                </div>
                <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                  <FiHeart className="text-xl" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-pink-600 font-medium">
                  {topLikedBlog.likes?.length || 0} إعجاب
                </span>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="text-pink-600 flex items-center text-sm font-medium"
                >
                  <span>عرض المقال</span>
                  <FiChevronRight className="mr-1" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Blog List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
            <motion.div
              className="flex items-center justify-between"
              whileHover={{ scale: 1.01 }}
            >
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg text-green-600">
                  <FaRegNewspaper className="text-xl" />
                </div>
                <span>مقالاتك المنشورة</span>
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RiPieChart2Line />
                <span>{blogs.length} مقالة</span>
              </div>
            </motion.div>
          </div>

          {loading ? (
            <div className="p-8 flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"
              ></motion.div>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-center text-red-500 bg-red-50 rounded-lg mx-4 my-4 flex items-center justify-center gap-2"
            >
              <FiAlertCircle className="text-xl" />
              <span>{error}</span>
            </motion.div>
          ) : blogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
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
                📭
              </motion.div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                لم تقم بنشر أي مقالات بعد
              </h3>
              <p className="text-gray-500 mb-6">
                ابدأ بمشاركة معرفتك مع المجتمع الأكاديمي
              </p>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/submit")}
                className="relative px-6 py-3 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl group"
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                ابدأ بنشر مقالتك الأولى
              </motion.button>
            </motion.div>
          ) : (
            <ul className="divide-y divide-gray-200">
              <AnimatePresence>
                {blogs.map((blog) => (
                  <motion.li
                    key={blog._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 hover:bg-gradient-to-r from-green-50/50 to-white transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          to={`/blog/${blog.slug}`}
                          className="group-hover:underline underline-offset-4 decoration-green-600"
                        >
                          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">
                            {blog.title}
                          </h3>
                        </Link>
                        <div className="flex flex-wrap gap-3 mb-3 items-center text-xs">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full shadow-sm"
                          >
                            {blog.category}
                          </motion.span>
                          <span className="text-gray-500">
                            {new Date(blog.createdAt).toLocaleDateString(
                              "ar-EG"
                            )}
                          </span>
                          <span className="text-gray-600 flex items-center gap-1">
                            <FiEye className="text-green-600" />
                            {blog.views || 0} مشاهدة
                          </span>
                          <span className="text-pink-600 flex items-center gap-1">
                            <FiHeart className="text-pink-600" />
                            {blog.likes?.length || 0} إعجاب
                          </span>
                        </div>
                        <p className="text-gray-700 line-clamp-2 mb-4">
                          {blog.content}
                        </p>
                        <Link
                          to={`/article/${blog.slug}`}
                          className="inline-flex items-center text-sm text-green-600 font-medium hover:text-green-800 transition-colors"
                        >
                          <span>قراءة المقال</span>
                          <FiChevronRight className="mr-1" />
                        </Link>
                      </div>
                      <div className="flex gap-2 self-start md:self-center">
                        <motion.button
                          whileHover={{
                            scale: 1.1,
                            backgroundColor: "rgba(220, 38, 38, 0.1)",
                          }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteBlog(blog._id)}
                          className="p-2 text-red-600 rounded-lg transition-all"
                          title="حذف"
                        >
                          <FiTrash2 className="text-lg" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
