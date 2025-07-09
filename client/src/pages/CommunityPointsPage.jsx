import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";

// Arabic community labels
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

// Points calculation function
const calculatePoints = (blog) => {
  let points = 1; // Base point for verification

  // Bonus points for engagement
  if (blog.likes?.length >= 10) points += 1;
  if (blog.likes?.length >= 25) points += 1;
  if (blog.views >= 50) points += 1;

  return points;
};

const CommunityPoints = () => {
  const [communityData, setCommunityData] = useState({});
  const [communityTotals, setCommunityTotals] = useState({});
  const [expandedCommunity, setExpandedCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topCommunities, setTopCommunities] = useState([]);

  useEffect(() => {
    const fetchVerifiedBlogs = async () => {
      try {
        const res = await axios.get(
          "https://aljazeera-web.onrender.com/api/blogs/verified"
        );

        const verifiedBlogs = res.data.filter(
          (blog) => blog.verified && blog.community
        );

        const grouped = {};
        const totals = {};

        // Calculate points for each blog and group by community
        verifiedBlogs.forEach((blog) => {
          const key = blog.community.toLowerCase();
          const points = calculatePoints(blog);

          if (!grouped[key]) {
            grouped[key] = [];
            totals[key] = 0;
          }

          grouped[key].push({ ...blog, points });
          totals[key] += points;
        });

        setCommunityData(grouped);
        setCommunityTotals(totals);

        // Determine top 3 communities
        const sorted = Object.entries(totals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        setTopCommunities(sorted);
      } catch (err) {
        console.error("❌ Failed to fetch verified blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedBlogs();
  }, []);

  const toggleCommunity = (key) => {
    setExpandedCommunity((prev) => (prev === key ? null : key));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          🏆 نقاط المجتمعات
        </h1>

        {/* Top Communities Section */}
        {topCommunities.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-center text-blue-800 mb-4">
              <FiTrendingUp className="inline mr-2" />
              المجتمعات الأكثر تفاعلاً
            </h2>
            <div className="flex justify-center gap-6">
              {topCommunities.map(([key, points], index) => (
                <div
                  key={key}
                  className={`text-center p-4 rounded-lg ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-200"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-300 to-gray-200"
                      : "bg-gradient-to-r from-amber-600 to-amber-500 text-white"
                  }`}
                >
                  <div className="text-2xl font-bold">{index + 1}</div>
                  <div className="text-lg font-semibold">
                    {communityNames[key] || key}
                  </div>
                  <div className="text-sm">{points} نقاط</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
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
                        {communityTotals[key] || 0}
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
                              className="bg-blue-50 p-3 rounded-lg border border-blue-100"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-semibold text-blue-700 line-clamp-1">
                                    {blog.title}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {new Date(
                                      blog.createdAt
                                    ).toLocaleDateString("ar-EG")}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                                    +{blog.points} نقاط
                                  </span>
                                  <FiCheckCircle className="text-green-500 text-xl" />
                                </div>
                              </div>
                              <div className="flex justify-between text-xs mt-2 text-gray-500">
                                <span>👍 {blog.likes?.length || 0}</span>
                                <span>👀 {blog.views || 0}</span>
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
