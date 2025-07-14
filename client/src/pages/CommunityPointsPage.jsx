import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const communityNames = {
  ihya: "إحيا",
  nour: "نور",
  usra: "أسرة",
  abha: "أبها",
  farah: "فرح",
  uswa: "أسوة",
  fouz: "فوز",
  hikma: "حكمة",
  saada: "سعادة",
  "class 1": "الصف الأول",
};

const arabicToKeyMap = Object.entries(communityNames).reduce(
  (acc, [key, arabic]) => {
    acc[arabic] = key;
    return acc;
  },
  {}
);

const CommunityPoints = () => {
  const [communityData, setCommunityData] = useState({});
  const [expandedCommunity, setExpandedCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const controls = useAnimation();

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const notify = {
    success: (msg) =>
      toast.success(msg, {
        icon: <FiCheckCircle />,
        className: "toast-success",
      }),
    error: (msg) => toast.error(msg, { className: "toast-error" }),
  };

  const calculatePoints = (blog) => {
    let points = 1;
    const likes = blog.likes?.length || 0;
    const views = blog.views || 0;
    if (likes >= 10) points += 1;
    if (likes >= 25) points += 1;
    if (views >= 50) points += 1;
    return points;
  };

  const fetchCommunityPoints = async () => {
    try {
      setLoading(true);
      await controls.start("animate");

      const res = await axios.get(
        "https://aljazeera-web.onrender.com/api/blogs/points"
      );
      const grouped = {};

      if (res.data && typeof res.data === "object") {
        Object.entries(res.data).forEach(([community, blogs]) => {
          const matchedKey = Object.entries(arabicToKeyMap).find(
            ([label]) => label.trim() === community.trim()
          );
          const key = matchedKey
            ? matchedKey[1]
            : community.trim().toLowerCase();

          if (!communityNames[key]) {
            console.warn(`❌ Invalid community label: ${community}`);
            return;
          }

          if (Array.isArray(blogs)) {
            grouped[key] = blogs.map((blog) => ({
              ...blog,
              earnedPoints: calculatePoints(blog),
            }));
          }
        });
      }

      setCommunityData(grouped);

      const leaderboardData = Object.entries(communityNames)
        .map(([key, name]) => {
          const points =
            grouped[key]?.reduce((sum, b) => sum + b.earnedPoints, 0) || 0;
          return { name, points, key };
        })
        .sort((a, b) => b.points - a.points);

      setLeaderboard(leaderboardData);
      notify.success("✅ تم تحميل النقاط بنجاح");
      await controls.start("visible");
    } catch (err) {
      console.error("❌ Error fetching data:", err);
      notify.error("فشل تحميل نقاط المجتمعات");
      await controls.start("error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommunityPoints();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCommunityPoints();
  };

  const toggleCommunity = (key) => {
    setExpandedCommunity((prev) => (prev === key ? null : key));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const hoverEffect = {
    scale: 1.02,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: { type: "spring", stiffness: 300 },
  };

  const tapEffect = { scale: 0.98 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            particles: {
              number: { value: 30, density: { enable: true, value_area: 800 } },
              color: { value: ["#3b82f6", "#6366f1", "#8b5cf6"] },
              shape: { type: "circle" },
              opacity: { value: 0.5, random: true },
              size: { value: 3, random: true },
              line_linked: {
                enable: true,
                distance: 150,
                color: "#a5b4fc",
                opacity: 0.3,
                width: 1,
              },
              move: {
                enable: true,
                speed: 1,
                random: true,
                out_mode: "out",
              },
            },
            interactivity: {
              events: {
                onhover: { enable: true, mode: "grab" },
                onclick: { enable: true, mode: "push" },
              },
            },
          }}
        />
      </div>

      <ToastContainer />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="text-center md:text-right">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              🏆 جدول نقاط المجتمعات
            </h1>
            <p className="text-indigo-500 mt-2">
              تتبع إنجازات وتفاعل مجتمعاتنا المتميزة
            </p>
          </div>

          <motion.button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-5 py-3 rounded-xl shadow-lg transition-all"
          >
            {refreshing ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <FiRefreshCw />
              </motion.span>
            ) : (
              <FiRefreshCw />
            )}
            تحديث البيانات
          </motion.button>
        </motion.div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20"
          >
            <div className="p-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiTrendingUp className="text-2xl" /> التصنيف الحالي للمجتمعات
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((c, index) => (
                <motion.div
                  key={c.key}
                  whileHover={hoverEffect}
                  whileTap={tapEffect}
                  className={`p-4 rounded-xl shadow-md ${
                    index === 0
                      ? "bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-200"
                      : index === 1
                      ? "bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200"
                      : "bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0
                          ? "bg-yellow-400"
                          : index === 1
                          ? "bg-gray-400"
                          : "bg-amber-400"
                      } text-white`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{c.name}</h3>
                      <p className="text-sm text-gray-600">{c.points} نقطة</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Community Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Object.entries(communityNames).map(([key, name]) => {
            const points =
              communityData[key]?.reduce((sum, b) => sum + b.earnedPoints, 0) ||
              0;
            const rank = leaderboard.findIndex((c) => c.key === key) + 1;
            return (
              <motion.div
                key={key}
                layout
                variants={itemVariants}
                whileHover={hoverEffect}
                whileTap={tapEffect}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20"
              >
                <button
                  onClick={() => toggleCommunity(key)}
                  className="w-full p-5 flex items-center justify-between text-right hover:bg-blue-50/50 transition"
                >
                  <div>
                    <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                      {name}
                      {points > 0 && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          #{rank}
                        </span>
                      )}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              (points / (leaderboard[0]?.points || 1)) * 100,
                              100
                            )}%`,
                          }}
                          transition={{ duration: 1 }}
                          className={`h-full ${
                            rank === 1
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                              : rank === 2
                              ? "bg-gradient-to-r from-gray-400 to-gray-500"
                              : rank === 3
                              ? "bg-gradient-to-r from-amber-400 to-amber-500"
                              : "bg-gradient-to-r from-blue-400 to-blue-500"
                          }`}
                        />
                      </div>
                      <span className="text-sm font-semibold text-blue-600">
                        {points}
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={{
                      rotate: expandedCommunity === key ? 180 : 0,
                      color: expandedCommunity === key ? "#3b82f6" : "#9ca3af",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {expandedCommunity === key ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedCommunity === key && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="px-5 pb-4"
                    >
                      {communityData[key]?.length > 0 ? (
                        <ul className="space-y-3 mt-2">
                          {communityData[key].map((blog, index) => (
                            <motion.li
                              key={blog._id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{
                                opacity: 1,
                                x: 0,
                                transition: { delay: index * 0.05 },
                              }}
                              whileHover={{ x: 5 }}
                              className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 flex justify-between items-start gap-4 backdrop-blur-sm"
                            >
                              <div>
                                <h4 className="text-sm font-semibold text-blue-700 line-clamp-1">
                                  {blog.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(blog.createdAt).toLocaleDateString(
                                    "ar-EG"
                                  )}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs text-pink-500 flex items-center gap-1">
                                    ❤️ {blog.likes?.length || 0}
                                  </span>
                                  <span className="text-xs text-blue-500 flex items-center gap-1">
                                    👁️ {blog.views || 0}
                                  </span>
                                </div>
                              </div>
                              <motion.span
                                whileHover={{ scale: 1.2 }}
                                className="text-green-600 text-sm font-semibold flex items-center gap-1"
                              >
                                <FiCheckCircle className="text-lg" />
                                {blog.earnedPoints}
                              </motion.span>
                            </motion.li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-3">
                          لا توجد مقالات موثقة حالياً.
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default CommunityPoints;
