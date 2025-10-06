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
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

// Update TradeConfirmationDialogProps interface:
interface TradeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApi: string;
  selectedBot: Bot | null;
  strategyType?: StrategyType;
  strategyId?: string; // ✅ Add this prop
}

// Updated interfaces for different strategy backtest requests
interface GrowthDCABacktestRequest {
  start_date: string;
  end_date: string;
  initial_balance: number;
  simulation_speed: string;
}

interface HumanGridBacktestRequest {
  start_date: string;
  end_date: string;
  initial_balance: number;
  test_mode: string;
}

interface SmartGridBacktestRequest {
  start_date: string;
  end_date: string;
  initial_balance: number;
  grid_levels: number;
}

interface IndyLESIBacktestRequest {
  start_date: string;
  end_date: string;
  initial_balance: number;
  simulation_speed: string;
}

// ✅ Added interfaces for paper trading requests
interface GrowthDCAPaperTradeRequest {
  initial_balance: number;
  notification_settings: {
    trade_executed: boolean;
    daily_summary: boolean;
  };
}

interface HumanGridPaperTradeRequest {
  initial_balance: number;
  notification_enabled: boolean;
}

interface SmartGridPaperTradeRequest {
  initial_balance: number;
}

interface IndyLESIPaperTradeRequest {
  initial_balance: number;
  notification_settings: {
    trade_executed: boolean;
    daily_summary: boolean;
  };
}

// ✅ Added interfaces for live market requests
// interface LiveMarketRequest {
  // Live market requests typically don't need additional parameters
  // The strategy configuration is already stored when the strategy is created
// }

// Union types
type BacktestRequest = GrowthDCABacktestRequest | HumanGridBacktestRequest | SmartGridBacktestRequest | IndyLESIBacktestRequest;
type PaperTradeRequest = GrowthDCAPaperTradeRequest | HumanGridPaperTradeRequest | SmartGridPaperTradeRequest | IndyLESIPaperTradeRequest;

// Add this interface for the backtest results
interface BacktestResultResponse {
  result: string;
}

// Add this interface for the paper trade response
interface PaperTradeResponse {
  message: string;
}

// ✅ Added interface for live market response
interface LiveMarketResponse {
  message: string;
  bot_id?: string;
  status?: string;
}

// Strategy types enum
export enum StrategyType {
  GROWTH_DCA = 'growth-dca',
  HUMAN_GRID = 'human-grid',
  SMART_GRID = 'smart-grid',
  INDY_LESI = 'indy-lesi',
  INDY_TREND = 'indy-trend',
  INDY_UTC = 'indy-utc',
  PRICE_ACTION = 'price-action'
}

