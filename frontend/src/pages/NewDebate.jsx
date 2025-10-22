import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { debates } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Brain, ArrowLeft, Loader2, Plus, Minus } from "lucide-react";

export default function NewDebate() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: "",
    numPoints: 3,
    sideA: [],
    sideB: [],
  });
  const [currentSide, setCurrentSide] = useState("A");
  const [currentPoints, setCurrentPoints] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleTopicChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addPoint = () => {
    if (currentPoints.length >= formData.numPoints) {
      toast.error(`You can only add ${formData.numPoints} points.`);
      return;
    }
    if (!inputValue.trim()) return;
    setCurrentPoints([...currentPoints, inputValue.trim()]);
    setInputValue("");
  };

  const removePoint = (index) => {
    setCurrentPoints(currentPoints.filter((_, i) => i !== index));
  };

  const handleNextSide = () => {
    if (currentPoints.length !== formData.numPoints) {
      toast.error(`Please enter exactly ${formData.numPoints} points.`);
      return;
    }
    if (currentSide === "A") {
      setFormData({ ...formData, sideA: currentPoints });
      setCurrentSide("B");
      setCurrentPoints([]);
    } else {
      setFormData({ ...formData, sideB: currentPoints });
      nextStep();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const loadingToast = toast.loading("AI is judging your debate...");
    try {
      const payload = {
        topic: formData.topic,
        sideA: formData.sideA,
        sideB: formData.sideB,
      };
      const data = await debates.submitDebate(payload);
      toast.dismiss(loadingToast);
      toast.success("Debate judged successfully!");
      setResult(data);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || "Failed to judge debate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white py-12"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="text-indigo-600" size={26} />
              New Debate
            </h1>
            <p className="text-gray-500 mt-1">
              Craft a debate by adding a topic and points for both sides.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Step container */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                Step 1: Debate Setup
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Debate Topic
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleTopicChange}
                  placeholder="e.g., Should AI replace human judges?"
                  className="mt-2 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm text-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Points (1–10)
                </label>
                <input
                  type="number"
                  name="numPoints"
                  min="1"
                  max="10"
                  value={formData.numPoints}
                  onChange={handleTopicChange}
                  className="mt-2 w-32 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-2 text-sm text-gray-700"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm"
                >
                  Next →
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900">
                Step 2: Add Points ({`Side ${currentSide}`})
              </h2>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Enter a point for Side ${currentSide}`}
                  className="flex-grow rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3 text-sm text-gray-700"
                />
                <button
                  type="button"
                  onClick={addPoint}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                >
                  <Plus size={18} />
                </button>
              </div>

              <ul className="space-y-2">
                {currentPoints.map((p, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"
                  >
                    <span className="text-gray-800 text-sm">{p}</span>
                    <button
                      onClick={() => removePoint(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Minus size={16} />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex justify-between pt-3">
                <button
                  onClick={prevStep}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextSide}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm"
                >
                  {currentSide === "A" ? "Next: Side B →" : "Continue →"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && !result && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Step 3: Review & Submit
              </h2>

              <p className="text-gray-700 mb-3">
                <strong>Topic:</strong> {formData.topic}
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-indigo-700 mb-2">
                    Side A Points
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {formData.sideA.map((p, i) => (
                      <li key={i} className="bg-indigo-50 p-2 rounded-md">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-blue-700 mb-2">
                    Side B Points
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {formData.sideB.map((p, i) => (
                      <li key={i} className="bg-blue-50 p-2 rounded-md">
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  onClick={handleSubmit}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition shadow-sm ${
                    loading
                      ? "bg-indigo-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Judging...
                    </>
                  ) : (
                    <>
                      <Brain size={18} /> Judge Debate
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Results */}
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 bg-white border border-gray-100 shadow-sm rounded-2xl p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🏆 Debate Results
              </h2>

              <p className="text-gray-700 mb-3">
                <strong>Topic:</strong> {formData.topic}
              </p>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase mb-1">
                    Winner
                  </p>
                  <p className="text-lg font-semibold text-indigo-700">
                    {result.winner}
                  </p>
                </div>

                <div className="sm:col-span-2 bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase mb-2">
                    AI Feedback
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {result.feedback}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-sm"
                >
                  Back to Dashboard
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
