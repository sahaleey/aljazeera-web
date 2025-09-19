import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FiClock,
  FiUser,
  FiArrowLeft,
  FiBookOpen,
  FiCheckCircle,
} from "react-icons/fi";
import { FaRegNewspaper } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import DOMPurify from "dompurify"; // Import the sanitizer
import { Helmet } from "react-helmet-async";

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // 1. Fetch blog data
        const res = await axios.get(
          `https://aljazeera-web-my5l.onrender.com/api/blogs/${slug}`
        );
        const blog = res.data;
        setArticle(blog);

        // 2. Fetch author profile (photoUrl) using email
        if (blog?.email) {
          try {
            const userRes = await axios.get(
              `https://aljazeera-web-my5l.onrender.com/api/users/${blog.email}`
            );
            if (userRes.data?.photoUrl) {
              setUserPhoto(userRes.data.photoUrl);
            }
          } catch (userErr) {
            console.warn("⚠️ Could not fetch author photo:", userErr.message);
          }
        }

        // 3. Fetch related blogs
        const relatedRes = await axios.get(
          `https://aljazeera-web-my5l.onrender.com/api/blogs?category=${blog.category}`
        );
        const filteredRelated = relatedRes.data.filter((a) => a.slug !== slug);
        setRelated(filteredRelated.slice(0, 3));
      } catch (err) {
        console.error("Blog not found", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();

    // Note: The Firebase auth listener here doesn't seem to be used for displaying
    // the article, so its logic can remain as is.
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-[tajawal,sans-serif]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-t-4 border-green-600 border-opacity-80 rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (!article) {
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
  }

  // To get an accurate word count, first strip the HTML tags from the content.
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
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12"
        >
          {article.category === "الأشعار" ? (
            // Logic for poems (plain text) remains unchanged
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
            // Logic for articles now safely renders the HTML from the database
            <div
              className="prose max-w-none text-right break-words" // `prose` styles the HTML, `text-right` ensures correct alignment
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(article.content),
              }}
            />
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
          <div className="text-center md:text-right">
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
                    {/* Also strip HTML for the preview text */}
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
    </>
  );
};

export default ArticlePage;
