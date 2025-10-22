import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, debates } from "../api/api";
import { motion } from "framer-motion";
import { ArrowRight, PlusCircle } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [debateHistory, setDebateHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, debatesData] = await Promise.all([
          auth.getCurrentUser(),
          debates.getHistory(),
        ]);
        setUser(userData);
        setDebateHistory(debatesData);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white py-10"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, <span className="text-indigo-600">{user?.username}</span> 👋
            </h1>
            <p className="mt-1 text-gray-500">
              Manage your debates and track your performance.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/new-debate")}
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700 transition"
          >
            <PlusCircle size={18} /> New Debate
          </motion.button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Debate History */}
        {debateHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center mt-16 text-center"
          >
            <img
              src="https://illustrations.popsy.co/violet/empty-state.svg"
              alt="No debates"
              className="w-48 h-48 mb-6 opacity-90"
            />
            <h3 className="text-lg font-semibold text-gray-700">
              No debates yet
            </h3>
            <p className="text-gray-500 mt-1 mb-4">
              Start your first debate and see your results here.
            </p>
            <button
              onClick={() => navigate("/new-debate")}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
            >
              <PlusCircle size={16} /> Start a Debate
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {debateHistory.map((debate, i) => (
              <motion.div
                key={debate._id}
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {debate.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {new Date(debate.createdAt).toLocaleDateString()}
                </p>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    debate.winner === "Side A"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  Winner: {debate.winner}
                </span>

                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/debates/${debate._id}`)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                  >
                    View Details <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
