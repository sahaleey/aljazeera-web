import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiEye,
  FiHeart,
  FiThumbsDown,
  FiSearch,
  FiClock,
} from "react-icons/fi";
import { toast } from "react-toastify";

const BlogList = ({ userEmail }) => {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "الكل",
    "التعليم",
    "الأشعار",
    "قصص الأطفال",
    "قصص قصيرة",
    "المقالات",
  ];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        if (userEmail) {
          const userRes = await axios.get(
            `https://aljazeera-web-my5l.onrender.com/api/users/status/${userEmail}`
          );
          const isBlocked = userRes.data.blocked;
          const isAdmin = userEmail === "ajua46244@gmail.com";

          if (isBlocked && !isAdmin) {
            setIsBlocked(true);
            return;
          }
        }

        const blogRes = await axios.get(
          "https://aljazeera-web-my5l.onrender.com/api/blogs"
        );
        setArticles(blogRes.data.reverse());
      } catch (err) {
        console.error(
          "❌ Error fetching articles or checking user status:",
          err
        );
        toast.error("حدث خطأ أثناء تحميل المقالات");
      }
    };

    fetchArticles();
  }, [userEmail]);

  const handleLike = async (slug) => {
    if (!userEmail) return navigate("/login");
    try {
      const res = await axios.patch(
        `https://aljazeera-web-my5l.onrender.com/api/blogs/like/${slug}`,
        { email: userEmail }
      );
      setArticles((prev) =>
        prev.map((a) =>
          a.slug === slug
            ? { ...a, likes: res.data.likes, dislikes: res.data.dislikes }
            : a
        )
      );
    } catch (err) {
      console.error("Error liking blog:", err);
    }
  };

  const handleDislike = async (slug) => {
    if (!userEmail) return navigate("/login");
    try {
      const res = await axios.patch(
        `https://aljazeera-web-my5l.onrender.com/api/blogs/dislike/${slug}`,
        { email: userEmail }
      );
      setArticles((prev) =>
        prev.map((a) =>
          a.slug === slug
            ? { ...a, likes: res.data.likes, dislikes: res.data.dislikes }
            : a
        )
      );
    } catch (err) {
      console.error("Error disliking blog:", err);
    }
  };

  const handleView = async (slug) => {
    if (!userEmail) return;
    try {
      const res = await axios.patch(
        `https://aljazeera-web-my5l.onrender.com/api/blogs/view/${slug}`,
        { email: userEmail }
      );
      setArticles((prev) =>
        prev.map((a) => (a.slug === slug ? { ...a, views: res.data.views } : a))
      );
    } catch (err) {
      console.error("Error updating view count:", err);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      activeCategory === "الكل" || article.category === activeCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-200 max-w-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">🚫 تم الحظر</h2>
          <p className="text-gray-600 mb-6">
            لقد تم حظرك من استخدام هذا القسم. إذا كنت تعتقد أن هذا تم عن طريق
            الخطأ، يرجى التواصل مع الإدارة.
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            العودة إلى الصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Return your original JSX if not blocked...
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-right px-4 md:px-8 lg:px-12 py-8 font-[sans-serif] bg-gradient-to-b from-green-50 to-white min-h-screen"
      style={{ fontFamily: "tajawal, sans-serif" }}
    >
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl p-8 md:p-10 shadow-lg relative overflow-hidden"
      >
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-300 rounded-full opacity-10"></div>
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-400 rounded-full opacity-10"></div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-3">
            المقالات التعليمية
          </h1>
          <p className="text-lg md:text-xl text-green-700 max-w-2xl">
            تصفح مجموعة المقالات التعليمية والثقافية المفيدة للطلاب
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 inline-block"
          >
            <Link
              to="/submit"
              className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              أضف مقالتك ✍️
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Filter & Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-10 bg-white p-5 rounded-xl shadow-md sticky top-2 z-10 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md"
                    : "bg-white text-green-600 border border-green-200 hover:bg-green-50"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مقالات..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </motion.div>

      {/* Articles */}
      {filteredArticles.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredArticles.map((article, index) => (
            <motion.div
              key={article._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{
                y: -10,
                boxShadow:
                  "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 group"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      article.category === "التعليم"
                        ? "bg-blue-100 text-blue-800"
                        : article.category === "الصحة"
                        ? "bg-green-100 text-green-800"
                        : article.category === "ثقافة"
                        ? "bg-purple-100 text-purple-800"
                        : article.category === "نفسية"
                        ? "bg-pink-100 text-pink-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {article.category}
                  </motion.span>
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-2xl"
                  >
                    📝
                  </motion.span>
                </div>

                <div className="flex-grow">
                  <motion.h3
                    whileHover={{ color: "#047857" }}
                    className="text-xl font-bold my-2 text-gray-800 transition-colors duration-300"
                  >
                    {article.title}
                  </motion.h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.content.slice(0, 100)}...
                  </p>
                </div>

                {/* Stats */}
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FiEye className="text-green-600" />
                      <span>{article.views || 0} مشاهدة</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="text-green-600" />
                      <span>
                        {Math.ceil(article.content.split(" ").length / 150)}{" "}
                        دقائق
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLike(article.slug)}
                        disabled={!userEmail || article.email === userEmail}
                        className={`flex items-center gap-1 ${
                          article.likes?.includes(userEmail)
                            ? "text-pink-600"
                            : "text-gray-500 hover:text-pink-600"
                        } disabled:opacity-50 transition-colors`}
                      >
                        <FiHeart className="text-lg" />
                        <span>{article.likes?.length || 0}</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDislike(article.slug)}
                        disabled={!userEmail || article.email === userEmail}
                        className={`flex items-center gap-1 ${
                          article.dislikes?.includes(userEmail)
                            ? "text-red-600"
                            : "text-gray-500 hover:text-red-600"
                        } disabled:opacity-50 transition-colors`}
                      >
                        <FiThumbsDown className="text-lg" />
                        <span>{article.dislikes?.length || 0}</span>
                      </motion.button>
                    </div>

                    <span className="text-xs text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>

                {/* Read More */}
                <motion.div whileHover={{ x: -5 }} className="mt-4">
                  {userEmail ? (
                    <Link
                      to={`/blog/${article.slug}`}
                      onClick={() => handleView(article.slug)}
                      className="flex items-center justify-end text-green-600 hover:text-green-800 font-medium group"
                    >
                      <span className="mr-2 group-hover:underline">
                        اقرأ المزيد
                      </span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-lg"
                      >
                        →
                      </motion.span>
                    </Link>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => navigate("/login")}
                      className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-2"
                    >
                      <span>🔐</span>
                      <span>سجل الدخول لقراءة المقال</span>
                    </motion.button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-4"
          >
            😕
          </motion.div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            لا توجد مقالات متاحة
          </h3>
          <p className="text-gray-600 mb-4">
            لم يتم العثور على مقالات تطابق معايير البحث الخاصة بك
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveCategory("الكل");
              setSearchQuery("");
            }}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            عرض جميع المقالات
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BlogList;
