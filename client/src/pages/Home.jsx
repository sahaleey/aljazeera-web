import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import logo from "../assets/image/logo draw.png"; // Adjust path if needed

const stripHtml = (html) => {
  return html.replace(/<[^>]+>/g, "") || "";
};

const Home = () => {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/blogs");
        setBlogs(res.data);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div
      className="text-right px-4 md:px-12 py-10 font-[sans-serif] bg-gradient-to-br from-green-50 via-white to-green-50 min-h-screen"
      style={{ fontFamily: "tajawal, sans-serif" }}
    >
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-green-100 to-green-200 rounded-2xl shadow-lg p-8 md:p-16 mb-16 text-green-900 relative overflow-hidden"
      >
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-green-300 rounded-full opacity-10"></div>
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-green-400 rounded-full opacity-10"></div>
        <div className="relative z-10 text-center">
          <img
            src={logo}
            alt="Lisanul Jazeera Logo"
            className="mx-auto mb-6 w-24 h-14 scale-300 object-contain rounded-4xl"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-relaxed">
            مرحباً بكم في{" "}
            <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              القرطاسية
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed">
            منصة عربية تقدم محتوى تعليمي وثقافي مميز وملهم للطلاب في جميع
            المراحل الدراسية.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/submit"
              className="inline-block bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              شارك بمقالتك
            </Link>
            <Link
              to="/blogs"
              className="inline-block border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white text-lg px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              تصفح المقالات
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Blog Previews */}
      <section className="mb-16">
        <motion.h2
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-green-800 mb-8 pb-3 inline-block relative"
        >
          <span className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-green-300 to-green-100 rounded-full"></span>
          📝 أحدث المقالات
        </motion.h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogs.slice(0, 3).map((blog) => (
            <motion.div
              key={blog._id}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <span className="text-sm text-green-600 font-semibold bg-green-100 px-3 py-1 rounded-full">
                    {blog.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold mt-2 mb-3 text-gray-800 group-hover:text-green-700 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed flex-grow">
                  {stripHtml(blog.content).slice(0, 100)}...
                </p>
                <Link
                  to={`/blog/${blog.slug}`}
                  className="text-green-700 hover:text-green-900 font-semibold transition flex items-center justify-end group-hover:underline"
                >
                  اقرأ المزيد
                  <span className="mr-2 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* About Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl shadow-lg p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-100 rounded-full opacity-20"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-6 pb-2 inline-block relative">
            <span className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-green-300 to-green-100 rounded-full"></span>
            ℹ️ من نحن
          </h2>
          <div className="space-y-6 text-lg text-gray-700 leading-loose">
            <p className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 text-xl">
              <strong className="text-green-800 text-xl">لسان الجزيرة </strong>{" "}
              هو الجناح العربي لـ{" "}
              <strong className="text-green-800 text-xl">حسان </strong>(مجلس
              للنشاطة الإسلامية والعقلية لنهج الرشاد)، وهي{" "}
              <strong className="text-green-800 text-xl">منظمة طلابية </strong>
              نشطة في{" "}
              <strong className="text-green-800 text-xl">
                كلية النهج الرشاد الإسلامية{" "}
              </strong>
              في شامّاكّالا، تريشور، كيرلا. الكلية معتمدة من جامعة دار الهدى
              الإسلامية، وتشتهر بجمعها بين العلوم الإسلامية التقليدية والتعليم
              العصري
            </p>
            <p>
              نُدشن{" "}
              <strong className="text-bold text-xl">مدونة أدب الجزيرة </strong>{" "}
              كمنصة لإبراز الإبداع الأدبي لطلابنا في{" "}
              <strong className="text-bold text-xl">.لسان الجزيرة</strong>—
              المكان الذي يلتقي فيه شغف اللغة العربية بالأدب، القصّة، الشعر،
              والتاريخ الإسلامي.
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-6 pb-2 inline-block relative">
              <span className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-green-300 to-green-100 rounded-full"></span>
              🎓 مهمتنا
            </h2>
            <div className="bg-cyan-50 p-4 rounded-lg flex-col border-l-4 border-blue-400 flex items-start">
              <li className="text-xl">
                <strong className="text-cyan-700 text-xl">
                  تنمية الطلاقة في اللغة العربية
                </strong>
                ، لبناء متحدثين واثقين وأصيلين يتحدثون عن الإسلام بلغته ✨
              </li>
              <li className="text-xl">
                <strong className="text-cyan-700">إبراز تراث الجزيرة</strong> من
                لغة وأدب وعلوم إسلامية كلاسيكية• 📚
              </li>
              <li className="text-xl">
                <strong className="text-cyan-700 text-xl">
                  منبر للتعبير: نوفر مساحة لطلابنا لنشر قصائدهم، قصصهم، مقالاتهم
                  في التاريخ والأدب.
                </strong>
              </li>
              <li>
                <strong className="text-cyan-700 text-xl">
                  تشجيع الإبداع : ندعم الأصوات الناشئة، نعرض أعمالهم أمام
                  زملائهم وأعضاء هيئة التدريس، ونحتفل بالإبداع الجامعي.
                </strong>
              </li>
              <li className="text-xl">
                <strong className="text-cyan-700 text-xl">
                  تعزيز الثقافة : نربط جهودنا بتراث الأدب العربي الكلاسيكي
                  والمعاصر، ونحيي الفصاحة والتأصيل.
                </strong>
              </li>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 flex items-start">
              <span className="text-2xl mr-3">💡</span>
              <p className="text-lg">
                هل لديك أفكار أو خبرات ترغب بمشاركتها؟ أرسل لنا مقالتك وساهم في
                إلهام الآخرين!
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <h3 className="text-2xl md:text-3xl font-bold text-green-800 mb-6">
          مستعد لبدء رحلتك معنا؟
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/submit"
            className="inline-block bg-gradient-to-r from-green-700 to-green-600 hover:from-green-800 hover:to-green-700 text-white text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            ابدأ الكتابة الآن
          </Link>
          <Link
            to="/blogs"
            className="inline-block bg-white border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white text-lg px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            تصفح المقالات
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