export function TradeConfirmationDialog({
  isOpen,
  onClose,
  selectedApi,
  selectedBot,
  strategyType: propStrategyType,
  strategyId,
}: TradeConfirmationDialogProps) {
  const [isBacktesting] = useState(false);
  const [showBacktestAlert, setShowBacktestAlert] = useState(false);
  const [isPaperTrading, setIsPaperTrading] = useState(false);
  const [showPaperTradeAlert, setShowPaperTradeAlert] = useState(false);
  const [paperTradeMessage, setPaperTradeMessage] = useState<string>("");
  
  // ✅ Added live market states
  const [isLiveTrading, setIsLiveTrading] = useState(false);
  const [showLiveMarketAlert, setShowLiveMarketAlert] = useState(false);
  const [liveMarketMessage, setLiveMarketMessage] = useState<string>("");
  
  // New state for backtest results
  const [backtestResults, setBacktestResults] = useState<BacktestResultResponse | null>(null);
  const [showBacktestResults, setShowBacktestResults] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isBacktestSubmitting, setIsBacktestSubmitting] = useState(false);

  // ✅ Added paper trading form state
  const [showPaperTradeForm, setShowPaperTradeForm] = useState(false);
  const [paperTradeForm, setPaperTradeForm] = useState({
    initial_balance: 10000,
    // Growth DCA & INDY LESI specific
    trade_executed: true,
    daily_summary: true,
    // Human Grid specific
    notification_enabled: true,
  });

  // Updated backtest form state to handle all strategy types
  const [backtestForm, setBacktestForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    initial_balance: 10000,
    // Growth DCA specific
    simulation_speed: "normal",
    // Human Grid specific
    test_mode: "full",
    // Smart Grid specific
    grid_levels: 20
  });
  const [showBacktestForm, setShowBacktestForm] = useState(false);

  // Strategy type detection with fallback to prop
  const getStrategyType = (bot: Bot | null): StrategyType => {
    if (propStrategyType) {
      return propStrategyType;
    }

    if (!bot) return StrategyType.GROWTH_DCA;
    
    const botName = bot.name?.toLowerCase() || '';
    const botMode = bot.mode?.toLowerCase() || '';
    
    if (botName.includes('human-grid') || botMode.includes('human-grid')) {
      return StrategyType.HUMAN_GRID;
    } else if (botName.includes('smart-grid') || botMode.includes('smart-grid')) {
      return StrategyType.SMART_GRID;
    } else if (botName.includes('indy-lesi') || botMode.includes('indy-lesi')) {
      return StrategyType.INDY_LESI;
    } else if (botName.includes('indy-trend') || botMode.includes('indy-trend')) {
      return StrategyType.INDY_TREND;
    } else if (botName.includes('indy-utc') || botMode.includes('indy-utc')) {
      return StrategyType.INDY_UTC;
    } else if (botName.includes('price-action') || botMode.includes('price-action')) {
      return StrategyType.PRICE_ACTION;
    } else {
      return StrategyType.GROWTH_DCA;
    }
  };

  const handleBacktestFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBacktestForm({ 
      ...backtestForm, 
      [name]: name === 'initial_balance' || name === 'grid_levels' ? Number(value) : value 
    });
  };

  // ✅ Added paper trade form change handler
  const handlePaperTradeFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPaperTradeForm({ 
      ...paperTradeForm, 
      [name]: type === 'checkbox' ? checked : (name === 'initial_balance' ? Number(value) : value)
    });
  };

  const handleOpenBacktestForm = () => {
    setShowBacktestForm(true);
  };

  const handleCloseBacktestForm = () => {
    setShowBacktestForm(false);
  };

  // ✅ Added paper trade form handlers
  const handleOpenPaperTradeForm = () => {
    setShowPaperTradeForm(true);
  };

  const handleClosePaperTradeForm = () => {
    setShowPaperTradeForm(false);
  };

  const buildBacktestRequest = (strategyType: StrategyType): BacktestRequest => {
    const baseData = {
      start_date: backtestForm.start_date,
      end_date: backtestForm.end_date,
      initial_balance: backtestForm.initial_balance,
    };

    switch (strategyType) {
      case StrategyType.GROWTH_DCA:
        return {
          ...baseData,
          simulation_speed: backtestForm.simulation_speed,
        } as GrowthDCABacktestRequest;

      case StrategyType.HUMAN_GRID:
        return {
          ...baseData,
          test_mode: backtestForm.test_mode,
        } as HumanGridBacktestRequest;

      case StrategyType.SMART_GRID:
        return {
          ...baseData,
          grid_levels: backtestForm.grid_levels,
        } as SmartGridBacktestRequest;

      case StrategyType.INDY_LESI:
        return {
          ...baseData,
          simulation_speed: backtestForm.simulation_speed,
        } as IndyLESIBacktestRequest;

      default:
        return {
          ...baseData,
          simulation_speed: backtestForm.simulation_speed,
        } as GrowthDCABacktestRequest;
    }
  };

  // ✅ Added paper trade request builder
  const buildPaperTradeRequest = (strategyType: StrategyType): PaperTradeRequest => {
    const baseBalance = paperTradeForm.initial_balance;

    switch (strategyType) {
      case StrategyType.GROWTH_DCA:
      case StrategyType.INDY_LESI:
        return {
          initial_balance: baseBalance,
          notification_settings: {
            trade_executed: paperTradeForm.trade_executed,
            daily_summary: paperTradeForm.daily_summary,
          },
        } as GrowthDCAPaperTradeRequest;

      case StrategyType.HUMAN_GRID:
        return {
          initial_balance: baseBalance,
          notification_enabled: paperTradeForm.notification_enabled,
        } as HumanGridPaperTradeRequest;

      case StrategyType.SMART_GRID:
        return {
          initial_balance: baseBalance,
        } as SmartGridPaperTradeRequest;

      default:
        return {
          initial_balance: baseBalance,
          notification_settings: {
            trade_executed: paperTradeForm.trade_executed,
            daily_summary: paperTradeForm.daily_summary,
          },
        } as GrowthDCAPaperTradeRequest;
    }
  };

