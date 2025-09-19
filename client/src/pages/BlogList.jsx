import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiEye, FiHeart, FiThumbsDown, FiSearch, FiStar } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// This component defines the look of the placeholder card
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex justify-between items-center mb-3">
      <Skeleton width={80} height={28} borderRadius="9999px" />
      <Skeleton width={80} height={28} borderRadius="9999px" />
    </div>
    <h3 className="text-xl font-bold my-2">
      <Skeleton height={24} />
    </h3>
    <p className="text-gray-600 mb-4">
      <Skeleton count={3} />
    </p>
  </div>
);

const BlogList = ({ userEmail }) => {
  const [articles, setArticles] = useState([]);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();

  const ADMIN_EMAIL = ["ajua46244@gmail.com", "lisanuljazeerahisan@gmail.com"];

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
      setLoading(true); // Start loading to show skeletons
      try {
        if (userEmail) {
          const userRes = await axios.get(
            `https://aljazeera-web-my5l.onrender.com/api/users/status/${userEmail}`
          );
          const isUserBlocked = userRes.data.blocked;
          const isAdmin = ADMIN_EMAIL.includes(userEmail);

          if (isUserBlocked && !isAdmin) {
            setIsBlocked(true);
            return;
          }
        }

        const blogRes = await axios.get(
          "https://aljazeera-web-my5l.onrender.com/api/blogs"
        );

        const sortedArticles = blogRes.data.sort((a, b) => {
          const isAdminA = ADMIN_EMAIL.includes(a.email);
          const isAdminB = ADMIN_EMAIL.includes(b.email);

          if (isAdminA && !isAdminB) return -1;
          if (!isAdminA && isAdminB) return 1;

          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setArticles(sortedArticles);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        toast.error("حدث خطأ أثناء تحميل المقالات");
      } finally {
        setLoading(false); // Stop loading, whether it succeeded or failed
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

  const handleReadMoreClick = (slug) => {
    if (!userEmail) {
      toast.error("يرجى تسجيل الدخول لقراءة المقال كاملاً");
      navigate("/login");
      return;
    }
    handleView(slug);
    navigate(`/blog/${slug}`);
  };

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      activeCategory === "الكل" || article.category === activeCategory;
    const plainTextContent = article.content?.replace(/<[^>]+>/g, "") || "";
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plainTextContent.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f1f5f9">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-right px-4 md:px-8 lg:px-12 py-8 font-[sans-serif] bg-gradient-to-b from-green-50 to-white min-h-screen"
        style={{ fontFamily: "tajawal, sans-serif" }}
      >
        {/* Hero Section */}
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

        {/* Filter & Search Section */}
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

        {/* Articles Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // If loading, show the skeleton cards
            Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : // Otherwise, show the articles or the 'not found' message
          filteredArticles.length > 0 ? (
            filteredArticles.map((article, index) => (
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
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 group flex flex-col"
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        article.category === "التعليم"
                          ? "bg-blue-100 text-blue-800"
                          : article.category === "الأشعار"
                          ? "bg-purple-100 text-purple-800"
                          : article.category === "قصص الأطفال"
                          ? "bg-pink-100 text-pink-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {article.category}
                    </span>
                    {ADMIN_EMAIL.includes(article.email) && (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
                        <FiStar className="text-amber-500" />
                        إشراف
                      </span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold my-2 text-gray-800">
                      {article.title}
                    </h3>
                    {article.category === "الأشعار" ? (
                      <div className="text-gray-600 mb-4 whitespace-pre-line line-clamp-4 text-sm font-[Amiri]">
                        {article.content.split("\n").slice(0, 4).join("\n")}
                        {article.content.split("\n").length > 4 ? "..." : ""}
                      </div>
                    ) : (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.content.replace(/<[^>]+>/g, "").slice(0, 100)}
                        ...
                      </p>
                    )}
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <FiEye className="text-green-600" />
                        <span>{article.views || 0} مشاهدة</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(article.createdAt).toLocaleDateString(
                          "ar-EG"
                        )}
                      </span>
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
                      <button
                        onClick={() => handleReadMoreClick(article.slug)}
                        className="text-green-600 hover:text-green-800 font-medium group"
                      >
                        <span className="group-hover:underline">
                          اقرأ المزيد
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl p-8 text-center"
              >
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
            </div>
          )}
        </div>
      </motion.div>
    </SkeletonTheme>
  );
};

export default BlogList;
