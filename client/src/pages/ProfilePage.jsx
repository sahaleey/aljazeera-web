import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { FiCalendar, FiUser, FiArrowLeft, FiEdit } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Skeleton component for the loading state
const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="mb-8">
      <Skeleton width={150} height={24} />
    </div>
    <div className="flex flex-col items-center text-center mb-12 p-8">
      <Skeleton circle width={128} height={128} className="mb-4" />
      <Skeleton width={250} height={36} className="mb-2" />
      <Skeleton width={200} height={20} />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-700 mb-6 pb-2 border-b-2 border-gray-200">
        <Skeleton width={220} />
      </h2>
      <div className="space-y-6">
        <Skeleton height={150} borderRadius={12} />
        <Skeleton height={150} borderRadius={12} />
      </div>
    </div>
  </div>
);

const ProfilePage = () => {
  const { email } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        // ✨ FIX: Changed 'user' to 'users' to match your backend route
        const res = await axios.get(
          `https://aljazeera-web-my5l.onrender.com/api/user/profile/${email}`
        );
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Could not find the specified user.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [email]);

  if (loading) {
    return (
      <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f1f5f9">
        <ProfileSkeleton />
      </SkeletonTheme>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <motion.div className="text-6xl mb-4">😕</motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          User Not Found
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          to="/blogs"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Back to Articles
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${profile.name}'s Profile | Al Jazeera Blog`}</title>
        <meta
          name="description"
          content={`See all articles written by ${profile.name}.`}
        />
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        {/* Back Button */}
        <motion.div whileHover={{ x: 5 }} className="mb-8 text-right">
          <Link
            to="/blogs"
            className="flex items-center justify-end text-green-600 hover:text-green-800 font-medium"
          >
            <span>العودة للمقالات</span>
            <FiArrowLeft className="ml-2" />
          </Link>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center text-center mb-12 p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg"
        >
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl mb-4"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-xl mb-4">
              <FiUser className="text-gray-500 text-6xl" />
            </div>
          )}
          <h1 className="text-4xl font-bold text-gray-800">{profile.name}</h1>
          <div className="flex items-center text-gray-500 mt-2">
            <FiCalendar className="mr-2" />
            <span>
              انضم في {new Date(profile.createdAt).toLocaleDateString("ar-EG")}
            </span>
          </div>
        </motion.div>

        {/* User's Articles */}
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-700 mb-6 pb-2 border-b-2 border-gray-200">
            مقالات بقلم {profile.name}
          </h2>
          <div className="space-y-6">
            {profile.blogs.length > 0 ? (
              profile.blogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="block p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:border-green-300 border border-transparent transition-all duration-300"
                  >
                    <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                      <span>
                        {new Date(blog.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        {blog.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-green-700 mb-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2 break-words">
                      {blog.content.replace(/<[^>]+>/g, "")}
                    </p>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  لم يقم هذا المستخدم بنشر أي مقالات بعد.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProfilePage;
