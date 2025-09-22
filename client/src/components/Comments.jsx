import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiTrash2, FiHeart, FiMessageSquare } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

const Comments = ({ blogSlug, user, token }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState({});

  // reusable fetch so we can call it on mount and on rollback
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
      toast.success("تم نشر التعليق بنجاح!");
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

  // reply delete handler

  const handleDeleteReply = async (commentId, replyId) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لحذف الردود.");
      return;
    }

    try {
      await axios.delete(
        `https://aljazeera-web.onrender.com/api/blogs/${blogSlug}/comments/${commentId}/replies/${replyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // update local state: filter out that reply
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

  // Like toggle — PATCH to the backend route your controller uses
  const handleLike = async (commentId) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول للإعجاب بالتعليقات.");
      return;
    }

    // optimistic update: toggle locally first
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

      // backend returns the updated comment — replace it
      const updatedComment = res.data;
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? updatedComment : c))
      );
    } catch (error) {
      // rollback by refetching comments
      console.error("Like error:", error);
      toast.error("فشل في الإعجاب بالتعليق.");
      fetchComments();
    }
  };

  //  Reply to a comment
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

      // Inject reply into correct parent
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: [...(c.replies || []), newReply] }
            : c
        )
      );

      toast.success("تم إضافة الرد بنجاح!");
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

  return (
    <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-green-200 text-right">
        التعليقات ({comments.length})
      </h3>

      {/* Comment Form */}
      {user ? (
        <motion.form
          onSubmit={handleSubmit}
          className="mb-8 bg-white/90 p-5 rounded-2xl shadow-md border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <textarea
            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-300 focus:border-green-400 transition text-right"
            rows="4"
            placeholder="اكتب تعليقك هنا..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            style={{ direction: "rtl" }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={submitting}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:bg-gray-400 transition flex items-center gap-2 float-right"
          >
            {submitting ? (
              "جاري النشر..."
            ) : (
              <>
                <span>نشر التعليق</span>
                <FiSend className="ml-2" />
              </>
            )}
          </motion.button>
          <div className="clear-both"></div>
        </motion.form>
      ) : (
        <motion.div
          className="mb-8 text-center bg-white/90 p-5 rounded-2xl shadow-md border border-white/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-700">
            <Link to="/login" className="text-green-600 font-bold underline">
              سجل الدخول
            </Link>{" "}
            لإضافة تعليق.
          </p>
        </motion.div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4 bg-white/90 p-5 rounded-2xl shadow-md border border-white/30"
            >
              <img
                src={
                  comment.authorPhotoUrl ||
                  `https://ui-avatars.com/api/?name=${comment.authorName}&background=random`
                }
                alt={comment.authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="flex-1 text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800">
                      {comment.authorName}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString("ar-EG")}
                    </span>
                  </div>

                  {/* Delete button for author (compare emails — backend uses authorEmail) */}
                  {user && comment.authorEmail === user.email && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-red-500 hover:text-red-700 transition p-2 rounded-full hover:bg-red-50"
                      title="حذف التعليق"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>

                <p
                  className="text-gray-700 mt-2 mb-4"
                  style={{ direction: "rtl" }}
                >
                  {comment.content}
                </p>

                <div className="flex items-center gap-4 justify-start">
                  <button
                    onClick={() => handleLike(comment._id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-green-600 transition"
                    title={isLikedBy(comment) ? "إلغاء الإعجاب" : "أعجبني"}
                  >
                    {isLikedBy(comment) ? (
                      <FiHeart className="text-green-500" />
                    ) : (
                      <FiHeart />
                    )}
                    <span>{(comment.likes || []).length}</span>
                  </button>

                  <button
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment._id ? null : comment._id
                      )
                    }
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition"
                  >
                    <FiMessageSquare />
                    <span>رد</span>
                  </button>
                </div>

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-gray-100"
                  >
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition text-right"
                      rows="2"
                      placeholder="اكتب ردك هنا..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      style={{ direction: "rtl" }}
                    />
                    <div className="flex gap-2 mt-2 justify-start">
                      <button
                        onClick={() => handleReply(comment._id)}
                        className="px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition"
                      >
                        نشر الرد
                      </button>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setShowReplies((prev) => ({
                          ...prev,
                          [comment._id]: !prev[comment._id],
                        }))
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {showReplies[comment._id]
                        ? "إخفاء الردود"
                        : `عرض الردود (${comment.replies.length})`}
                    </button>

                    {showReplies[comment._id] && (
                      <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
                        {comment.replies.map((reply) => (
                          <motion.div
                            key={reply._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl"
                          >
                            <img
                              src={
                                reply.authorPhotoUrl ||
                                `https://ui-avatars.com/api/?name=${reply.authorName}&background=random`
                              }
                              alt={reply.authorName}
                              className="w-8 h-8 rounded-full border"
                            />
                            <div className="flex-1 text-right">
                              <div className="flex items-center justify-between">
                                <p className="font-bold text-sm">
                                  {reply.authorName}
                                </p>

                                {/* Delete button for reply */}
                                {user && reply.authorEmail === user.email && (
                                  <button
                                    onClick={() =>
                                      handleDeleteReply(comment._id, reply._id)
                                    }
                                    className="text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-50"
                                    title="حذف الرد"
                                  >
                                    <FiTrash2 size={14} />
                                  </button>
                                )}
                              </div>
                              <p
                                className="text-gray-700 text-sm"
                                style={{ direction: "rtl" }}
                              >
                                {reply.content}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 bg-white/70 rounded-2xl shadow-md border border-white/30"
          >
            <FiMessageSquare className="text-gray-300 text-4xl mx-auto mb-3" />
            <p className="text-gray-500">
              لا توجد تعليقات بعد. كن أول من يعلق!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Comments;
