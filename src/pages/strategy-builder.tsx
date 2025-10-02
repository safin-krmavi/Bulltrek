import { useState } from "react";
import { Button } from "@/components/ui/button";
import apiClient from "@/api/apiClient";

export default function StrategyBuilderPage() {
  const [strategyName, setStrategyName] = useState("");
  const [exitCondition, setExitCondition] = useState("");
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [conditions, setConditions] = useState<string[]>([""]);

  const timeframes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Sell', 'Buy', '1M', '5M', '15M', '15M', '30M', '45M'];

  const getAuthToken = () => {
    return localStorage.getItem("AUTH_TOKEN") || 
           localStorage.getItem("token") || 
           localStorage.getItem("authToken") || 
           localStorage.getItem("accessToken") || 
           "";
  };

  const handleTimeframeClick = (timeframe: string) => {
    if (selectedTimeframes.includes(timeframe)) {
      setSelectedTimeframes(selectedTimeframes.filter(t => t !== timeframe));
    } else {
      setSelectedTimeframes([...selectedTimeframes, timeframe]);
    }
  };

  const handleAddCondition = () => {
    setConditions([...conditions, ""]);
  };

  const handleConditionChange = (index: number, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = value;
    setConditions(newConditions);
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

      const response = await apiClient.post("/bots", botPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Bot creation response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Bot creation error:", error);
      throw error;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!strategyName.trim() || conditions.some(condition => !condition.trim()) || !exitCondition.trim()) {
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
      const payload = { 
        name: strategyName, 
        entry_condition: conditions.join("; "), 
        exit_condition: exitCondition, 
        timeframes: selectedTimeframes.join(",") 
      };
      let response;

      try {
        response = await apiClient.post("/strategy", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err: any) {
        if (err?.response?.status === 404) {
          response = await apiClient.post("/strategies", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          throw err;
        }
      }

      const strategyId = response.data?.data?.id;
      if (strategyId) {
        try {
          await createBotForStrategy(strategyId);
          setSuccessMessage(
            `Strategy and Bot created successfully! Strategy ID: ${strategyId}`
          );
        } catch (botError) {
          setSuccessMessage(`Strategy created successfully! (Bot creation failed)`);
        }
      }

      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 5000);

      setStrategyName("");
      setConditions([""]);
      setExitCondition("");
      setSelectedTimeframes([]);
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
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 p-6 shadow-md">
      <form onSubmit={onSubmit} className="max-w-5xl mx-auto space-y-8 shadow-sm border border-gray-200 dark:border-gray-700 p-6 rounded-lg">
        {/* Strategy Timeline */}
        <div className="relative bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="font-medium text-base">Entry Strategy</span>
            </div>
            <div className="flex-1 mx-4">
              <div className="h-0.5 bg-gradient-to-r from-orange-500 to-orange-300"></div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="font-medium text-base">Exit Strategy</span>
              <div className="w-3 h-3 rounded-full bg-orange-300"></div>
            </div>
          </div>

          {/* Multiple Conditions */}
          <div className="space-y-6 mb-6">
            {conditions.map((condition, index) => (
              <div key={index} className="relative">
                <div className="flex items-center mb-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm text-gray-600">
                    Condition {index + 1}: {index === 0 ? "" : ""}
                  </span>
                </div>
                <input
                  type="text"
                  className="w-full p-2.5 border-b border-gray-300 focus:border-b-2 focus:border-orange-500 focus:outline-none"
                  placeholder={`Type or select keywords to describe your ${index === 0 ? 'entry' : 'additional'} strategy`}
                  value={condition}
                  onChange={(e) => handleConditionChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Timeframe Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {timeframes.map((timeframe, index) => (
              <button
                key={index}
                onClick={() => handleTimeframeClick(timeframe)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-all
                  ${
                    selectedTimeframes.includes(timeframe)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {timeframe}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              className="px-6 py-2 border-gray-800 text-gray-800 hover:bg-gray-50"
            >
              Test
            </Button>
            <Button
              type="button"
              onClick={handleAddCondition}
              className="px-6 py-2 bg-orange-500 text-white hover:bg-orange-600"
              disabled={loading}
            >
              Add another condition
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white hover:bg-orange-600"
              disabled={loading}
            >
              Submit
            </Button>
          </div>
        </div>
      </form>
      
      {/* Success Popup */}
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