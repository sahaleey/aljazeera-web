import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { GiTrophiesShelf } from "react-icons/gi";

import {
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiAward,
  FiBarChart2,
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
        position: "top-right",
        icon: <FiCheckCircle className="text-xl" />,
        className: "toast-success",
      }),
    error: (msg) =>
      toast.error(msg, {
        position: "top-right",
        className: "toast-error",
      }),
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
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
    animate: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
    error: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.5 },
    },
  };

  const hoverEffect = {
    scale: 1.03,
    boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.15)",
    transition: {
      type: "spring",
      stiffness: 400,
    },
  };

  const tapEffect = {
    scale: 0.97,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-6 relative overflow-hidden">
      {/* Enhanced Particle Background */}
      <div className="absolute inset-0 -z-10">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={{
            particles: {
              number: {
                value: 40,
                density: {
                  enable: true,
                  value_area: 1000,
                },
              },
              color: {
                value: ["#3b82f6", "#6366f1", "#8b5cf6"],
              },
              shape: {
                type: "circle",
                stroke: {
                  width: 0,
                  color: "#000000",
                },
              },
              opacity: {
                value: 0.6,
                random: true,
                anim: {
                  enable: true,
                  speed: 1,
                  opacity_min: 0.3,
                  sync: false,
                },
              },
              size: {
                value: 4,
                random: true,
                anim: {
                  enable: true,
                  speed: 2,
                  size_min: 0.3,
                  sync: false,
                },
              },
              line_linked: {
                enable: true,
                distance: 180,
                color: "#a5b4fc",
                opacity: 0.4,
                width: 1.5,
              },
              move: {
                enable: true,
                speed: 1.5,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                  enable: true,
                  rotateX: 600,
                  rotateY: 1200,
                },
              },
            },
            interactivity: {
              detect_on: "canvas",
              events: {
                onhover: {
                  enable: true,
                  mode: "grab",
                },
                onclick: {
                  enable: true,
                  mode: "push",
                },
                resize: true,
              },
              modes: {
                grab: {
                  distance: 140,
                  line_linked: {
                    opacity: 1,
                  },
                },
                push: {
                  particles_nb: 4,
                },
              },
            },
            retina_detect: true,
          }}
        />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header with 3D Effect */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 10 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6"
        >
          <div className="text-center md:text-right">
            <motion.h1
              className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
              whileHover={{ scale: 1.01 }}
            >
              <span
                className="inline-block mr-2"
                style={{ perspective: 800, display: "inline-block" }}
              >
                <motion.span
                  animate={{
                    rotateY: [0, 10, -10, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }}
                  style={{
                    display: "inline-block",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden", // 👈 prevents the icon from vanishing
                  }}
                >
                  <GiTrophiesShelf className="text-yellow-500 text-3xl ml-5 scale-170" />
                </motion.span>
              </span>
              جدول نقاط المجتمعات
            </motion.h1>

            <motion.p
              className="text-indigo-500 mt-2"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
            >
              تتبع إنجازات وتفاعل مجتمعاتنا المتميزة
            </motion.p>
          </div>

          <motion.button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 5px 15px rgba(59, 130, 246, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-5 py-3 rounded-xl shadow-lg transition-all relative overflow-hidden"
          >
            <motion.span
              className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity"
              whileHover={{ opacity: 0.1 }}
            />
            {refreshing ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <FiRefreshCw />
              </motion.span>
            ) : (
              <FiRefreshCw />
            )}
            تحديث البيانات
          </motion.button>
        </motion.div>

        {/* Enhanced Leaderboard with Medal Effects */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="p-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white relative">
              <motion.div
                className="absolute top-0 left-0 w-full h-full opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
                animate={{
                  backgroundPosition: ["0% 0%", "100% 100%"],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
                <FiTrendingUp className="text-2xl" />
                التصنيف الحالي للمجتمعات
              </h2>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((community, index) => (
                <motion.div
                  key={community.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={hoverEffect}
                  whileTap={tapEffect}
                  className={`p-4 rounded-xl shadow-md relative overflow-hidden ${
                    index === 0
                      ? "bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-200"
                      : index === 1
                      ? "bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200"
                      : "bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200"
                  }`}
                >
                  {index === 0 && (
                    <motion.div
                      className="absolute top-0 right-0 w-16 h-16 overflow-hidden"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <div className="absolute -right-8 -top-8 w-32 h-32 bg-yellow-200 opacity-10 rounded-full" />
                    </motion.div>
                  )}
                  <div className="flex items-center gap-3 relative z-10">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                          : "bg-gradient-to-br from-amber-400 to-amber-500 text-white"
                      }`}
                    >
                      {index === 0 ? (
                        <FiAward className="text-xl" />
                      ) : (
                        <span className="font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{community.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-600">
                          {community.points} نقطة
                        </span>
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.8, 1, 0.8],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                          className="text-xs px-2 py-1 bg-white rounded-full shadow-inner"
                        >
                          {Math.round(
                            (community.points / leaderboard[0]?.points) * 100
                          )}
                          %
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Enhanced Community Cards with Floating Effects */}
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
            const topRank = rank <= 3;

            return (
              <motion.div
                key={key}
                layout
                variants={itemVariants}
                whileHover={hoverEffect}
                whileTap={tapEffect}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20 relative"
              >
                {topRank && (
                  <motion.div
                    className={`absolute top-0 left-0 w-full h-1 ${
                      rank === 1
                        ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                        : rank === 2
                        ? "bg-gradient-to-r from-gray-400 to-gray-500"
                        : "bg-gradient-to-r from-amber-400 to-amber-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.1 * rank }}
                  />
                )}

                <button
                  onClick={() => toggleCommunity(key)}
                  className="w-full p-5 flex items-center justify-between text-right hover:bg-blue-50/30 transition-colors relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      {name}
                      {points > 0 && (
                        <motion.span
                          className={`text-xs px-2 py-1 rounded-full shadow-inner ${
                            topRank
                              ? rank === 1
                                ? "bg-yellow-100 text-yellow-800"
                                : rank === 2
                                ? "bg-gray-100 text-gray-800"
                                : "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          #{rank}
                        </motion.span>
                      )}
                    </h2>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              (points / (leaderboard[0]?.points || 1)) * 100,
                              100
                            )}%`,
                          }}
                          transition={{ duration: 1, delay: 0.1 * rank }}
                          className={`h-full ${
                            topRank
                              ? rank === 1
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                : rank === 2
                                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                : "bg-gradient-to-r from-amber-400 to-amber-500"
                              : "bg-gradient-to-r from-blue-400 to-blue-500"
                          }`}
                        />
                      </div>
                      <motion.span
                        className={`text-sm font-semibold ${
                          topRank
                            ? rank === 1
                              ? "text-yellow-600"
                              : rank === 2
                              ? "text-gray-600"
                              : "text-amber-600"
                            : "text-blue-600"
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {points}
                      </motion.span>
                    </div>
                  </div>

                  <motion.div
                    animate={{
                      rotate: expandedCommunity === key ? 180 : 0,
                      color: expandedCommunity === key ? "#3b82f6" : "#9ca3af",
                    }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="relative z-10"
                  >
                    {expandedCommunity === key ? (
                      <FiChevronUp size={24} />
                    ) : (
                      <FiChevronDown size={24} />
                    )}
                  </motion.div>

                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 hover:opacity-100 transition-opacity"
                    whileHover={{ opacity: 1 }}
                  />
                </button>

                <AnimatePresence>
                  {expandedCommunity === key && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        transition: {
                          opacity: { duration: 0.3 },
                          height: {
                            type: "spring",
                            stiffness: 100,
                            damping: 15,
                          },
                        },
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: {
                          opacity: { duration: 0.2 },
                          height: { duration: 0.3 },
                        },
                      }}
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
                              whileHover={{
                                x: 5,
                                backgroundColor: "rgba(239, 246, 255, 0.7)",
                              }}
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
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-gray-400 text-center py-3"
                        >
                          لا توجد مقالات موثقة حالياً.
                        </motion.p>
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
