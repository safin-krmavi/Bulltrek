import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Bot } from "@/hooks/useBotManagement";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import apiClient from "@/api/apiClient";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface TradeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApi: string;
  selectedBot: Bot | null;
}

// Add this interface for the backtest response
// interface BacktestResponse {
//   status: string;
//   message: string;
//   data: {
//     result: string;
//     metrics: {
//       profit_loss: number;
//       win_rate: number;
//       // Add other metrics as needed
//     };
//   };
// }

// Add this interface for the backtest results
interface BacktestResultResponse {
  result: string;
}

// Add this interface for the paper trade response
interface PaperTradeResponse {
  message: string;
}

export function TradeConfirmationDialog({
  isOpen,
  onClose,
  selectedApi,
  selectedBot,
}: TradeConfirmationDialogProps) {
  const [isBacktesting] = useState(false);
  const [showBacktestAlert, setShowBacktestAlert] = useState(false);
  const [isPaperTrading, setIsPaperTrading] = useState(false);
  const [showPaperTradeAlert, setShowPaperTradeAlert] = useState(false);
  const [paperTradeMessage, setPaperTradeMessage] = useState<string>("");
  
  // New state for backtest results
  const [backtestResults, setBacktestResults] = useState<BacktestResultResponse | null>(null);
  const [showBacktestResults, setShowBacktestResults] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isBacktestSubmitting, setIsBacktestSubmitting] = useState(false);

  // Backtest form state
  const [backtestForm, setBacktestForm] = useState({
    name: "",
    from: "",
    to: "",
    timeframe: "1M",
    notification: ""
  });
  const [showBacktestForm, setShowBacktestForm] = useState(false);

  const handleBacktestFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setBacktestForm({ ...backtestForm, [e.target.name]: e.target.value });
  };

  const handleOpenBacktestForm = () => {
    setShowBacktestForm(true);
  };

  const handleCloseBacktestForm = () => {
    setShowBacktestForm(false);
  };

  const handleRunBacktest = async () => {
    setIsBacktestSubmitting(true);
    try {
      await apiClient.post("/bots/1/backtest", {
        name: backtestForm.name,
        from: backtestForm.from,
        to: backtestForm.to,
        timeframe: backtestForm.timeframe,
        notification: backtestForm.notification,
      });
      setShowBacktestForm(false);
      toast.success("Backtest started successfully.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start backtest");
    } finally {
      setIsBacktestSubmitting(false);
    }
  };

  // Add useEffect for auto-closing
  useEffect(() => {
    if (showBacktestAlert) {
      const timer = setTimeout(() => {
        setShowBacktestAlert(false);
        // Fetch backtest results after 5 seconds
        fetchBacktestResults();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showBacktestAlert]);

  // Function to fetch backtest results
  const fetchBacktestResults = async () => {
    if (!selectedBot) {
      toast.error("No bot selected");
      return;
    }

    setIsLoadingResults(true);
    try {
      const response = await apiClient.get<BacktestResultResponse>(
        `/bots/${selectedBot.id}/backtest-result`
      );
      
      setBacktestResults(response.data);
      setShowBacktestResults(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch backtest results");
    } finally {
      setIsLoadingResults(false);
    }
  };

  // Add useEffect for auto-closing paper trade alert
  useEffect(() => {
    if (showPaperTradeAlert) {
      const timer = setTimeout(() => {
        setShowPaperTradeAlert(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showPaperTradeAlert]);

  const handlePaperTrade = async () => {
    if (!selectedBot) {
      toast.error("No bot selected");
      return;
    }

    setIsPaperTrading(true);
    try {
      const response = await apiClient.post<PaperTradeResponse>(
        `/bots/${selectedBot.id}/paper/start`
      );
      setPaperTradeMessage(response.data.message);
      setShowPaperTradeAlert(true);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to start paper trading"
      );
    } finally {
      setIsPaperTrading(false);
    }
  };

  const [showLiveMarketDialog, setShowLiveMarketDialog] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg flex justify-between items-center">
              <span>Confirm Trade Settings</span>
              <button onClick={onClose} className="text-lg font-bold"></button>
            </DialogTitle>
          </DialogHeader>

          <div className="p-4">
            {/* Account Details Section */}
            <div className="mb-4">
              <h3 className="font-bold text-sm mb-2">Account Details</h3>
              <div className="grid grid-cols-3 gap-y-2">
                <div className="text-sm">API Connection:</div>
                <div className="text-sm col-span-2 capitalize">
                  {selectedApi}
                </div>
              </div>
            </div>

            {/* Bot Details Section */}
            {selectedBot && (
              <div className="mb-4">
                <h3 className="font-bold text-sm mb-2">Bot Details</h3>
                <div className="grid grid-cols-3 gap-y-2">
                  <div className="text-sm">Name:</div>
                  <div className="text-sm col-span-2">{selectedBot.name}</div>

                  <div className="text-sm">Mode:</div>
                  <div className="text-sm col-span-2 capitalize">
                    {selectedBot.mode}
                  </div>

                  <div className="text-sm">Execution Type:</div>
                  <div className="text-sm col-span-2 capitalize">
                    {selectedBot.execution_type}
                  </div>

                  <div className="text-sm">Created:</div>
                  <div className="text-sm col-span-2">
                    {format(new Date(selectedBot.created_at), "dd MMM yyyy HH:mm")}
                  </div>

                  <div className="text-sm">Last Updated:</div>
                  <div className="text-sm col-span-2">
                    {format(new Date(selectedBot.updated_at), "dd MMM yyyy HH:mm")}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings Section */}
            <div className="mb-4">
              <h3 className="font-bold text-sm mb-2">Advanced Settings</h3>
              <div className="grid grid-cols-3 gap-y-2">
                <div className="text-sm">Trading Pair:</div>
                <div className="text-sm col-span-2">BTC/USDT</div>
                <div className="text-sm">Time Frame:</div>
                <div className="text-sm col-span-2">1 Hour</div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center mb-4">
              <Checkbox id="terms" className="mr-2" />
              <label htmlFor="terms" className="text-xs select-none">
                I Agree Bulltrak's Terms & Conditions, Privacy policy and disclaimers
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-2">
              <Button
                className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold shadow-md transition-colors duration-200"
                onClick={() => setShowLiveMarketDialog(true)}
              >
                Live Market
              </Button>
              <Button
                className="flex-1 bg-[#7C2222] hover:bg-[#a83232] text-white font-semibold shadow-md transition-colors duration-200"
                onClick={() => { /* TODO: Implement Edit handler */ }}
              >
                Edit
              </Button>
              <Button
                onClick={handlePaperTrade}
                disabled={isPaperTrading}
                className="flex-1 bg-[#4A1C24] hover:bg-[#5A2525] text-white font-semibold shadow-md transition-colors duration-200"
              >
                {isPaperTrading ? "Starting..." : "Paper Trade"}
              </Button>
              <Button
                onClick={handleOpenBacktestForm}
                disabled={isBacktesting}
                className="flex-1 bg-[#FBBF24] hover:bg-[#F59E42] text-white font-semibold shadow-md transition-colors duration-200"
              >
                {isBacktesting ? "Running..." : "Backtest"}
              </Button>
            </div>
            <div className="text-xs text-center text-muted-foreground mt-2">
              ** For Buttons see respective user **
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backtest Alert Dialog */}
      <AlertDialog open={showBacktestAlert} onOpenChange={setShowBacktestAlert}>
        <AlertDialogContent className="bg-card dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle>Backtest Started</AlertDialogTitle>
            <AlertDialogDescription>
              Your backtest is now running. This may take a few minutes to complete.
              You will be notified when the results are ready.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Paper Trade Alert Dialog */}
      <AlertDialog open={showPaperTradeAlert} onOpenChange={setShowPaperTradeAlert}>
        <AlertDialogContent className="bg-card dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle>Paper Trading Started</AlertDialogTitle>
            <AlertDialogDescription>
              {paperTradeMessage || "Paper trading has been started successfully."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Backtest Results Dialog */}
      <AlertDialog open={showBacktestResults} onOpenChange={setShowBacktestResults}>
        <AlertDialogContent className="bg-card dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle>Backtest Results</AlertDialogTitle>
            <AlertDialogDescription>
              {isLoadingResults ? (
                <div className="text-center py-4">Loading results...</div>
              ) : backtestResults ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Result:</strong> {backtestResults.result}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">No results available</div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Backtest Form Dialog */}
      <Dialog open={showBacktestForm} onOpenChange={setShowBacktestForm}>
        <DialogContent className="max-w-[600px] p-8 bg-white dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold mb-4">Backtest Values</DialogTitle>
          </DialogHeader>
          <form className="grid grid-cols-3 gap-4">
            {/* First row: Backtest Name, From, To */}
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Backtest Name *</label>
              <Input
                name="name"
                placeholder="Enter Name"
                value={backtestForm.name}
                onChange={handleBacktestFormChange}
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">From *</label>
              <Input
                name="from"
                type="date"
                placeholder="DD/MM/YYYY"
                value={backtestForm.from}
                onChange={handleBacktestFormChange}
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">To *</label>
              <Input
                name="to"
                type="date"
                placeholder="DD/MM/YYYY"
                value={backtestForm.to}
                onChange={handleBacktestFormChange}
                required
              />
            </div>
            {/* Second row: Time Frame, Notification Type */}
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Time Frame</label>
              <Select value={backtestForm.timeframe} onValueChange={val => setBacktestForm(f => ({ ...f, timeframe: val }))}>
                <SelectTrigger className="w-full border rounded px-3 py-2 bg-background text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1M">1M</SelectItem>
                  <SelectItem value="1W">1W</SelectItem>
                  <SelectItem value="1D">1D</SelectItem>
                  <SelectItem value="4H">4H</SelectItem>
                  <SelectItem value="1H">1H</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Notification Type</label>
              <Input
                name="notification"
                placeholder="Enter Pass Phrase"
                value={backtestForm.notification}
                onChange={handleBacktestFormChange}
              />
            </div>
            {/* Buttons row: centered below */}
            <div className="col-span-3 flex justify-center gap-4 mt-6">
              <Button
                type="button"
                className="bg-[#4A1C24] hover:bg-[#2d1016] text-white px-8 py-2 rounded shadow"
                onClick={handleRunBacktest}
                disabled={isBacktestSubmitting}
              >
                {isBacktestSubmitting ? "Running..." : "Run Backtest"}
              </Button>
              <Button
                type="button"
                className="bg-[#FBBF24] hover:bg-[#F59E42] text-white px-8 py-2 rounded shadow"
                onClick={handleCloseBacktestForm}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Live Market Confirmation Dialog */}
      <Dialog open={showLiveMarketDialog} onOpenChange={setShowLiveMarketDialog}>
        <DialogContent className="max-w-[400px] p-6 text-center bg-white dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300">
          {/* <button
            className="absolute top-4 right-4 text-2xl font-bold"
            onClick={() => setShowLiveMarketDialog(false)}
            aria-label="Close"
          >
            ×
          </button> */}
          <div className="mb-6 mt-2 text-base font-medium">
            The Strategy Bot lorem ipsum run lorem ipsum dolor sot
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              className="bg-[#4A1C24] hover:bg-[#2d1016] text-white px-6 py-2 rounded"
              onClick={() => {/* TODO: Navigate to dashboard */}}
            >
              Goto Dashboard
            </Button>
            <Button
              className="bg-[#FBBF24] hover:bg-[#F59E42] text-white px-6 py-2 rounded"
              onClick={() => setShowLiveMarketDialog(false)}
            >
              Create Another
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}