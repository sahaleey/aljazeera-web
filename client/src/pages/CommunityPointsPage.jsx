import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const communityNames = {
  ihya: "إحياء",
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
  const [user, setUser] = useState(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [communityData, setCommunityData] = useState({});
  const [expandedCommunity, setExpandedCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const adminEmails = ["ajua46244@gmail.com"];

  const notify = {
    success: (message) =>
      toast.success(message, {
        position: "top-right",
        icon: <FiCheckCircle className="text-xl" />,
      }),
    error: (message) =>
      toast.error(message, {
        position: "top-right",
        icon: <FiAlertCircle className="text-xl" />,
      }),
    info: (message) =>
      toast.info(message, {
        position: "top-right",
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

  const fetchCommunityPoints = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get(
        "https://aljazeera-web.onrender.com/api/blogs/points",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const grouped = {};
      if (res.data && typeof res.data === "object") {
        Object.entries(res.data).forEach(([community, blogs]) => {
          const matchedKey = Object.entries(arabicToKeyMap).find(([label]) =>
            community.trim().startsWith(label)
          );
          const key = matchedKey
            ? matchedKey[1]
            : community.trim().toLowerCase();

          if (!communityNames[key]) {
            console.warn(
              `❌ Invalid community label not found in mapping: ${community}`
            );
            return;
          }

          if (typeof blogs === "number") {
            grouped[key] = {
              totalPoints: blogs,
              blogs: [],
            };
          } else {
            console.warn(
              `Invalid blogs format for community: ${community}`,
              blogs
            );
          }
        });
      } else {
        console.error("Unexpected response format:", res.data);
        notify.error("تنسيق استجابة غير متوقع من الخادم");
        return;
      }

      setCommunityData(grouped);
      notify.success("✅ تم تحميل النقاط بنجاح");
    } catch (err) {
      console.error("❌ Failed to fetch community points:", err);
      notify.error("فشل تحميل نقاط المجتمعات");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        notify.error("يجب تسجيل الدخول أولاً");
        return;
      }

      if (!adminEmails.includes(currentUser.email)) {
        notify.error("🚫 ليس لديك صلاحية الوصول");
        return;
      }

      setUser(currentUser);
      setCheckingAdmin(false);

      try {
        const token = await currentUser.getIdToken();
        await fetchCommunityPoints(token);
      } catch (err) {
        console.error("❌ Error in auth state change:", err);
      }
    });

    return unsubscribe;
  }, []);

  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const token = await user.getIdToken();
      await fetchCommunityPoints(token);
    } catch (err) {
      console.error("❌ Error refreshing data:", err);
    }
  };

  const toggleCommunity = (key) => {
    setExpandedCommunity((prev) => (prev === key ? null : key));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-6">
      <ToastContainer />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-700">
            🏆 نقاط المجتمعات
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg transition-colors"
          >
            {refreshing ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiRefreshCw />
            )}
            تحديث البيانات
          </button>
        </div>

        {checkingAdmin ? (
          <div className="text-center text-gray-500">
            جاري التحقق من الصلاحيات...
          </div>
        ) : loading ? (
          <div className="text-center text-gray-500">جاري تحميل النقاط...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(communityNames).map(([key, arabic]) => (
              <motion.div
                key={key}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all border border-gray-100"
              >
                <button
                  onClick={() => toggleCommunity(key)}
                  className="w-full p-5 flex items-center justify-between text-right"
                >
                  <div>
                    <h2 className="text-xl font-bold text-blue-800">
                      {arabic}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      مجموع النقاط:{" "}
                      <span className="text-green-600 font-semibold">
                        {communityData[key]
                          ? communityData[key].reduce(
                              (sum, b) => sum + b.earnedPoints,
                              0
                            )
                          : 0}
                      </span>{" "}
                      ({communityData[key]?.length || 0} مقالة)
                    </p>
                  </div>
                  <div className="text-gray-400">
                    {expandedCommunity === key ? (
                      <FiChevronUp size={24} />
                    ) : (
                      <FiChevronDown size={24} />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedCommunity === key && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-4"
                    >
                      {communityData[key]?.length > 0 ? (
                        <ul className="space-y-3 mt-2 text-right">
                          {communityData[key].map((blog) => (
                            <li
                              key={blog._id}
                              className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-start gap-4"
                            >
                              <div>
                                <h4 className="text-sm font-semibold text-blue-700 line-clamp-1">
                                  {blog.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {new Date(blog.createdAt).toLocaleDateString(
                                    "ar-EG"
                                  )}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  ❤️ {blog.likes?.length || 0} إعجاب - 👁️{" "}
                                  {blog.views || 0} مشاهدة
                                </p>
                              </div>
                              <div className="text-green-600 text-sm font-semibold flex items-center gap-1">
                                <FiCheckCircle className="text-lg" />
                                {blog.earnedPoints} نقطة
                              </div>
                            </li>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityPoints;
