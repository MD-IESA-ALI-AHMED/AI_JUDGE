import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { debates } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Brain, ArrowLeft, Loader2, Plus, Pencil, Check, Edit3 } from "lucide-react";

export default function NewDebate() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: "",
    numPoints: 1,
    sideA: [],
    sideB: [],
  });
  const [turn, setTurn] = useState("A");
  const [inputValue, setInputValue] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Derived progress
  const totalRounds = formData.numPoints * 2;
  const currentCount = formData.sideA.length + formData.sideB.length;
  const progress = Math.floor((currentCount / totalRounds) * 100);

  const handleChange = (e) => {
    console.log(e.target);
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === "numPoints" ? parseInt(value) : value });
  };

  const handleAddArgument = () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a valid argument.");
      return;
    }

    const updated = { ...formData };
    if (turn === "A") {
      updated.sideA.push(inputValue.trim());
      setTurn("B");
    } else {
      updated.sideB.push(inputValue.trim());
      setTurn("A");
      setCurrentIndex((i) => i + 1);
    }
    setFormData(updated);
    setInputValue("");

    if (updated.sideA.length === formData.numPoints && updated.sideB.length === formData.numPoints) {
      toast.success("All arguments added! Review before submission.");
      setStep(3);
    }
  };

  const handleEditArgument = (side, index, newValue) => {
    const updated = { ...formData };
    if (side === "A") updated.sideA[index] = newValue;
    else updated.sideB[index] = newValue;
    setFormData(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const toastId = toast.loading("AI is judging your debate...");
    try {
      const payload = {
        topic: formData.topic,
        sideA: formData.sideA,
        sideB: formData.sideB,
      };
      const data = await debates.submitDebate(payload);
      toast.dismiss(toastId);
      toast.success("Debate judged successfully!");
      setResult(data);
      setStep(4);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to judge debate.");
    } finally {
      setLoading(false);
    }
  };

  const resetDebate = () => {
    setStep(1);
    setFormData({ topic: "", numPoints: 3, sideA: [], sideB: [] });
    setTurn("A");
    setResult(null);
    setCurrentIndex(0);
    setEditMode(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="text-indigo-600" size={26} /> New Debate
          </h1>
          <button onClick={() => navigate("/dashboard")} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Setup */}
          {step === 1 && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Step 1: Setup</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">Debate Topic</label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g., Should AI replace human judges?"
                  className="mt-2 w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 p-3 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Arguments (1–5)</label>
                <input
                  type="number"
                  name="numPoints"
                  min="1"
                  max="5"
                  value={formData.numPoints}
                  onChange={handleChange}
                  className="mt-2 w-32 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 p-2 text-sm"
                />
              </div>
              <div className="flex justify-end">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  onClick={() => formData.topic.trim() ? setStep(2) : toast.error("Enter a topic first")}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm">
                  Start Debate →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Add Arguments */}
          {step === 2 && (
            <motion.div key="arguments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Round {Math.ceil(currentCount / 2) + 1}</h2>
                <span className="text-sm text-gray-500">{currentCount}/{totalRounds}</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>

              <p className="text-gray-700 font-medium">Now: {turn === "A" ? "🟣 Side A" : "🔵 Side B"}</p>

              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Enter argument for Side ${turn}`}
                className="w-full rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 p-3 text-sm min-h-[100px]"
              />
              <div className="flex justify-end">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAddArgument}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm">
                  <Plus size={18} /> Add Argument
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && !result && (
            <motion.div key="review" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Review & Edit</h2>
                <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-1 text-indigo-600 text-sm font-medium">
                  {editMode ? <><Check size={16}/> Done Editing</> : <><Edit3 size={16}/> Edit</>}
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {["A", "B"].map((side) => (
                  <div key={side}>
                    <h3 className={`text-lg font-medium ${side === "A" ? "text-indigo-700" : "text-red-700"}`}>Side {side}</h3>
                    {formData[`side${side}`].map((arg, i) => (
                      <div key={i} className="mt-3">
                        {editMode ? (
                          <textarea
                            value={arg}
                            onChange={(e) => handleEditArgument(side, i, e.target.value)}
                            className="w-full border rounded-xl p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          <p className="bg-gray-50 p-2 rounded-md text-sm">{arg}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="text-gray-700 hover:text-gray-900">← Back</button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit} disabled={loading}
                  className={`px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 ${loading ? "opacity-50" : ""}`}>
                  {loading ? <><Loader2 className="animate-spin" size={18}/> Judging...</> : <>Judge Debate</>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Results */}
          {step === 4 && result && (
            <motion.div key="results" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white shadow-md rounded-2xl border border-gray-100 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">🏆 Results</h2>
              <p className="text-gray-700"><strong>Topic:</strong> {formData.topic}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase mb-1">Winner</p>
                  <p className="text-lg font-semibold text-indigo-700">{result.winner}</p>
                </div>
                <div className="sm:col-span-2 bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase mb-1">AI Feedback</p>
                  <p className="text-gray-700 text-sm">{result.feedback}</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={resetDebate} className="px-4 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-100">New Debate</button>
                <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700">Back to Dashboard</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
