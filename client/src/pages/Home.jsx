import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  PenTool,
  BookOpen,
  Users,
  Target,
  Sparkles,
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
} from "lucide-react";
import { FaBook } from "react-icons/fa";
import logo from "../assets/image/logo draw.png";

const stripHtml = (html) => {
  return html.replace(/<[^>]+>/g, "") || "";
};

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          "https://aljazeera-web.onrender.com/api/blogs"
        );
        setBlogs(res.data);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const fadeInUp = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div
      className="text-right px-4 md:px-12 py-10 font-[sans-serif] min-h-screen bg-gradient-to-br from-green-50/80 via-white/90 to-cyan-50/80 backdrop-blur-sm"
      style={{ fontFamily: "tajawal, sans-serif" }}
    >
      {/* Enhanced Hero Section with Glass Morphism */}
      <motion.section
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative rounded-3xl shadow-2xl mb-16 overflow-hidden min-h-[70vh] flex items-center"
      >
        {/* Background with gradient and blur */}
        <div className="absolute inset-0 bg-green-400/30 backdrop-blur-md"></div>

        {/* Animated background elements */}
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-green-300/20 rounded-full blur-xl"></div>
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-300/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-300/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 w-full text-center px-8 py-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8"
          >
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 inline-flex items-center justify-center border border-white/30 shadow-lg">
              <img
                src={logo}
                alt="Lisanul Jazeera Logo"
                className="w-32 h-20 object-contain filter scale-200 drop-shadow-lg"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl text-white font-extrabold mb-6 leading-tight"
          >
            مرحباً بكم في{" "}
            <span className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent">
              القرطاسية
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xl md:text-2xl lg:text-3xl mb-8 max-w-4xl mx-auto leading-relaxed text-gray-700 font-medium"
          >
            منصة عربية تقدم محتوى تعليمي وثقافي مميز وملهم للطلاب في جميع
            المراحل الدراسية.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-wrap gap-6 justify-center"
          >
            <Link
              to="/submit"
              className="group inline-flex items-center gap-3 bg-green-600 hover:bg-green-700  text-white text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
            >
              <PenTool className="w-5 h-5 group-hover:scale-110 transition-transform" />
              شارك بمقالتك
            </Link>
            <Link
              to="/blogs"
              className="group inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
              تصفح المقالات
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Blog Previews Section */}
      <section className="mb-20">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 border border-green-200/50 mb-4">
            <Sparkles className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-semibold">أحدث الإبداعات</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold  text-green-900 mb-4">
            أحدث المقالات
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            اكتشف أحدث الإبداعات الأدبية من طلابنا الموهوبين
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: item * 0.1 }}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg animate-pulse"
              >
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {blogs.slice(0, 3).map((blog, index) => (
              <motion.article
                key={blog._id}
                variants={itemVariants}
                whileHover={{
                  y: -15,
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                className="group relative bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/40"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10 p-6 h-full flex flex-col">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold  bg-green-500  text-white px-3 py-1 rounded-full shadow-lg">
                      {blog.category}
                    </span>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>{(blog.views || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-green-700 transition-colors duration-300 leading-tight">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 leading-relaxed flex-grow text-sm line-clamp-3">
                    {stripHtml(blog.content).slice(0, 120)}...
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(blog.createdAt).toLocaleDateString("ar-EG")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.ceil(stripHtml(blog.content).length / 200)} دقائق
                      قراءة
                    </div>
                  </div>

                  {/* Read More Link */}
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="inline-flex items-center justify-end gap-2 text-green-600 hover:text-green-800 font-semibold transition-all duration-300 group-hover:translate-x-2"
                  >
                    اقرأ المزيد
                    <ArrowLeft className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </section>

      {/* Enhanced About Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true }}
        className="bg-white/60 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden mb-16 border border-white/40"
      >
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full px-6 py-3 border border-green-200/30 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-semibold">تعرف علينا</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-green-900 mb-4">
              من نحن
            </h2>
          </motion.div>

          <div className="space-y-8">
            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-green-50/80 to-blue-50/80 rounded-2xl p-6 border-l-4 border-green-400 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <Target className="w-8 h-8 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-green-800 mb-3">
                    🎓 مهمتنا
                  </h3>
                  <ul className="space-y-3 text-gray-700 text-lg leading-relaxed">
                    {[
                      "تنمية الطلاقة في اللغة العربية لبناء متحدثين واثقين وأصيلين",
                      "إبراز تراث الجزيرة من لغة وأدب وعلوم إسلامية كلاسيكية",
                      "توفير منبر للتعبير الإبداعي للطلاب",
                      "تشجيع الإبداع ودعم الأصوات الناشئة",
                      "تعزيز الثقافة العربية والتراث الأدبي",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* About Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-green-100">
                <h4 className="text-xl font-bold text-green-700 mb-3">
                  🏛️ لسان الجزيرة
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  هو الجناح العربي لمجلس النشاط الإسلامي والعقلي لنهج الرشاد،
                  منظمة طلابية نشطة في كلية النهج الرشاد الإسلامية في
                  شامّاكّالا، تريشور، كيرلا.
                </p>
              </div>

              <div className="bg-white/80 rounded-2xl p-6 shadow-lg border border-blue-100">
                <h4 className="text-xl font-bold text-blue-700 mb-3">
                  📚 مدونة أدب الجزيرة
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  منصة لإبراز الإبداع الأدبي لطلابنا—حيث يلتقي شغف اللغة العربية
                  بالأدب، القصة، الشعر، والتاريخ الإسلامي في بيئة إبداعية ملهمة.
                </p>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-yellow-50/80 to-amber-50/80 rounded-2xl p-6 border-l-4 border-yellow-400 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <Sparkles className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="text-xl font-bold text-yellow-700 mb-2">
                    💡 انضم إلينا
                  </h4>
                  <p className="text-gray-700 text-lg">
                    هل لديك أفكار أو خبرات ترغب بمشاركتها؟ أرسل لنا مقالتك وساهم
                    في إلهام الآخرين!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10 rounded-3xl p-12 backdrop-blur-sm border border-white/30 shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-block bg-white/80 rounded-full px-8 py-3 mb-6 shadow-lg"
        >
          <Sparkles className="w-6 h-6 text-green-600 inline-block ml-2" />
          <span className="text-green-700 font-semibold text-lg">
            ابدأ رحلتك الأدبية
          </span>
        </motion.div>

        <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
          مستعد لبدء رحلتك معنا؟
        </h3>

        <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
          انضم إلى مجتمعنا الأدبي وشارك بإبداعاتك مع الآلاف من القراء المهتمين
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <Link
            to="/submit"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-lg px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
          >
            <PenTool className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            ابدأ الكتابة الآن
          </Link>
          <Link
            to="/blogs"
            className="group inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
            اكتشف المقالات
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
