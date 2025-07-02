import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiBookOpen } from "react-icons/fi";
import logo from "../assets/image/logo draw.png"; // ✅ Make sure the path is correct

const IntroScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/home");
    }, 5320); // ⏱️ Looks like you had an extra zero 😅

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center overflow-hidden ">
      <AnimatePresence>
        <motion.div
          key="intro-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-30"
        >
          {/* Book Icon */}
          <motion.div
            initial={{ y: -50, rotate: -10, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 10,
              delay: 0.2,
            }}
            className="flex justify-center mb-6"
          >
            <FiBookOpen className="text-6xl text-green-600" />
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 10,
              delay: 0.4,
            }}
            className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-green-500 mb-4"
          >
            القرطاسية
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              delay: 0.8,
              duration: 0.5,
            }}
            className="text-lg text-gray-600 mb-6"
          >
            منصة المعرفة والتعليم
          </motion.p>

          {/* Loading Dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex justify-center mt-4 space-x-2 mb-6"
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-3 h-3 bg-green-600 rounded-full"
              />
            ))}
          </motion.div>

          {/* ✅ Logo */}
          <motion.img
            src={logo}
            alt="Logo"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mx-auto w-24 h-24 object-contain rounded-full mt-15 scale-150 shadow-lg"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default IntroScreen;
