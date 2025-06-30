import { motion } from "framer-motion";
import { FaRegCopyright, FaHome, FaBloggerB } from "react-icons/fa";
import { Link } from "react-router-dom";
import { TfiWrite } from "react-icons/tfi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { title: "الرئيسية", url: "/home", icon: <FaHome /> },
    { title: "المقالات", url: "/blogs", icon: <FaBloggerB /> },
    { title: "أضف مقالتك", url: "/submit", icon: <TfiWrite /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="bg-gradient-to-b from-green-800 to-green-900 text-white pt-16 pb-10 shadow-inner"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
          {/* Logo + Description */}
          <motion.div
            variants={itemVariants}
            className="text-center md:text-right"
          >
            <Link to="/home">
              <motion.h3
                whileHover={{ scale: 1.02 }}
                className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-green-100"
              >
                القرطاسية
              </motion.h3>
            </Link>
            <p className="text-gray-300 text-lg leading-relaxed">
              منصة عربية لنشر المقالات والمواد التعليمية للطلاب في مختلف المراحل
              الدراسية.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={itemVariants}
            className="text-center md:text-right"
          >
            <motion.h4 className="text-xl font-semibold mb-4 pb-2 border-b border-green-500 inline-block">
              روابط سريعة
            </motion.h4>
            <ul className="space-y-3 mt-4">
              {footerLinks.slice(0, 4).map((link, i) => (
                <motion.li
                  key={i}
                  whileHover={{ x: -6 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link
                    to={link.url}
                    className="text-gray-300 hover:text-white transition duration-200 text-lg inline-flex items-center"
                  >
                    <span className="ml-2">{link.icon}</span>
                    {link.title}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Links */}
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="border-t border-green-700 pt-6 text-center"
        >
          <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
            <div className="flex items-center justify-center gap-1 text-lg text-gray-300">
              <FaRegCopyright />
              <span>{currentYear} جميع الحقوق محفوظة القرطاسية</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <span>تم التطوير </span>

              <span>بواسطة</span>
              <a
                href="https://dev-scp.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-300 hover:text-green-100 transition"
              >
                SCP
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
