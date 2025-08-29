import { useState } from "react";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/apiClient";
// import { STRATEGY_KEYWORDS } from "../strategyKeywords";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";

// const BASE_URL = import.meta.env.VITE_API_URL as string;

export default function StrategyBuilderPage() {
  const [strategyName, setStrategyName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const getAuthToken = () => {
    return (
      localStorage.getItem("AUTH_TOKEN") ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  };

  // Create bot function
  const createBotForStrategy = async (strategyId: number) => {
    try {
      const token = getAuthToken();
      const botPayload = {
        name: `${strategyName} Bot`,
        strategy_id: strategyId,
        mode: "paper",
        execution_type: "manual",
      };

      console.log("Creating bot with payload:", botPayload);

      const response = await apiClient.post("/bots", botPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Bot creation response:", response.data);
      alert(`Bot created successfully! Bot ID: ${response.data?.data?.id || "N/A"}`);
      return response.data;
    } catch (error: any) {
      console.error("Bot creation error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to create bot";
      alert(`Failed to create bot: ${errorMessage}`);
      throw error;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!strategyName.trim() || !prompt.trim() || !description.trim()) {
      alert("Please fill all fields.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert("Missing auth token. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      // Prefer singular endpoint
      const payload = { prompt, name: strategyName, description };
      let response;

      try {
        response = await apiClient.post("/strategy", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err: any) {
        // Fallback to plural if singular is not found
        if (err?.response?.status === 404) {
          response = await apiClient.post("/strategies", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          throw err;
        }
      }

      console.log("Strategy creation response:", response.data);

      const strategyId = response.data?.data?.id;
      if (strategyId) {
        try {
          await createBotForStrategy(strategyId);
          setSuccessMessage(
            `Strategy and Bot created successfully! Strategy ID: ${strategyId}`
          );
        } catch (botError) {
          console.error("Bot creation failed but strategy was created:", botError);
          setSuccessMessage(`Strategy created successfully! (Bot creation failed)`);
        }
      } else {
        setSuccessMessage(
          "Strategy created but couldn't get strategy ID for bot creation"
        );
      }

      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 5000);

      setStrategyName("");
      setPrompt("");
      setDescription("");
    } catch (err: any) {
      console.error("Strategy creation error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to create strategy";
      alert(`Failed to create strategy: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F6FA] dark:bg-[#18181B] flex flex-col items-center justify-start">
      {/* Card container for dark mode with gradient and shadow */}
      <div className="w-full max-w-4xl mx-auto my-12 bg-card dark:bg-gradient-to-br dark:from-[#232326] dark:to-[#18181B] border border-border dark:border-gray-700 shadow-2xl text-foreground dark:text-white rounded-2xl transition-all duration-300 p-10 flex flex-col relative overflow-hidden">
        {/* Accent bar */}
        <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[#FF8C00] to-[#7B2323] rounded-l-2xl" />
        {/* Strategy Name Input */}
        <div className="mb-8">
          <label htmlFor="strategyName" className="block text-2xl font-bold text-[#7B2323] mb-2 flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-[#FF8C00] rounded-full mr-2"></span>
            Strategy Name
          </label>
          <input
            id="strategyName"
            type="text"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            placeholder="Enter your strategy name..."
            className="w-full px-4 py-3 border border-[#FF8C00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent text-[#7B2323] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-[#232326] shadow-sm transition-all duration-200"
          />
        </div>
        {/* Prompt Input */}
        <div className="mb-8">
          <label htmlFor="prompt" className="block text-2xl font-bold text-[#7B2323] mb-2 flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-[#FF8C00] rounded-full mr-2"></span>
            Prompt
          </label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your strategy prompt..."
            className="w-full px-4 py-3 border border-[#FF8C00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent text-[#7B2323] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-[#232326] shadow-sm transition-all duration-200"
          />
        </div>
        {/* Description Input */}
        <div className="mb-8">
          <label htmlFor="description" className="block text-2xl font-bold text-[#7B2323] mb-2 flex items-center gap-2">
            <span className="inline-block w-2 h-6 bg-[#FF8C00] rounded-full mr-2"></span>
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your strategy description..."
            className="w-full px-4 py-3 border border-[#FF8C00] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent text-[#7B2323] dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-[#232326] shadow-sm transition-all duration-200"
          />
        </div>
        {/* Submit Button */}
        <form onSubmit={onSubmit}>
          <div className="flex gap-4 justify-end mt-6">
            <Button
              type="submit"
              className="bg-[#FF8C00] hover:bg-[#FFA500] text-white rounded-full shadow-md px-10 py-3 font-semibold transition-all duration-200"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Create Strategy"}
            </Button>
          </div>
        </form>
      </div>
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2] dark:from-[#232326] dark:to-[#18181B] p-10 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-scaleIn text-[#7B2323] dark:text-white border-2 border-[#FF8C00] dark:border-[#FF8C00] relative overflow-hidden">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounceIn">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="text-center mt-12">
              <h2 className="text-3xl font-extrabold text-[#7B2323] dark:text-[#FF8C00] mb-2">Success!</h2>
              <p className="text-gray-600 dark:text-gray-200 mb-6">{successMessage}</p>
              <Button
                className="bg-gradient-to-r from-[#FF8C00] to-[#7B2323] text-white hover:from-[#FFA500] hover:to-[#7B2323] px-10 py-3 rounded-full text-lg font-semibold shadow-md transition-all duration-200"
                onClick={() => setShowSuccessPopup(false)}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}