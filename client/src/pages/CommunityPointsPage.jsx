import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronUp, FiCheckCircle } from "react-icons/fi";

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

const CommunityPoints = () => {
  const [communityData, setCommunityData] = useState({});
  const [expandedCommunity, setExpandedCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

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
        verifiedBlogs.forEach((blog) => {
          const key = blog.community.toLowerCase();
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(blog);
        });

        setCommunityData(grouped);
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
                        {communityData[key]?.length || 0}
                      </span>
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
                              className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center justify-between"
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
                              </div>
                              <FiCheckCircle className="text-green-500 text-xl" />
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
