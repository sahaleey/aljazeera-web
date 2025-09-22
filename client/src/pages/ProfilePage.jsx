import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar, FiUser, FiArrowLeft, FiBook, FiX } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const FollowListModal = ({ isOpen, onClose, title, users, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton circle width={48} height={48} />
                      <Skeleton width={150} height={20} />
                    </div>
                  ))}
                </div>
              ) : users.length > 0 ? (
                <ul className="space-y-3">
                  {users.map((user) => (
                    <li key={user._id}>
                      <Link
                        to={`/profile/${user.email}`}
                        onClick={onClose}
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={
                            user.photoUrl ||
                            `https://avatar.vercel.sh/${user.name}.png`
                          }
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover bg-gray-200"
                        />
                        <span className="font-semibold text-gray-700">
                          {user.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users to display.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="mb-8">
      <Skeleton width={150} height={24} className="rounded-lg" />
    </div>
    <div className="flex flex-col items-center text-center mb-12 p-8 bg-gradient-to-br from-white/70 to-green-50/50 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30">
      <Skeleton
        circle
        width={128}
        height={128}
        className="mb-6 border-4 border-white/80 shadow-xl"
      />
      <Skeleton width={250} height={36} className="mb-3 rounded-xl" />
      <Skeleton width={200} height={20} className="rounded-xl" />
      <div className="flex mt-6 gap-6">
        <Skeleton width={80} height={60} className="rounded-xl" />
        <Skeleton width={80} height={60} className="rounded-xl" />
        <Skeleton width={80} height={60} className="rounded-xl" />
      </div>
    </div>
    <div>
      <Skeleton width={220} height={32} className="mb-6 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton height={220} className="rounded-2xl" />
        <Skeleton height={220} className="rounded-2xl" />
        <Skeleton height={220} className="rounded-2xl" />
      </div>
    </div>
  </div>
);

const ProfilePage = () => {
  const { email } = useParams();
  const [profile, setProfile] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `https://aljazeera-web.onrender.com/api/user/profile/${email}`
        );
        const userProfile = res.data;
        setProfile(userProfile);

        if (userProfile?._id) {
          const userId = userProfile._id;
          const [followersRes, followingRes] = await Promise.all([
            axios.get(
              `https://aljazeera-web.onrender.com/api/follow/${userId}/followers`
            ),
            axios.get(
              `https://aljazeera-web.onrender.com/api/follow/${userId}/following`
            ),
          ]);
          setFollowersCount(followersRes.data.followers || 0);
          setFollowingCount(followingRes.data.following || 0);
        } else {
          console.warn(
            "User ID not found in profile data, skipping follower count fetch."
          );
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Could not find the specified user.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [email]);

  const handleShowFollowList = async (type) => {
    if (!profile?._id) return;

    setIsModalOpen(true);
    setIsModalLoading(true);
    setModalTitle(type === "followers" ? "المتابعون" : "يتابع");

    try {
      const res = await axios.get(
        `https://aljazeera-web.onrender.com/api/follow/${profile._id}/${type}/list`
      );
      setModalUsers(res.data);
    } catch (err) {
      console.error(`Failed to fetch ${type} list:`, err);
      setModalUsers([]);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f1f5f9">
        <ProfileSkeleton />
      </SkeletonTheme>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-br from-green-50/30 to-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/30 max-w-md w-full"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl mb-4"
          >
            😕
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/blogs"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium inline-flex items-center"
          >
            Back to Articles
          </Link>
        </motion.div>
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
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div whileHover={{ x: -5 }} className="mb-8">
          <Link
            to="/blogs"
            className="inline-flex items-center px-4 py-2.5 bg-white/80 backdrop-blur-sm text-green-600 hover:text-green-800 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-white/30"
          >
            <FiArrowLeft className="ml-2" />
            <span>العودة للمقالات</span>
          </Link>
        </motion.div>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center text-center mb-12 p-8 bg-gradient-to-br from-white/70 to-green-50/50 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30"
        >
          <div className="relative mb-6">
            {profile.photoUrl ? (
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={profile.photoUrl}
                alt={profile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/80 shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center border-4 border-white/80 shadow-xl">
                <FiUser className="text-green-500 text-4xl" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-md">
              <FiUser className="text-sm" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {profile.name}
          </h1>
          <div className="flex items-center text-gray-500 mb-6">
            <FiCalendar className="ml-2" />
            <span>
              انضم في {new Date(profile.createdAt).toLocaleDateString("ar-EG")}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-white/30 min-w-[120px]">
              <div className="text-2xl font-bold text-green-600">
                {profile.blogs.length}
              </div>
              <div className="text-sm text-gray-600">مقالات</div>
            </div>
            <button
              onClick={() => handleShowFollowList("followers")}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-white/30 min-w-[120px] text-center hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="text-2xl font-bold text-green-600">
                {followersCount}
              </div>
              <div className="text-sm text-gray-600">متابعون</div>
            </button>
            <button
              onClick={() => handleShowFollowList("following")}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-md border border-white/30 min-w-[120px] text-center hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="text-2xl font-bold text-green-600">
                {followingCount}
              </div>
              <div className="text-sm text-gray-600">متابَعون</div>
            </button>
          </div>
        </motion.div>
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-green-200 inline-block"
          >
            مقالات بقلم {profile.name}
          </motion.h2>
          {profile.blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.blogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/30"
                >
                  <Link to={`/blog/${blog.slug}`} className="block h-full">
                    <div className="p-5 h-full flex flex-col">
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                        <span>
                          {new Date(blog.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {blog.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                        {blog.content.replace(/<[^>]+>/g, "")}
                      </p>
                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="text-green-600 text-sm font-medium">
                          اقرأ المزيد
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl shadow-md border border-white/30"
            >
              <FiBook className="text-gray-300 text-5xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                لم يقم هذا المستخدم بنشر أي مقالات بعد.
              </p>
              <Link
                to="/blogs"
                className="inline-block mt-6 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                استكشاف المقالات
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
      <FollowListModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        users={modalUsers}
        isLoading={isModalLoading}
      />
    </>
  );
};

export default ProfilePage;