const getBacktestEndpoint = (strategyType: StrategyType, strategyId?: string, botId?: string): string => {
  const id = strategyId || botId || '1';
  
  switch (strategyType) {
    case StrategyType.GROWTH_DCA:
      return `/growth-dca/${id}/backtest`;
    case StrategyType.HUMAN_GRID:
      return `/human-grid/${id}/backtest`;
    case StrategyType.SMART_GRID:
      return `/smart-grid/${id}/backtest`;
    case StrategyType.INDY_LESI:
      return `/indy-lesi/${id}/backtest`;
    case StrategyType.INDY_TREND:
      return `/indy-trend/${id}/backtest`;
    case StrategyType.INDY_UTC:
      return `/indy-utc/${id}/backtest`;
    case StrategyType.PRICE_ACTION:
      return `/price-action/${id}/backtest`;
    default:
      return `/growth-dca/${id}/backtest`;
  }
};

  // ✅ Added paper trade endpoint function
  const getPaperTradeEndpoint = (strategyType: StrategyType, botId?: string): string => {
    const id = botId || '1';
    
    switch (strategyType) {
      case StrategyType.GROWTH_DCA:
        return `/growth-dca/52/paper/start`;
      case StrategyType.HUMAN_GRID:
        return `/human-grid/56/paper/start`;
      case StrategyType.SMART_GRID:
        return `/smart-grid/57/paper/start`;
      case StrategyType.INDY_LESI:
        return `/indy-lesi/58/paper/start`;
      case StrategyType.INDY_TREND:
        return `/indy-trend/59/paper/start`;
      case StrategyType.INDY_UTC:
        return `/indy-utc/${id}/paper/start`;
      case StrategyType.PRICE_ACTION:
        return `/price-action/${id}/paper/start`;
      default:
        return `/growth-dca/${id}/paper/start`;
    }
  };

  // ✅ Added live market endpoint function
// ✅ Updated live market endpoint function to prioritize strategyId
const getLiveMarketEndpoint = (strategyType: StrategyType, strategyId?: string, botId?: string): string => {
  // Use strategyId if available, otherwise fall back to botId or default
  const id = strategyId || botId || '1';
  
  switch (strategyType) {
    case StrategyType.GROWTH_DCA:
      return `/api/v1/growth-dca/${id}/start`;
    case StrategyType.HUMAN_GRID:
      return `/api/v1/human-grid/${id}/start`;
    case StrategyType.SMART_GRID:
      return `/api/v1/smart-grid/${id}/start`;
    case StrategyType.INDY_LESI:
      return `/api/v1/indy-lesi/${id}/start`;
    case StrategyType.INDY_TREND:
      return `/api/v1/indy-trend/${id}/start`;
    case StrategyType.INDY_UTC:
      return `/api/v1/indy-utc/${id}/start`;
    case StrategyType.PRICE_ACTION:
      return `/api/v1/price-action/${id}/start`;
    default:
      return `/api/v1/growth-dca/${id}/start`;
  }
};

  // ✅ Fixed: Improved backtest handler
