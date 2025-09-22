import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import CommentSectionToggle from "../components/CommentSectionToggle";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import {
  FiClock,
  FiUser,
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
} from "react-icons/fi";
import { FaRegNewspaper } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
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

  // --- OPTIMIZED DATA FETCHING ---
  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        // Step 1: Fetch the main article first. This is the only blocking request.
        const res = await axios.get(
          `https://aljazeera-web.onrender.com/api/blogs/${slug}`
        );
        const blog = res.data;
        setArticle(blog);

        // Step 2: Once we have the blog, we can fetch all other data in parallel.
        if (blog?.authorId && blog?.email && blog?.category) {
          const promises = [
            axios.get(
              `https://aljazeera-web.onrender.com/api/users/${blog.email}`
            ),
            axios.get(
              `https://aljazeera-web.onrender.com/api/blogs?category=${blog.category}`
            ),
            axios.get(
              `https://aljazeera-web.onrender.com/api/follow/${blog.authorId}/followers`
            ),
            axios.get(
              `https://aljazeera-web.onrender.com/api/follow/${blog.authorId}/following`
            ),
          ];

          // Promise.all runs all requests at the same time for max speed.
          const [userRes, relatedRes, followersRes, followingRes] =
            await Promise.all(promises);

          // Step 3: Set state with all the fetched data.
          if (userRes.data?.photoUrl) setUserPhoto(userRes.data.photoUrl);
          setRelated(
            relatedRes.data.filter((a) => a.slug !== slug).slice(0, 3)
          );
          setFollowersCount(followersRes.data.followers || 0);
          setFollowingCount(followingRes.data.following || 0);
        }
      } catch (err) {
        console.error("Failed to fetch article data:", err);
        setArticle(null); // Set article to null on error to show the "Not Found" page
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();

    // Firebase auth listener remains the same.
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

  // Check if current user follows this author (runs after initial data is loaded)
  useEffect(() => {
    if (!article?.authorId || !currentUser || !token) return;

    const checkFollowingStatus = async () => {
      try {
        const res = await axios.get(
          `https://aljazeera-web.onrender.com/api/follow/check/${article.authorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(res.data.isFollowing);
      } catch (err) {
        console.warn("Could not check following status:", err);
      }
    };

    checkFollowingStatus();
  }, [article, currentUser, token]);

  // --- BULLETPROOF FOLLOW/UNFOLLOW HANDLER ---
  const toggleFollow = async () => {
    if (!currentUser) return alert("يجب تسجيل الدخول للمتابعة");
    if (!article?.authorId || !token)
      return console.warn("Author ID or token not found");

    // 1. Store the original state before the API call for potential rollback.
    const originalIsFollowing = isFollowing;
    const originalFollowersCount = followersCount;

    // 2. Optimistically update the UI for a snappy user experience.
    setIsFollowing(!originalIsFollowing);
    setFollowersCount((prev) => prev + (originalIsFollowing ? -1 : 1));

    try {
      const url = `https://aljazeera-web.onrender.com/api/follow/${article.authorId}`;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 3. Use the correct HTTP method based on the action.
      if (originalIsFollowing) {
        // Use DELETE for unfollowing
        await axios.delete(`${url}/unfollow`, config);
      } else {
        // Use POST for following
        await axios.post(`${url}/follow`, {}, config);
      }
    } catch (err) {
      console.error(
        "Failed to update follow status. Reverting UI.",
        err.response?.data || err
      );

      // 4. If the API call fails, revert the UI back to its original state.
      setIsFollowing(originalIsFollowing);
      setFollowersCount(originalFollowersCount);
      alert("حدث خطأ ما، يرجى المحاولة مرة أخرى");
    }
  };

  // --- RENDER LOGIC (No changes here) ---

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-[tajawal,sans-serif]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-t-4 border-green-600 border-opacity-80 rounded-full"
        ></motion.div>
      </div>
    );

  if (!article)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          😕
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          المقال غير موجود
        </h2>
        <p className="text-gray-600 mb-6">
          قد يكون المقال قد تم حذفه أو العنوان غير صحيح
        </p>
        <Link
          to="/blogs"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
        >
          تصفح المقالات الأخرى
        </Link>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-right px-4 md:px-8 lg:px-12 py-8 max-w-6xl mx-auto"
      >
        {/* Back Button */}
        <motion.div whileHover={{ x: 5 }} className="mb-6">
          <Link
            to="/blogs"
            className="flex items-center text-green-600 hover:text-green-800 font-medium"
          >
            <FiArrowLeft className="ml-1" /> العودة للمقالات
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            className="inline-block px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4"
          >
            {article.category}
          </motion.span>
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 my-3 leading-tight flex items-center gap-2 flex-wrap">
            {article.title}
            {article.verified && (
              <FiCheckCircle
                className="inline text-cyan-600"
                title="مقال موثوق"
              />
            )}
          </h1>
          <div className="flex items-center flex-wrap gap-4 text-gray-600 mt-4">
            <div className="flex items-center">
              <FiUser className="ml-1 text-green-600" />
              <span className="font-medium flex items-center gap-2">
                <Link
                  to={`/profile/${article.email}`}
                  className="hover:underline"
                >
                  {article.author}
                </Link>
                {article.email === "ajua46244@gmail.com" && (
                  <span className="bg-yellow-100 flex gap-1 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                    <MdAdminPanelSettings /> Admin
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center">
              <FiClock className="ml-1 text-green-600" />
              <span>
                {new Date(article.createdAt).toLocaleDateString("ar-EG")}
              </span>
            </div>
            <div className="flex items-center">
              <FiBookOpen className="ml-1 text-green-600" />
              <span>وقت القراءة: {readingTime} دقائق</span>
            </div>
          </div>
        </motion.div>

        {/* Blog Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6"
        >
          {article.category === "الأشعار" ? (
            <div className="text-center space-y-4 font-[Amiri] text-xl text-gray-800 leading-loose">
              {article.content
                .split("\n")
                .filter((line) => line.trim() !== "")
                .map((line, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {line}
                  </p>
                ))}
            </div>
          ) : (
            <div
              className="prose max-w-none text-right break-words"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(article.content),
              }}
            />
          )}
        </motion.div>

        {/* Author Info & Follow */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-12 flex flex-col md:flex-row items-center gap-6 border border-green-200"
        >
          <motion.div
            whileHover={{ rotate: 10 }}
            className="w-20 h-20 rounded-full overflow-hidden shadow-md bg-green-100 flex items-center justify-center"
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={article.author}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-green-800 font-bold text-3xl">
                {article.author?.charAt(0) || "؟"}
              </span>
            )}
          </motion.div>
          <div className="text-center md:text-right flex-1">
            <h4 className="font-bold text-xl text-green-800">
              {article.author}
            </h4>
            <p className="text-gray-600 mt-2 break-all">
              <a
                href={`mailto:${article.email}`}
                className="text-green-700 hover:underline"
              >
                {article.email}
              </a>
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
              <button
                onClick={toggleFollow}
                disabled={!currentUser || currentUser.email === article.email}
                className={`px-4 py-1.5 rounded-full font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFollowing
                    ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isFollowing ? "إلغاء المتابعة" : "متابعة"}
              </button>
              <span className="text-gray-600 text-sm">
                متابعين {followersCount}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Related Articles */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-green-800 mb-6 pb-2 border-b-2 border-green-200 flex items-center gap-2">
              <FaRegNewspaper className="text-green-600" />{" "}
              <span>مقالات ذات صلة</span>
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all border border-gray-100"
                >
                  <span className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-lg my-3 text-gray-800">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.content.replace(/<[^>]+>/g, "").substring(0, 100)}...
                  </p>
                  <motion.div whileHover={{ x: -5 }}>
                    <Link
                      to={`/blog/${item.slug}`}
                      className="text-green-600 hover:text-green-800 font-medium flex items-center justify-end"
                    >
                      <span>اقرأ المزيد</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                        className="mr-2"
                      >
                        →
                      </motion.span>
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comment Section Toggle */}
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
      </motion.div>
    </>
  );
};

export default ArticlePage;
