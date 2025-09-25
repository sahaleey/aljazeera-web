// src/components/ReportBugButton.jsx
import { useState } from "react";
import { Bug, X, Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import * as Sentry from "@sentry/react";
import "../style/scrollbar.css";

function ReportBugButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    priority: "medium",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.length < 10)
      newErrors.description =
        "Please provide more details (min. 10 characters)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const eventId = Sentry.captureMessage("User submitted bug report");
      Sentry.captureException(new Error(formData.description), {
        user: { name: formData.name, email: formData.email },
        tags: { priority: formData.priority },
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setFormData({
          name: "",
          email: "",
          description: "",
          priority: "medium",
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to submit bug report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSubmitted(false);
    setFormData({ name: "", email: "", description: "", priority: "medium" });
    setErrors({});
  };

  return (
    <>
      {/* Enhanced Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 px-6 py-3 flex items-center gap-3 rounded-2xl
                   backdrop-blur-lg bg-green-300/70 border border-white/30 z-50 text-black font-semibold shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl group"
      >
        <div className="relative">
          <Bug className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
        </div>
        Report Bug
      </button>

      {/* Enhanced Modal with Glass Morphism */}
      {isOpen && (
        <div className="fixed inset-0  bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div
            className="relative bg-gradient-to-br h-[95%] from-white/10 to-white/5 rounded-3xl 
                       border border-white/20 shadow-2xl w-full max-w-md overflow-scroll overflow-x-hidden 
                       backdrop-blur-xl"
            dir="ltr"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-400/20 rounded-xl">
                    <Bug className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Report an Issue
                    </h2>
                    <p className="text-sm text-white/60">
                      Help us improve your experience
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
            </div>

            {/* Success State */}
            {isSubmitted ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Thank You!
                </h3>
                <p className="text-white/70">
                  Your bug report has been submitted successfully.
                </p>
              </div>
            ) : (
              /* Form Content */
              <div className="p-6 space-y-4">
                {/* Priority Selector */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Priority Level
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "low", label: "Low", color: "bg-green-500" },
                      {
                        value: "medium",
                        label: "Medium",
                        color: "bg-yellow-500",
                      },
                      { value: "high", label: "High", color: "bg-red-500" },
                    ].map((priority) => (
                      <button
                        key={priority.value}
                        onClick={() =>
                          handleInputChange("priority", priority.value)
                        }
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                                  ${
                                    formData.priority === priority.value
                                      ? `${priority.color} text-white shadow-lg`
                                      : "bg-white/5 text-white/60 hover:bg-white/10"
                                  }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border transition-all
                              ${
                                errors.name
                                  ? "border-red-400/50"
                                  : "border-white/10"
                              }
                              text-white placeholder-white/40 focus:outline-none 
                              focus:ring-2 focus:ring-blue-400/50 focus:border-transparent`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border transition-all
                              ${
                                errors.email
                                  ? "border-red-400/50"
                                  : "border-white/10"
                              }
                              text-white placeholder-white/40 focus:outline-none 
                              focus:ring-2 focus:ring-blue-400/50 focus:border-transparent`}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Issue Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border transition-all
                              ${
                                errors.description
                                  ? "border-red-400/50"
                                  : "border-white/10"
                              }
                              text-white placeholder-white/40 focus:outline-none 
                              focus:ring-2 focus:ring-blue-400/50 focus:border-transparent
                              resize-none`}
                    placeholder="Please describe the issue in detail..."
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                  <div className="text-right text-xs text-white/40 mt-1">
                    {formData.description.length}/500
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-green-400 text-amber-50 rounded-xl font-semibold shadow-lg hover:shadow-xl
                             transition-all duration-300 hover:scale-[1.02] disabled:opacity-50
                             disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ReportBugButton;