const handleRunBacktest = async () => {
  console.log('🚀 handleRunBacktest called');

  if (!selectedApi) {
    toast.error("Please select an API connection");
    return;
  }

  if (!backtestForm.start_date || !backtestForm.end_date || !backtestForm.initial_balance || !backtestForm.name) {
    toast.error("Please fill in all required fields");
    return;
  }

  if (new Date(backtestForm.start_date) >= new Date(backtestForm.end_date)) {
    toast.error("End date must be after start date");
    return;
  }

  const strategyType = getStrategyType(selectedBot);
  
  setIsBacktestSubmitting(true);
  try {
    const backtestData = buildBacktestRequest(strategyType);
    const endpoint = getBacktestEndpoint(
      strategyType, 
      strategyId, 
      selectedBot?.id ? String(selectedBot.id) : undefined
    );

    console.log('Strategy Type:', strategyType);
    console.log('Strategy ID:', strategyId);
    console.log('Sending backtest request:', backtestData);
    console.log('Endpoint:', endpoint);

    const response = await apiClient.post(endpoint, backtestData);
    
    console.log('Backtest response:', response.data);
    
    setShowBacktestForm(false);
    setShowBacktestAlert(true);
    toast.success("Backtest started successfully.");
  } catch (error: any) {
    console.error('Backtest error:', error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to start backtest";
    toast.error(errorMessage);
  } finally {
    setIsBacktestSubmitting(false);
  }
};

  // ✅ Updated paper trade handler with strategy-specific logic
  const handleRunPaperTrade = async () => {
    console.log('🚀 handleRunPaperTrade called');

    if (!selectedApi) {
      toast.error("Please select an API connection");
      return;
    }

    if (!paperTradeForm.initial_balance) {
      toast.error("Please enter initial balance");
      return;
    }

    const strategyType = getStrategyType(selectedBot);
    
    setIsPaperTrading(true);
    try {
      const paperTradeData = buildPaperTradeRequest(strategyType);
      const endpoint = getPaperTradeEndpoint(strategyType, selectedBot?.id ? String(selectedBot.id) : undefined);

      console.log('Strategy Type:', strategyType);
      console.log('Sending paper trade request:', paperTradeData);
      console.log('Endpoint:', endpoint);

      const response = await apiClient.post<PaperTradeResponse>(endpoint, paperTradeData);
      
      console.log('Paper trade response:', response.data);
      
      setPaperTradeMessage(response.data.message);
      setShowPaperTradeForm(false);
      setShowPaperTradeAlert(true);
      toast.success("Paper trading started successfully.");
    } catch (error: any) {
      console.error('Paper trade error:', error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to start paper trading";
      toast.error(errorMessage);
    } finally {
      setIsPaperTrading(false);
    }
  };

  // ✅ Added live market handler
  const handleRunLiveMarket = async () => {
    console.log('🚀 handleRunLiveMarket called');

    if (!selectedApi) {
      toast.error("Please select an API connection");
      return;
    }

    const strategyType = getStrategyType(selectedBot);
    
    setIsLiveTrading(true);
    try {
       const endpoint = getLiveMarketEndpoint(
      strategyType, 
      strategyId, // Use the strategyId from props
      selectedBot?.id ? String(selectedBot.id) : undefined
    );

    console.log('Strategy Type:', strategyType);
    console.log('Strategy ID:', strategyId);
    console.log('Bot ID:', selectedBot?.id);
    console.log('Starting live market trading');
    console.log('Endpoint:', endpoint);

      // Live market typically doesn't need additional request body
      // The strategy configuration is already stored when the strategy was created
    const response = await apiClient.post<LiveMarketResponse>(endpoint, {});
    
    console.log('Live market response:', response.data);
    
    setLiveMarketMessage(response.data.message || "Live market trading started successfully!");
    setShowLiveMarketAlert(true);
    toast.success("Live market trading started successfully!");
  } catch (error: any) {
    console.error('Live market error:', error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to start live market trading";
    toast.error(errorMessage);
  } finally {
    setIsLiveTrading(false);
  }
};

  // Legacy paper trade handler for the main dialog button
  const handlePaperTrade = async () => {
    handleOpenPaperTradeForm();
  };

  const renderStrategySpecificFields = () => {
    const strategyType = getStrategyType(selectedBot);

    switch (strategyType) {
      case StrategyType.GROWTH_DCA:
      case StrategyType.INDY_LESI:
        return (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Simulation Speed</label>
            <Select 
              value={backtestForm.simulation_speed} 
              onValueChange={val => setBacktestForm(f => ({ ...f, simulation_speed: val }))}
            >
              <SelectTrigger className="w-full border rounded px-3 py-2 bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="turbo">Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case StrategyType.HUMAN_GRID:
        return (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Test Mode</label>
            <Select 
              value={backtestForm.test_mode} 
              onValueChange={val => setBacktestForm(f => ({ ...f, test_mode: val }))}
            >
              <SelectTrigger className="w-full border rounded px-3 py-2 bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quick">Quick</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="comprehensive">Comprehensive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case StrategyType.SMART_GRID:
        return (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Grid Levels</label>
            <Input
              name="grid_levels"
              type="number"
              placeholder="20"
              value={backtestForm.grid_levels}
              onChange={handleBacktestFormChange}
              required
              min="1"
              max="100"
              step="1"
            />
          </div>
        );

      default:
        return (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Simulation Speed</label>
            <Select 
              value={backtestForm.simulation_speed} 
              onValueChange={val => setBacktestForm(f => ({ ...f, simulation_speed: val }))}
            >
              <SelectTrigger className="w-full border rounded px-3 py-2 bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slow">Slow</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="turbo">Turbo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
    }
  };

  // ✅ Added paper trade specific fields renderer
  const renderPaperTradeSpecificFields = () => {
    const strategyType = getStrategyType(selectedBot);

    switch (strategyType) {
      case StrategyType.GROWTH_DCA:
      case StrategyType.INDY_LESI:
        return (
          <div className="col-span-2 space-y-3">
            <label className="block text-sm font-medium mb-2">Notification Settings</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trade_executed"
                name="trade_executed"
                checked={paperTradeForm.trade_executed}
                onChange={handlePaperTradeFormChange}
                className="rounded"
              />
              <label htmlFor="trade_executed" className="text-sm">Trade Executed Notifications</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="daily_summary"
                name="daily_summary"
                checked={paperTradeForm.daily_summary}
                onChange={handlePaperTradeFormChange}
                className="rounded"
              />
              <label htmlFor="daily_summary" className="text-sm">Daily Summary Notifications</label>
            </div>
          </div>
        );

      case StrategyType.HUMAN_GRID:
        return (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">Notification Settings</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notification_enabled"
                name="notification_enabled"
                checked={paperTradeForm.notification_enabled}
                onChange={handlePaperTradeFormChange}
                className="rounded"
              />
              <label htmlFor="notification_enabled" className="text-sm">Enable Notifications</label>
            </div>
          </div>
        );

      case StrategyType.SMART_GRID:
        return (
          <div className="col-span-2">
            <p className="text-sm text-gray-600">No additional settings required for Smart Grid paper trading.</p>
          </div>
        );

      default:
        return (
          <div className="col-span-2 space-y-3">
            <label className="block text-sm font-medium mb-2">Notification Settings</label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trade_executed"
                name="trade_executed"
                checked={paperTradeForm.trade_executed}
                onChange={handlePaperTradeFormChange}
                className="rounded"
              />
              <label htmlFor="trade_executed" className="text-sm">Trade Executed Notifications</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="daily_summary"
                name="daily_summary"
                checked={paperTradeForm.daily_summary}
                onChange={handlePaperTradeFormChange}
                className="rounded"
              />
              <label htmlFor="daily_summary" className="text-sm">Daily Summary Notifications</label>
            </div>
          </div>
        );
    }
  };

  const getStrategyDisplayName = () => {
    const strategyType = getStrategyType(selectedBot);
    switch (strategyType) {
      case StrategyType.GROWTH_DCA:
        return "Growth DCA";
      case StrategyType.HUMAN_GRID:
        return "Human Grid";
      case StrategyType.SMART_GRID:
        return "Smart Grid";
      case StrategyType.INDY_LESI:
        return "Indie LESI";
      case StrategyType.INDY_TREND:
        return "Indie Trend";
      case StrategyType.INDY_UTC:
        return "Indie UTC";
      case StrategyType.PRICE_ACTION:
        return "Price Action";
      default:
        return "";
    }
  };

  // useEffect for auto-closing alerts
  useEffect(() => {
    if (showBacktestAlert) {
      const timer = setTimeout(() => {
        setShowBacktestAlert(false);
        fetchBacktestResults();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showBacktestAlert]);

  useEffect(() => {
    if (showPaperTradeAlert) {
      const timer = setTimeout(() => {
        setShowPaperTradeAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPaperTradeAlert]);

  // ✅ Added useEffect for live market alert auto-close
  useEffect(() => {
    if (showLiveMarketAlert) {
      const timer = setTimeout(() => {
        setShowLiveMarketAlert(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showLiveMarketAlert]);

  // Function to fetch backtest results
  const fetchBacktestResults = async () => {
    if (!selectedBot) {
      toast.error("No bot selected for results");
      return;
    }

    setIsLoadingResults(true);
    try {
      const response = await apiClient.get<BacktestResultResponse>(
        `/bots/${String(selectedBot.id)}/backtest-result`
      );
      
      setBacktestResults(response.data);
      setShowBacktestResults(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch backtest results");
    } finally {
      setIsLoadingResults(false);
    }
  };

  // const [showLiveMarketDialog, setShowLiveMarketDialog] = useState(false);

  return (
    <>
      {/* Main Trade Confirmation Dialog */}
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

                  <div className="text-sm">Strategy Type:</div>
                  <div className="text-sm col-span-2 capitalize">
                    {getStrategyType(selectedBot).replace('-', ' ')}
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

            {/* Strategy Info Section */}
            {!selectedBot && propStrategyType && (
              <div className="mb-4">
                <h3 className="font-bold text-sm mb-2">Strategy Details</h3>
                <div className="grid grid-cols-3 gap-y-2">
                  <div className="text-sm">Strategy Type:</div>
                  <div className="text-sm col-span-2 capitalize">
                    {propStrategyType.replace('-', ' ')}
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
              {/* ✅ Updated Live Market button to call the API */}
              <Button
                className="flex-1 bg-green-700 hover:bg-green-800 text-white font-semibold shadow-md transition-colors duration-200"
                onClick={handleRunLiveMarket}
                disabled={isLiveTrading}
              >
                {isLiveTrading ? "Starting..." : "Live Market"}
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

      {/* Backtest Form Dialog */}
      <Dialog open={showBacktestForm} onOpenChange={setShowBacktestForm}>
        <DialogContent className="max-w-[600px] p-8 bg-white dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold mb-4">
              {getStrategyDisplayName()} Backtest
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <Input
                name="start_date"
                type="date"
                placeholder="YYYY-MM-DD"
                value={backtestForm.start_date}
                onChange={handleBacktestFormChange}
                required
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">End Date *</label>
              <Input
                name="end_date"
                type="date"
                placeholder="YYYY-MM-DD"
                value={backtestForm.end_date}
                onChange={handleBacktestFormChange}
                required
              />
            </div>
            
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Initial Balance *</label>
              <Input
                name="initial_balance"
                type="number"
                placeholder="10000"
                value={backtestForm.initial_balance}
                onChange={handleBacktestFormChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            
            {renderStrategySpecificFields()}
            
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
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Paper Trade Form Dialog */}
      <Dialog open={showPaperTradeForm} onOpenChange={setShowPaperTradeForm}>
        <DialogContent className="max-w-[600px] p-8 bg-white dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold mb-4">
              {getStrategyDisplayName()} Paper Trading
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Initial Balance *</label>
              <Input
                name="initial_balance"
                type="number"
                placeholder="10000"
                value={paperTradeForm.initial_balance}
                onChange={handlePaperTradeFormChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            
            {renderPaperTradeSpecificFields()}
            
            <div className="col-span-3 flex justify-center gap-4 mt-6">
              <Button
                type="button"
                className="bg-[#4A1C24] hover:bg-[#2d1016] text-white px-8 py-2 rounded shadow"
                onClick={handleRunPaperTrade}
                disabled={isPaperTrading}
              >
                {isPaperTrading ? "Starting..." : "Start Paper Trading"}
              </Button>
              <Button
                type="button"
                className="bg-[#FBBF24] hover:bg-[#F59E42] text-white px-8 py-2 rounded shadow"
                onClick={handleClosePaperTradeForm}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Existing Alert Dialogs */}
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

      {/* ✅ Added Live Market Success Alert Dialog */}
      <AlertDialog open={showLiveMarketAlert} onOpenChange={setShowLiveMarketAlert}>
        <AlertDialogContent className="bg-card bg-white dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-600 dark:text-green-400">
              🚀 Live Trading Started Successfully!
            </AlertDialogTitle>
            <AlertDialogDescription>
              {liveMarketMessage || "Your strategy is now running in live market conditions. Monitor your trades in the dashboard."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setShowLiveMarketAlert(false);
                // TODO: Navigate to dashboard
                window.location.href = '/dashboard';
              }}
            >
              Go to Dashboard
            </AlertDialogAction>
            <AlertDialogCancel>Stay Here</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* Removed the old Live Market Dialog since we now have the Alert Dialog */}
    </>
  );
}