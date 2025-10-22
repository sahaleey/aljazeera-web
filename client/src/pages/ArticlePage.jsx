import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import CommentSectionToggle from "../components/CommentSectionToggle";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import {
  FiClock,
  FiUser,
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
  FiHeart,
  FiShare2,
  FiBookmark,
  FiEye,
  FiUsers,
  FiCalendar,
} from "react-icons/fi";
import { FaRegNewspaper, FaQuoteLeft, FaRegCopy } from "react-icons/fa";
import {
  MdAdminPanelSettings,
  MdOutlineVerified,
  MdOutlineTrendingUp,
} from "react-icons/md";
import { IoStatsChart, IoTimeOutline } from "react-icons/io5";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet-async";

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [userPhoto, setUserPhoto] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Enhanced data fetching with loading states
  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://aljazeera-web-my5l.onrender.com/api/blogs/${slug}`
        );
        const blog = res.data;
        setArticle(blog);

        if (blog?.authorId && blog?.email && blog?.category) {
          const promises = [
            axios.get(
              `https://aljazeera-web-my5l.onrender.com/api/users/${blog.email}`
            ),
            axios.get(
              `https://aljazeera-web-my5l.onrender.com/api/blogs?category=${blog.category}`
            ),
            axios.get(
              `https://aljazeera-web-my5l.onrender.com/api/follow/${blog.authorId}/followers`
            ),
            axios.get(
              `https://aljazeera-web-my5l.onrender.com/api/follow/${blog.authorId}/following`
            ),
          ];

          const [userRes, relatedRes, followersRes, followingRes] =
            await Promise.all(promises);

          if (userRes.data?.photoUrl) setUserPhoto(userRes.data.photoUrl);
          setRelated(
            relatedRes.data.filter((a) => a.slug !== slug).slice(0, 3)
          );
          setFollowersCount(followersRes.data.followers || 0);
          setFollowingCount(followingRes.data.following || 0);
        }
      } catch (err) {
        console.error("Failed to fetch article data:", err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userToken = await user.getIdToken();
        setToken(userToken);
      } else {
        setCurrentUser(null);
        setToken(null);
      }
    });

    return () => unsubscribe();
  }, [slug]);

  useEffect(() => {
    if (!article?.authorId || !currentUser || !token) return;

    const checkFollowingStatus = async () => {
      try {
        const res = await axios.get(
          `https://aljazeera-web-my5l.onrender.com/api/follow/check/${article.authorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(res.data.isFollowing);
      } catch (err) {
        console.warn("Could not check following status:", err);
      }
    };

    checkFollowingStatus();
  }, [article, currentUser, token]);

  const toggleFollow = async () => {
    if (!currentUser) return alert("يجب تسجيل الدخول للمتابعة");
    if (!article?.authorId || !token) return;

    const originalIsFollowing = isFollowing;
    const originalFollowersCount = followersCount;

    setIsFollowing(!originalIsFollowing);
    setFollowersCount((prev) => prev + (originalIsFollowing ? -1 : 1));

    try {
      const url = `https://aljazeera-web-my5l.onrender.com/api/follow/${article.authorId}`;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (originalIsFollowing) {
        await axios.delete(`${url}/unfollow`, config);
      } else {
        await axios.post(`${url}/follow`, {}, config);
      }
    } catch (err) {
      console.error("Failed to update follow status:", err);
      setIsFollowing(originalIsFollowing);
      setFollowersCount(originalFollowersCount);
      alert("حدث خطأ ما، يرجى المحاولة مرة أخرى");
    }
  };

  const handleShare = async (platform = "copy") => {
    const url = window.location.href;
    const title = article?.title;

    try {
      if (platform === "copy") {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (platform === "twitter") {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            title
          )}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
      } else if (platform === "whatsapp") {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
          "_blank"
        );
      }
      setShowShareMenu(false);
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Add bookmark functionality here
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-[tajawal,sans-serif] bg-gradient-to-br from-green-50/50 via-white to-blue-50/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-green-400/30 border-t-green-600 rounded-full mx-auto mb-6"
          ></motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-green-700 font-semibold text-lg"
          >
            جاري تحميل المقال...
          </motion.p>
        </motion.div>
      </div>
    );

  if (!article)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-red-50/50 via-white to-orange-50/50">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30"
        >
          <motion.div className="text-8xl mb-6 text-gradient animate-bounce">
            😕
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            المقال غير موجود
          </h2>
          <p className="text-gray-600 mb-8 text-lg max-w-md">
            قد يكون المقال قد تم حذفه أو العنوان غير صحيح
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <FiArrowLeft className="ml-2" />
            تصفح المقالات الأخرى
          </Link>
        </motion.div>
      </div>
    );

  const plainTextContent = article.content.replace(/<[^>]+>/g, "");
  const wordCount = plainTextContent.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <>
      <Helmet>
        <title>{`${article.title} | Al Jazeera Blog`}</title>
        <meta name="description" content={plainTextContent.slice(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-blue-50/30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Enhanced Back Button */}
          <motion.div whileHover={{ x: 5 }} className="mb-8">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-green-700 hover:text-green-900 font-medium px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30"
            >
              <FiArrowLeft className="ml-2" />
              العودة للمقالات
            </Link>
          </motion.div>

          {/* Main Content Container */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Stats Card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <IoStatsChart className="text-green-600" />
                  إحصائيات المقال
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FiEye className="text-blue-500" />
                      المشاهدات
                    </span>
                    <span className="font-semibold">
                      {(article.views || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <IoTimeOutline className="text-green-500" />
                      وقت القراءة
                    </span>
                    <span className="font-semibold">{readingTime} دقائق</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FiCalendar className="text-purple-500" />
                      تاريخ النشر
                    </span>
                    <span className="font-semibold">
                      {new Date(article.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-3 px-4 py-3 bg-blue-500/20 text-blue-700 rounded-xl hover:bg-blue-600/30 transition-all duration-300 border border-blue-400/30"
                  >
                    <FiShare2 />
                    مشاركة
                  </motion.button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/90 backdrop-blur-md rounded-xl p-3 space-y-2 border border-gray-200/50"
                      >
                        <button
                          onClick={() => handleShare("copy")}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-gray-100/50 transition-colors"
                        >
                          <FaRegCopy />
                          {copied ? "تم النسخ!" : "نسخ الرابط"}
                        </button>
                        <button
                          onClick={() => handleShare("twitter")}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-blue-100/50 transition-colors"
                        >
                          𝕏 Twitter
                        </button>
                        <button
                          onClick={() => handleShare("whatsapp")}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-green-100/50 transition-colors"
                        >
                          WhatsApp
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Main Article Content */}
            <div className="lg:col-span-3">
              {/* Enhanced Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl mb-8 border border-white/30"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-800 rounded-full text-sm font-semibold mb-4 border border-green-400/30"
                >
                  <MdOutlineTrendingUp />
                  {article.category}
                </motion.span>

                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent my-4 leading-tight flex items-center gap-3 flex-wrap">
                  {article.title}
                  {article.verified && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="inline-flex items-center gap-1 text-cyan-600"
                      title="مقال موثوق"
                    >
                      <MdOutlineVerified className="text-2xl" />
                    </motion.span>
                  )}
                </h1>

                <div className="flex items-center flex-wrap gap-6 text-gray-600 mt-6">
                  <div className="flex items-center gap-2 bg-green-50/50 px-4 py-2 rounded-xl">
                    <FiUser className="text-green-600" />
                    <span className="font-medium flex items-center gap-2">
                      <Link
                        to={`/profile/${article.email}`}
                        className="hover:underline text-green-700"
                      >
                        {article.author}
                      </Link>
                      {article.email === "ajua46244@gmail.com" && (
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                          <MdAdminPanelSettings /> Admin
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-blue-50/50 px-4 py-2 rounded-xl">
                    <FiCalendar className="text-blue-600" />
                    <span>
                      {new Date(article.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-purple-50/50 px-4 py-2 rounded-xl">
                    <FiBookOpen className="text-purple-600" />
                    <span>وقت القراءة: {readingTime} دقائق</span>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Blog Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl mb-8 border border-white/30 overflow-hidden"
              >
                {article.category === "الأشعار" ? (
                  <div className="p-8 md:p-12 text-center space-y-6 font-[Amiri] text-2xl text-gray-800 leading-loose bg-gradient-to-br from-green-50/30 to-blue-50/30">
                    {article.content
                      .split("\n")
                      .filter((line) => line.trim() !== "")
                      .map((line, i) => (
                        <motion.p
                          key={i}
                          className="whitespace-pre-line"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          {line}
                        </motion.p>
                      ))}
                  </div>
                ) : (
                  <div className="p-8 md:p-12">
                    <div
                      className="prose prose-lg max-w-none text-right break-words prose-headings:text-green-800 prose-p:text-gray-700 prose-strong:text-green-700 prose-a:text-blue-600 prose-blockquote:border-green-400 prose-blockquote:bg-green-50/50 prose-blockquote:italic prose-blockquote:p-4 prose-blockquote:rounded-xl"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(article.content),
                      }}
                    />
                  </div>
                )}
              </motion.div>

              {/* Enhanced Author Info */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-3xl p-8 mb-12 border border-white/30 backdrop-blur-lg shadow-2xl"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="relative"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-600 to-blue-300 p-1">
                      {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt={article.author}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/90 rounded-xl flex items-center justify-center">
                          <span className="text-3xl font-bold text-green-700">
                            {article.author?.charAt(0) || "؟"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                      <FiUser className="w-4 h-4" />
                    </div>
                  </motion.div>

                  <div className="text-center md:text-right flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                      <h4 className="font-bold text-2xl text-green-800">
                        {article.author}
                      </h4>
                      {article.verified && (
                        <MdOutlineVerified className="text-2xl text-cyan-600" />
                      )}
                    </div>

                    <p className="text-gray-600 mb-6 break-all">
                      <a
                        href={`mailto:${article.email}`}
                        className="text-green-700 hover:underline font-medium"
                      >
                        {article.email}
                      </a>
                    </p>

                    <div className="flex items-center justify-center md:justify-start gap-6">
                      <button
                        onClick={toggleFollow}
                        disabled={
                          !currentUser || currentUser.email === article.email
                        }
                        className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                          isFollowing
                            ? "bg-gray-200/80 text-gray-800 hover:bg-gray-300/80 backdrop-blur-sm"
                            : " bg-green-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl"
                        }`}
                      >
                        <FiUsers />
                        {isFollowing ? "إلغاء المتابعة" : "متابعة الكاتب"}
                      </button>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1 bg-white/50 px-3 py-1 rounded-lg">
                          <FiUsers className="text-green-600" />
                          {followersCount} متابع
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Related Articles */}
              {related.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="mb-16"
                >
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent mb-8 pb-4 border-b-2 border-green-200/50 flex items-center gap-3">
                    <FaRegNewspaper className="text-green-600 text-2xl" />
                    مقالات ذات صلة
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {related.map((item, index) => (
                      <motion.article
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/30 group"
                      >
                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-800 rounded-full text-xs font-semibold mb-4">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-lg my-3 text-gray-800 group-hover:text-green-700 transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {item.content
                            .replace(/<[^>]+>/g, "")
                            .substring(0, 120)}
                          ...
                        </p>
                        <motion.div whileHover={{ x: -5 }}>
                          <Link
                            to={`/blog/${item.slug}`}
                            className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-semibold transition-all group"
                          >
                            <span>اقرأ المزيد</span>
                            <motion.span
                              animate={{ x: [0, 5, 0] }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                              }}
                              className="group-hover:translate-x-1 transition-transform"
                            >
                              →
                            </motion.span>
                          </Link>
                        </motion.div>
                      </motion.article>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Enhanced Comment Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-12"
              >
                <CommentSectionToggle
                  blogSlug={article.slug}
                  user={currentUser}
                  token={token}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ArticlePage;
