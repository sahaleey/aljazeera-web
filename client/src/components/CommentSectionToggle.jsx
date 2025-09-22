import { useState } from "react";
import { motion } from "framer-motion";
import Comments from "./Comments";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

const CommentSectionToggle = ({ blogSlug, user, token }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 py-2 text-green-700 font-medium hover:bg-green-50 rounded-md transition"
      >
        {open ? "إخفاء التعليقات" : "عرض التعليقات"}
        {open ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </button>

      {/* Animate the opening/closing */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={
          open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.3 }}
        className="overflow-hidden mt-4"
      >
        {open && <Comments blogSlug={blogSlug} user={user} token={token} />}
      </motion.div>
    </div>
  );
};

export default CommentSectionToggle;
