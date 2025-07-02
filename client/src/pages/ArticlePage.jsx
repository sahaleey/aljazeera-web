import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FiClock, FiUser, FiArrowLeft, FiBookOpen } from "react-icons/fi";
import { FaRegNewspaper } from "react-icons/fa";
import { auth } from "../firebase"; // adjust path if needed
import { onAuthStateChanged } from "firebase/auth";
import { HiBadgeCheck } from "react-icons/hi";

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await axios.get(
          `https://aljazeera-web.onrender.com/api/blogs/${slug}`
        );
        setArticle(res.data);

        const relatedRes = await axios.get(
          `https://aljazeera-web.onrender.com/api/blogs?category=${res.data.category}`
        );
        const filteredRelated = relatedRes.data.filter((a) => a.slug !== slug);
        setRelated(filteredRelated.slice(0, 3));
      } catch (err) {
        console.error("Blog not found", err);
      } finally {
        setLoading(false);
      }
    };

    // ✅ Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;
        const name = user.displayName || email.split("@")[0];
        setUserEmail(email);

        try {
          // ✅ Send user info to MongoDB via your backend
          await axios.post(
            "https://aljazeera-web.onrender.com/api/users/register",
            {
              email,
              name,
            }
          );
        } catch (err) {
          console.error("User registration failed:", err.message);
        }
      } else {
        setUserEmail(null);
      }
    });

    fetchArticle();

    return () => unsubscribe();
  }, [slug]);

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

  const wordCount = article.content.split(" ").length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
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
          <FiArrowLeft className="ml-1" />
          العودة للمقالات
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
        <h1 className="text-3xl md:text-4xl font-bold text-green-800 my-3 leading-tight">
          {article.title}
        </h1>
        <div className="flex items-center flex-wrap gap-4 text-gray-600 mt-4">
          <div className="flex items-center">
            <FiUser className="ml-1 text-green-600" />
            <span className="font-medium flex items-center gap-2">
              {article.author}
              {article.email === "ajua46244@gmail.com" && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                  👑 Admin
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
        className={`bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12 ${
          article.category === "الأشعار"
            ? "text-center space-y-4 font-[Amiri] text-xl text-gray-800 leading-loose"
            : "leading-relaxed prose max-w-none prose-p:mb-6 prose-p:text-gray-700 prose-p:text-lg prose-h2:text-green-800 prose-h2:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-green-700 prose-h3:font-semibold prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-ul:pr-6 prose-ul:list-disc prose-li:mb-2 prose-blockquote:border-r-4 prose-blockquote:border-green-600 prose-blockquote:pr-4 prose-blockquote:bg-green-50 prose-blockquote:py-2 prose-a:text-green-600 prose-a:hover:text-green-800 prose-a:underline"
        }`}
      >
        {article.category === "الأشعار" ? (
          article.content
            .split("\n")
            .filter((line) => line.trim() !== "")
            .map((line, i) => (
              <p key={i} className="whitespace-pre-line">
                {line}
              </p>
            ))
        ) : (
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        )}
      </motion.div>

      {/* Author Info */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 mb-12 flex flex-col md:flex-row items-center gap-6 border border-green-200"
      >
        <motion.div
          whileHover={{ rotate: 10 }}
          className="w-20 h-20 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-3xl shadow-md"
        >
          {article.author.charAt(0)}
        </motion.div>
        <div className="text-center md:text-right">
          <h4 className="font-bold text-xl text-green-800">{article.author}</h4>
          <p className="text-gray-600 mt-2 break-all">
            <a
              href={`mailto:${article.email}`}
              className="text-green-700 hover:underline"
            >
              {article.email}
            </a>
          </p>
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
            <FaRegNewspaper className="text-green-600" />
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
                  {item.content.substring(0, 100)}...
                </p>
                <motion.div whileHover={{ x: -5 }}>
                  <Link
                    to={`/blog/${item.slug}`}
                    className="text-green-600 hover:text-green-800 font-medium flex items-center justify-end"
                  >
                    <span>اقرأ المزيد</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
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
    </motion.div>
  );
};

export default ArticlePage;
