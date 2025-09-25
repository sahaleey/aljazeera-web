import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiTrash2,
  FiHeart,
  FiMessageSquare,
  FiUser,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiEdit3,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { FaRegSmile, FaRegLaugh, FaRegHeart, FaHeart } from "react-icons/fa";
import { MdOutlineEmojiEmotions, MdOutlineVerified } from "react-icons/md";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const Comments = ({ blogSlug, user, token }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `https://aljazeera-web.onrender.com/api/blogs/${blogSlug}/comments`
      );
      setComments(res.data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [blogSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!user) {
      toast.error("يجب تسجيل الدخول لإضافة تعليق.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        `https://aljazeera-web.onrender.com/api/blogs/${blogSlug}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments([res.data, ...comments]);
      setNewComment("");
      toast.success("تم نشر التعليق بنجاح! 🎉");
    } catch (error) {
      toast.error("فشل في نشر التعليق.");
      console.error("Comment submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لحذف التعليقات.");
      return;
    }

    if (!window.confirm("هل أنت متأكد من حذف هذا التعليق؟")) return;

    try {
      await axios.delete(
        `https://aljazeera-web.onrender.com/api/blogs/${blogSlug}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("تم حذف التعليق.");
    } catch (error) {
      toast.error("فشل في حذف التعليق.");
      console.error("Delete error:", error);
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لحذف الردود.");
      return;
    }

    if (!window.confirm("هل أنت متأكد من حذف هذا الرد؟")) return;

    try {
      await axios.delete(
        `https://aljazeera-web.onrender.com/api/blogs/${blogSlug}/comments/${commentId}/replies/${replyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
            : c
        )
      );

      toast.success("تم حذف الرد.");
    } catch (error) {
      toast.error("فشل في حذف الرد.");
      console.error("Delete reply error:", error);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const res = await axios.patch(
        `https://aljazeera-web.onrender.com/api/blogs/${blogSlug}/comments/${commentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data : c))
      );
      setEditingComment(null);
      setEditContent("");
      toast.success("تم تعديل التعليق بنجاح!");
    } catch (error) {
      toast.error("فشل في تعديل التعليق.");
      console.error("Edit error:", error);
    }
  };

  const handleLike = async (commentId) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول للإعجاب بالتعليقات.");
      return;
    }

    setComments((prev) =>
      prev.map((c) => {
        if (c._id !== commentId) return c;
        const already = (c.likes || []).includes(user.email);
        const newLikes = already
          ? (c.likes || []).filter((em) => em !== user.email)
          : [...(c.likes || []), user.email];
        return { ...c, likes: newLikes };
      })
    );

    try {
      const res = await axios.patch(
        `https://aljazeera-web.onrender.com/api/blogs/${blogSlug}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedComment = res.data;
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? updatedComment : c))
      );
    } catch (error) {
      console.error("Like error:", error);
      toast.error("فشل في الإعجاب بالتعليق.");
      fetchComments();
    }
  };

  const handleReply = async (commentId) => {
    if (!replyContent.trim()) return;
    if (!user) {
      toast.error("يجب تسجيل الدخول للرد على التعليقات.");
      return;
    }

    try {
      const res = await axios.post(
        `https://aljazeera-web.onrender.com/api/blogs/${blogSlug}/comments/${commentId}/reply`,
        { content: replyContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newReply = res.data;

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c
        )
      );

      toast.success("تم إضافة الرد بنجاح! 💫");
      setReplyContent("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Reply error:", error);
      toast.error("فشل في إضافة الرد.");
    }
  };

  const isLikedBy = (comment) => {
    return (
      user && Array.isArray(comment.likes) && comment.likes.includes(user.email)
    );
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return "الآن";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} ساعة`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} يوم`;
    return new Date(date).toLocaleDateString("ar-EG");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-green-200/50">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent">
          💬 التعليقات ({comments.length})
        </h3>
        <div className="flex items-center gap-2 text-green-600">
          <FiMessageSquare className="text-2xl" />
          <span className="font-semibold">نقاش القراء</span>
        </div>
      </div>

      {/* Enhanced Comment Form */}
      {user ? (
        <motion.form
          onSubmit={handleSubmit}
          className="mb-8 bg-gradient-to-r from-green-50/50 to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${
                    user.displayName || user.email
                  }&background=10b981&color=fff`
                }
                alt={user.displayName || user.email}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-bold text-green-800">
                  {user.displayName || user.email}
                </span>
                <span className="text-xs bg-green-500/20 text-green-700 px-2 py-1 rounded-full">
                  أنت
                </span>
              </div>

              <textarea
                className="w-full p-4 bg-white/80 border border-white/50 rounded-2xl focus:ring-2 focus:ring-green-300 focus:border-green-400 transition text-right placeholder-gray-500 resize-none"
                rows="4"
                placeholder="شاركنا رأيك أو اطرح سؤالاً... 💭"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                style={{ direction: "rtl" }}
              />

              <div className="flex items-center justify-between mt-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      جاري النشر...
                    </>
                  ) : (
                    <>
                      <span>نشر التعليق</span>
                      <FiSend className="text-lg" />
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  className="p-2 text-gray-500 hover:text-yellow-500 transition"
                  title="إضافة رمز تعبيري"
                >
                  <MdOutlineEmojiEmotions className="text-xl" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.form>
      ) : (
        <motion.div
          className="mb-8 text-center bg-gradient-to-r from-yellow-50/50 to-amber-50/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-200/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <FiUser className="text-2xl text-yellow-600" />
            <p className="text-gray-700 text-lg">
              <Link
                to="/login"
                className="text-green-600 font-bold underline hover:text-green-700 transition"
              >
                سجل الدخول
              </Link>{" "}
              لإضافة تعليق والمشاركة في النقاش
            </p>
          </div>
          <p className="text-gray-500 text-sm">
            انضم إلى مجتمع القراء وشاركنا رأيك!
          </p>
        </motion.div>
      )}

      {/* Enhanced Comments List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              {/* Comment Header */}
              <div className="p-6 border-b border-gray-100/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          comment.authorPhotoUrl ||
                          `https://ui-avatars.com/api/?name=${comment.authorName}&background=10b981&color=fff`
                        }
                        alt={comment.authorName}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                      />
                      {comment.verified && (
                        <MdOutlineVerified className="absolute -bottom-1 -right-1 text-blue-500 bg-white rounded-full text-sm" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800">
                          {comment.authorName}
                        </p>
                        {comment.authorEmail === "ajua46244@gmail.com" && (
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs px-2 py-1 rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <FiClock className="text-gray-400" />
                        <span>{getTimeAgo(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {user && comment.authorEmail === user.email && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(comment._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition"
                          title="حذف التعليق"
                        >
                          <FiTrash2 />
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Comment Content */}
              <div className="p-6">
                {editingComment === comment._id ? (
                  <div className="space-y-3">
                    <textarea
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 text-right"
                      rows="3"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{ direction: "rtl" }}
                    />
                    <div className="flex gap-2 justify-start">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleEdit(comment._id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl flex items-center gap-2"
                      >
                        <FiCheck /> حفظ
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setEditingComment(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl flex items-center gap-2"
                      >
                        <FiX /> إلغاء
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <p
                    className="text-gray-700 leading-relaxed text-right"
                    style={{ direction: "rtl" }}
                  >
                    {comment.content}
                  </p>
                )}

                {/* Comment Actions */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100/50">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLike(comment._id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      isLikedBy(comment)
                        ? "bg-red-50 text-red-600"
                        : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                    }`}
                  >
                    {isLikedBy(comment) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FiHeart />
                    )}
                    <span className="font-medium">
                      {(comment.likes || []).length}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment._id ? null : comment._id
                      )
                    }
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      replyingTo === comment._id
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-500 hover:text-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    <FiMessageSquare />
                    <span>رد</span>
                  </motion.button>
                </div>

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-gray-100/50"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          user?.photoURL ||
                          `https://ui-avatars.com/api/?name=${
                            user?.displayName || user?.email
                          }&background=3b82f6&color=fff`
                        }
                        alt="Your avatar"
                        className="w-8 h-8 rounded-xl"
                      />
                      <div className="flex-1">
                        <textarea
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 text-right text-sm"
                          rows="2"
                          placeholder="اكتب ردك هنا..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          style={{ direction: "rtl" }}
                        />
                        <div className="flex gap-2 mt-2 justify-start">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleReply(comment._id)}
                            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-600 transition flex items-center gap-2"
                          >
                            <FiSend size={14} />
                            نشر الرد
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setReplyingTo(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-300 transition"
                          >
                            إلغاء
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enhanced Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      onClick={() =>
                        setShowReplies((prev) => ({
                          ...prev,
                          [comment._id]: !prev[comment._id],
                        }))
                      }
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showReplies[comment._id] ? (
                        <FiChevronUp />
                      ) : (
                        <FiChevronDown />
                      )}
                      {showReplies[comment._id]
                        ? "إخفاء الردود"
                        : `عرض الردود (${comment.replies.length})`}
                    </motion.button>

                    <AnimatePresence>
                      {showReplies[comment._id] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 ml-6 pl-6 border-l-2 border-green-200/50 space-y-4"
                        >
                          {comment.replies.map((reply) => (
                            <motion.div
                              key={reply._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-gradient-to-r from-gray-50/50 to-green-50/30 p-4 rounded-xl border border-white/50"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      reply.authorPhotoUrl ||
                                      `https://ui-avatars.com/api/?name=${reply.authorName}&background=3b82f6&color=fff`
                                    }
                                    alt={reply.authorName}
                                    className="w-8 h-8 rounded-xl border-2 border-white"
                                  />
                                  <div className="text-right">
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-sm text-gray-800">
                                        {reply.authorName}
                                      </p>
                                      {reply.authorEmail === user?.email && (
                                        <span className="text-xs bg-blue-500/20 text-blue-700 px-2 py-0.5 rounded-full">
                                          أنت
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-500 text-xs">
                                      {getTimeAgo(reply.createdAt)}
                                    </p>
                                  </div>
                                </div>

                                {user && reply.authorEmail === user.email && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    onClick={() =>
                                      handleDeleteReply(comment._id, reply._id)
                                    }
                                    className="p-1 text-red-400 hover:text-red-600 transition"
                                    title="حذف الرد"
                                  >
                                    <FiTrash2 size={14} />
                                  </motion.button>
                                )}
                              </div>
                              <p
                                className="text-gray-700 text-sm mt-2 text-right"
                                style={{ direction: "rtl" }}
                              >
                                {reply.content}
                              </p>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-gradient-to-br from-gray-50/50 to-green-50/30 rounded-2xl shadow-lg border border-white/30"
          >
            <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiMessageSquare className="text-3xl text-green-500" />
            </div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">
              لا توجد تعليقات بعد
            </h4>
            <p className="text-gray-500 mb-4">كن أول من يعلق وابدأ النقاش!</p>
            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
              >
                <FiUser />
                تسجيل الدخول للتعليق
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Comments;
