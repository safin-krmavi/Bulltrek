import ShareCard from "@/components/dashboard/share-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import  ApiConnect  from "../components/dashboard/ApiConnect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssets } from "@/hooks/useAsset";
import { useBrokerageManagement } from "@/hooks/useBrokerages";
import { useDirections } from "@/hooks/useDirection";
import { useIndicators } from "@/hooks/useIndicator";
import { useIndicatorActions } from "@/hooks/useIndicatorAction";
import { useQuantities } from "@/hooks/useQuantity";
import { useTradeMappings } from "@/hooks/useTradeMapping";
import { useIndicatorValues } from "@/hooks/useValue";
import { useBotManagement } from "@/hooks/useBotManagement";
import { useStrategy } from "@/hooks/useStrategy";
import { STRATEGY_KEYWORDS } from "../strategyKeywords";
import {
  ChevronDown,
  MessageSquare,
  MoreVertical,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import apiClient from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CollapsibleCard } from "@/components/collapsible-card";
// import StrategyBuilder from '@/components/strategy/StrategyBuilder'
// import { Logo } from "@/components/ui/logo";
import LoadingLogo from "@/components/ui/LoadingLogo";
import { PromotionalBanner } from "@/components/ui/promotional-banner";

interface ScannerData {
  name: string;
  dateTime: string;
  pairs: string;
  status: "Active" | "Closed";
}

interface SupportTicketData {
  number: string;
  createdOn: string;
  status: "Resolved" | "In Progress";
}

interface PlanData {
  name: string;
  duration: string;
  renewalDate: string;
}

// interface LiveOrder {
//   symbol: string;
//   orderId: number;
//   orderListId: number;
//   clientOrderId: string;
//   price: string;
//   origQty: string;
//   executedQty: string;
//   cummulativeQuoteQty: string;
//   status: string;
//   timeInForce: string;
//   type: string;
//   side: string;
//   stopPrice: string;
//   icebergQty: string;
//   time: number;
//   updateTime: number;
//   isWorking: boolean;
//   workingTime: number;
//   origQuoteOrderQty: string;
//   selfTradePreventionMode: string;
// }

interface StrategyDataItem {
  id: number;
  broker: string;
  api: string;
  strategy: string;
  assetSymbol: string;
  quantity: number;
  direction: string;
  runTime: string;
  availableInvestment: number;
  frozenInvestment: number;
  unrealizedPL: number;
  netPL: number;
  netPLPercentage: number;
  tradesExecuted: number;
  status: "Active" | "Inactive";
  botName: string;
  botMode: string;
  botExecutionType: string;
}

function useStrategies() {
  return useQuery({
    queryKey: ["strategies"],
    queryFn: async () => {
      const response = await apiClient.get("/strategies");
      return response.data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// function useLiveOrders() {
//   return useQuery({
//     queryKey: ["liveOrders"],
//     queryFn: async () => {
//       const response = await apiClient.get(
//         "/api/v1/brokerage/binance/orders/live",
//         {
//           params: {
//             symbol: "BTCUSDT",
//           },
//         }
//       );
//       return response.data;
//     },
//     refetchInterval: 30000, // Refetch every 30 seconds
//   });
// }

export default function Dashboard({ userId }: { userId?: string }) {
  const [showModal, setShowModal] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(true); // Demo banner state
  const [openSections, setOpenSections] = useState({
    strategy: true,
    scanner: true,
    api: true,
    support: true,
    plan: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  // const [strategyTablePage] = useState(1);
  const strategiesPerPage = 4;

  // Add this state to track which menu is open
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ x: number; y: number } | null>(null);

  const { data: profileData } = useUserProfile();
  const userData = profileData?.data;

  // API Data Hooks
  const {
    isLoading: isMappingsLoading,
    error: mappingsError,
  } = useTradeMappings();
  const {
    isLoading: isIndicatorsLoading,
    error: indicatorsError,
  } = useIndicators();
  const {
    isLoading: isActionsLoading,
    error: actionsError,
  } = useIndicatorActions();
  const {
    isLoading: isAssetsLoading,
    error: assetsError,
    assets
  } = useAssets();
  const {
    isLoading: isValuesLoading,
    error: valuesError,
    values: indicatorValues
  } = useIndicatorValues();
  const {
    isLoading: isQuantitiesLoading,
    error: quantitiesError,
    quantities
  } = useQuantities();
  const {
    isLoading: isDirectionsLoading,
    error: directionsError,
  } = useDirections();
  const { getBrokerageDetails } = useBrokerageManagement();
  // const { data: liveOrders, isLoading: isLiveOrdersLoading } = useLiveOrders();
  const { bots, isLoading: isBotsLoading } = useBotManagement();
  const { updateStrategy, deleteStrategy } = useStrategy();
  // State for edit popup
  const [editPopupOpen, setEditPopupOpen] = useState(false);
  const [editStrategy, setEditStrategy] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Combined loading state
  const isLoading =
    isMappingsLoading ||
    isIndicatorsLoading ||
    isActionsLoading ||
    isAssetsLoading ||
    isValuesLoading ||
    isQuantitiesLoading ||
    isDirectionsLoading ||
    isBotsLoading;

  // Combined error state
  const error =
    mappingsError ||
    indicatorsError ||
    actionsError ||
    assetsError ||
    valuesError ||
    quantitiesError ||
    directionsError;

  // Fetch strategies
  const {
    data: strategies,
    // isLoading: isStrategiesLoading,
    // error: strategiesError,
  } = useStrategies();

  // const navigate = useNavigate();

  useEffect(() => {
    toast.dismiss();
  }, [isLoading]);

  // Add a click handler to close the menu when clicking outside
  const menuRefs = useRef<(HTMLDivElement | null)[]>([]);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openMenuIndex !== null &&
        menuRefs.current[openMenuIndex] &&
        !menuRefs.current[openMenuIndex]?.contains(event.target as Node)
      ) {
        setOpenMenuIndex(null);
        setDropdownPosition(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuIndex]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#18181b] w-full flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <LoadingLogo size={80} />
          <p className="text-muted-foreground mt-4 dark:text-white">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-[#18181b] w-full flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Error Loading Dashboard
          </h2>
          <p className="text-muted-foreground mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Transform strategies and bots into strategy data for the table
  const strategyData = (() => {
    // Debug logging
    console.log("Strategies:", strategies);
    console.log("Bots:", bots);

    // Ensure strategies and bots are arrays
    if (!Array.isArray(strategies?.data)) {
      console.error("strategies is not an array:", strategies);
      return [];
    }

    if (!Array.isArray(bots?.data)) {
      console.error("bots is not an array:", bots);
      return [];
    }

    return strategies.data
      .map((strategy: any) => {
        // Find the corresponding bot for this strategy
        const bot = bots?.data?.find((b: any) => b.strategy_id === strategy.id);
        
        if (!strategy) {
          console.error("Invalid strategy:", strategy);
          return null;
        }

        // Debug logging for strategy and bot matching
        console.log(`Strategy ${strategy.id}:`, {
          strategyName: strategy.name,
          botFound: !!bot,
          botStatus: bot?.status,
          botName: bot?.name
        });

        // Parse strategy conditions to create a readable strategy rule
        const strategyRule = (() => {
          if (strategy.conditions && Array.isArray(strategy.conditions)) {
            return strategy.conditions
              .map((condition: any, index: number) => {
                const operator = strategy.operators && strategy.operators[index - 1] ? ` ${strategy.operators[index - 1]} ` : '';
                return `${condition.indicator} ${condition.action} ${condition.value}${operator}`;
              })
              .join('');
          }
          return strategy.name || "N/A";
        })();

        // Determine strategy status based on bot status
        const getStrategyStatus = () => {
          if (!bot) {
            console.log(`Strategy ${strategy.id} has no associated bot`);
            return "Inactive" as const;
          }
          
          switch (bot.status) {
            case 'running':
              return "Active" as const;
            case 'idle':
            case 'stopped':
            default:
              return "Inactive" as const;
          }
        };

        const strategyData = {
          id: strategy.id,
          broker: "Binance", // Default to Binance as requested
          api: "REST API",
          strategy: strategyRule,
          assetSymbol: strategy.asset || "N/A",
          quantity: strategy.quantity || 0,
          direction: strategy.direction || "N/A",
          runTime: "2 Hrs",
          availableInvestment: 0, // Set to 0 instead of static value
          frozenInvestment: 0, // Set to 0 instead of static value
          unrealizedPL: 0, // Set to 0 instead of static value
          netPL: 0, // Set to 0 instead of random value
          netPLPercentage: 0, // Set to 0 instead of random value
          tradesExecuted: 0, // Set to 0 instead of static value
          status: getStrategyStatus(),
          botName: bot?.name || "N/A",
          botMode: bot?.mode || "N/A",
          botExecutionType: bot?.execution_type || "N/A",
        };

        return strategyData;
      })
      .filter((item: any): item is NonNullable<typeof item> => item !== null);
  })();

  // Use strategyData for dynamic values if available, default to 0 if no data
  const totalTradesExecuted = Array.isArray(strategyData) && strategyData.length > 0
    ? strategyData.reduce((sum, s) => sum + (s.tradesExecuted || 0), 0)
    : 0;

  const netPL = Array.isArray(strategyData) && strategyData.length > 0
    ? strategyData.reduce((sum, s) => sum + (s.netPL || 0), 0)
    : 0;

  const netPLPercentage = Array.isArray(strategyData) && strategyData.length > 0
    ? strategyData.reduce((sum, s) => sum + (s.netPLPercentage || 0), 0) / strategyData.length
    : 0;

  // Placeholder data for other sections
  // For new users, these arrays should be empty
  const scanners: ScannerData[] = [];
  const supportTickets: SupportTicketData[] = [];

  const plan: PlanData = {
    name: "Gold Membership",
    duration: "24 Months",
    renewalDate: "12 July 2024",
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof openSections],
    }));
  };

  // Pagination logic for strategy summary table
  const indexOfLastStrategy = currentPage * strategiesPerPage;
  const indexOfFirstStrategy = indexOfLastStrategy - strategiesPerPage;
  const currentStrategies = strategyData.slice(indexOfFirstStrategy, indexOfLastStrategy);
  const totalPages = Math.ceil(strategyData.length / strategiesPerPage);

  // Pagination logic for strategy table
  // const strategyTableIndexOfLast = strategyTablePage * strategiesPerPage;
  // const strategyTableIndexOfFirst = strategyTableIndexOfLast - strategiesPerPage;
  // const currentStrategyTableItems = Array.isArray(strategies?.data) 
  //   ? strategies.data.slice(strategyTableIndexOfFirst, strategyTableIndexOfLast)
  //   : [];
  // const strategyTableTotalPages = Array.isArray(strategies?.data) 
  //   ? Math.ceil(strategies.data.length / strategiesPerPage)
  //   : 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // const handleStrategyTablePageChange = (page: number) => {
  //   setStrategyTablePage(page);
  // };

  console.log("Strategies:", strategies);
  console.log("Bots:", bots);
  console.log("Strategy Data:", strategyData);
  
  // Debug summary
  console.log("=== DASHBOARD DEBUG SUMMARY ===");
  console.log("Total Strategies:", Array.isArray(strategies?.data) ? strategies.data.length : 0);
  console.log("Total Bots:", Array.isArray(bots?.data) ? bots.data.length : 0);
  console.log("Active Strategies:", strategyData.filter((s: StrategyDataItem) => s.status === "Active").length);
  console.log("Inactive Strategies:", strategyData.filter((s: StrategyDataItem) => s.status === "Inactive").length);
  console.log("Strategies without bots:", strategyData.filter((s: StrategyDataItem) => s.botName === "N/A").length);
  console.log("Total Trades Executed:", totalTradesExecuted);
  console.log("Net P/L:", netPL);
  console.log("Net P/L Percentage:", netPLPercentage);
  console.log("=================================");

  // Handler to toggle dropdown with position calculation
  const handleDropdownToggle = (index: number) => {
    if (openMenuIndex === index) {
      setOpenMenuIndex(null);
      setDropdownPosition(null);
    } else {
      const button = buttonRefs.current[index];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          x: rect.right - 128, // 128px is the width of the dropdown (w-32)
          y: rect.bottom + 4
        });
      }
      setOpenMenuIndex(index);
    }
  };

  // Handler to open edit popup
  const handleEditClick = (strategy: any) => {
    setEditStrategy({ ...strategy });
    setEditPopupOpen(true);
    setOpenMenuIndex(null);
    setDropdownPosition(null);
  };
  // Handler for edit form change
  const handleEditChange = (field: string, value: any) => {
    setEditStrategy((prev: any) => ({ ...prev, [field]: value }));
  };
  // Handler for edit form submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      await updateStrategy.mutateAsync({ id: editStrategy.id, data: {
        name: editStrategy.name,
        direction: editStrategy.direction,
        quantity: editStrategy.quantity,
        asset: editStrategy.assetSymbol,
        // Add other fields as needed
      }});
      setEditPopupOpen(false);
      toast.success("Strategy updated successfully");
    } catch (err: any) {
      // Enhanced error handling
      let errorMsg = "Update failed";
      if (err?.response) {
        errorMsg = `Error ${err.response.status}: ${err.response.data?.message || JSON.stringify(err.response.data)}`;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setEditError(errorMsg);
    }
    setEditLoading(false);
  };

  // Handler for delete with confirmation
  const handleDeleteStrategy = async (strategyId: number) => {
    if (!window.confirm('Are you sure you want to delete this strategy?')) return;
    try {
      await deleteStrategy.mutateAsync(strategyId);
      toast.success('Strategy deleted successfully');
      setOpenMenuIndex(null);
      setDropdownPosition(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#18181b] text-foreground dark:text-white w-full transition-colors duration-300">
      <main className="max-w-7xl mx-auto py-6 w-full">
        {/* Pixel-perfect Summary Section */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* Left: Greeting + Summary Cards in a white container */}
          <div className="flex-1 max-w-[calc(100%-250px)]">
            <div className="bg-white dark:bg-[#232326] rounded-xl shadow p-4 flex flex-row items-center gap-6 h-[130px]">
              {/* Greeting */}
              <div className="flex flex-col justify-center items-start min-w-[140px] pr-2 mb-2">
                <span className="font-semibold text-[16px] leading-tight text-black dark:text-white">Hi {userData?.name || "User"},</span>
                <span className="text-[15px] text-black/80 dark:text-white/80">here is your summary</span>
              </div>
              {/* Summary Cards */}
              <div className="flex flex-row gap-6 flex-1 justify-end">
                {/* Platforms Added */}
                <div className="flex flex-row items-center justify-between bg-[#FFE6EA] dark:bg-[#2d2326] rounded-lg min-w-[150px] w-[150px] min-h-[100px] h-[100px] px-4 py-3">
                  <span className="text-[15px] text-[#4A0D0D] dark:text-white text-left leading-tight">Platforms<br/>Added</span>
                  <span className="text-[22px] font-bold text-[#2D0A0A] dark:text-white text-right leading-none">{Array.isArray(getBrokerageDetails.data?.data) ? getBrokerageDetails.data.data.length : 0}</span>
                </div>
                {/* Strategies Active */}
                <div className="flex flex-row items-center justify-between bg-[#FFE6EA] dark:bg-[#2d2326] rounded-lg min-w-[150px] w-[150px] min-h-[100px] h-[100px] px-4 py-3">
                  <span className="text-[15px] text-[#4A0D0D] dark:text-white text-left leading-tight">Strategies<br/>Active</span>
                  <span className="text-[22px] font-bold text-[#2D0A0A] dark:text-white text-right leading-none">{Array.isArray(strategies?.data) ? strategies.data.length : 0}</span>
                </div>
                {/* Trades Executed */}
                <div className="flex flex-row items-center justify-between bg-[#FFE6EA] dark:bg-[#2d2326] rounded-lg min-w-[150px] w-[150px] min-h-[100px] h-[100px] px-4 py-2">
                  <span className="text-[15px] text-[#4A0D0D] dark:text-white text-left leading-tight">Trades<br/>Executed</span>
                  <span className="text-[22px] font-bold text-[#2D0A0A] dark:text-white text-right leading-none">{totalTradesExecuted}</span>
                </div>
                {/* Net P/L */}
                <div className="flex flex-row items-center justify-between bg-[#FFE6EA] dark:bg-[#2d2326] rounded-lg min-w-[150px] w-[150px] min-h-[100px] h-[100px] px-4 py-3">
                  <span className="text-[15px] text-[#4A0D0D] dark:text-white text-left leading-tight">Net<br/>P/L</span>
                  <div className="flex flex-col items-end">
                    <span className="text-[22px] font-bold text-green-600 dark:text-green-400 text-right leading-none">${netPL}</span>
                    <span className="text-[14px] font-semibold text-green-600 dark:text-green-400 text-right leading-none">+{netPLPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Referral Card */}
          <div className="flex flex-col w-full md:w-[450px] max-w-[500px] h-[130px]">
           
              <ShareCard />
          </div>
        </div>

        {/* Strategy Summary */}
        <Collapsible
          open={openSections.strategy}
          onOpenChange={() => toggleSection("strategy")}
          className="mt-6"
        >
          <Card className="border-0 dark:bg-[#232326]">
            <CardHeader className="bg-[#4A0D0D] dark:bg-[#3b3b41] text-white rounded-t-lg transition-colors duration-300 dark:text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-medium">
                    Strategy Summary
                  </CardTitle>
                  <RefreshCw className="h-4 w-4" />
                </div>
                <CollapsibleTrigger>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="p-0 overflow-visible">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <Table className="bg-card dark:bg-[#232326] text-foreground dark:text-white transition-colors duration-300 relative">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-foreground dark:text-white">Broker/Exchange</TableHead>
                          <TableHead className="text-foreground dark:text-white">Strategy Rule</TableHead>
                          <TableHead className="text-foreground dark:text-white">Asset</TableHead>
                          <TableHead className="text-foreground dark:text-white">Quantity</TableHead>
                          <TableHead className="text-foreground dark:text-white">Direction</TableHead>
                          <TableHead className="text-foreground dark:text-white">Bot</TableHead>
                          <TableHead className="text-foreground dark:text-white">Status</TableHead>
                          <TableHead className="text-foreground dark:text-white">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="relative">
                        {currentStrategies.map((strategy: any, i: number) => (
                          <TableRow key={strategy.id || i} className="border-border dark:text-white">
                            <TableCell className="text-foreground dark:text-white">{strategy.broker}</TableCell>
                            <TableCell className="text-foreground dark:text-white">{strategy.strategy}</TableCell>
                            <TableCell className="text-foreground dark:text-white">{strategy.assetSymbol}</TableCell>
                            <TableCell className="text-foreground dark:text-white">{strategy.quantity}</TableCell>
                            <TableCell className="text-foreground dark:text-white">{strategy.direction}</TableCell>
                            <TableCell className="text-foreground dark:text-white">{strategy.botName}</TableCell>
                            <TableCell className="text-foreground dark:text-white">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-2 w-2 rounded-full ${
                                    strategy.status === "Active"
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                {strategy.status}
                              </div>
                            </TableCell>
                            <TableCell className="text-foreground dark:text-white relative">
                              <Button
                                ref={el => (buttonRefs.current[i] = el)}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDropdownToggle(i)}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4 flex items-center justify-between text-sm">
                      <div>
                        {indexOfFirstStrategy + 1}-{Math.min(indexOfLastStrategy, strategyData.length)} of {strategyData.length} entries
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            className={currentPage === page ? "bg-[#4A0D0D] text-white" : ""}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Smart Scanner Summary */}
          <div>
            <Collapsible
              open={openSections.scanner}
              onOpenChange={() => toggleSection("scanner")}
            >
              <Card className="bg-card dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white transition-colors duration-300">
                <CardHeader className="bg-[#4A0D0D] dark:bg-[#3b3b41] text-white rounded-t-lg transition-colors duration-300 dark:text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-medium">
                        Smart Scanner Summary
                      </CardTitle>
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <CollapsibleTrigger>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scanner Name</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Pairs</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scanners.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-4">
                              No data available
                            </TableCell>
                          </TableRow>
                        ) : (
                          scanners.map((scanner, i) => (
                            <TableRow key={i}>
                              <TableCell>{scanner.name}</TableCell>
                              <TableCell>{scanner.dateTime}</TableCell>
                              <TableCell>{scanner.pairs}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`h-2 w-2 rounded-full ${
                                      scanner.status === "Active"
                                        ? "bg-green-500"
                                        : "bg-red-500"
                                    }`}
                                  />
                                  {scanner.status}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            <Collapsible
              open={openSections.plan}
              onOpenChange={() => toggleSection("plan")}
              className="mt-6"
            >
              <Card className="bg-card dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white transition-colors duration-300">
                <CardHeader className="bg-[#4A0D0D] dark:bg-[#3b3b41] text-white rounded-t-lg transition-colors duration-300 dark:text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-medium">
                        Plan Details
                      </CardTitle>
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <CollapsibleTrigger>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="pt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Plan Name</div>
                          <div className="font-medium">{plan.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="font-medium">{plan.duration}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">
                            Next Renewal Date
                          </div>
                          <div className="font-medium">{plan.renewalDate}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button className="bg-[#4A0D0D] hover:bg-[#3A0808] text-white">
                          Upgrade
                        </Button>
                        <Button variant="outline">Renew</Button>
                        <Button
                          variant="secondary"
                          className="bg-orange-100 text-orange-700 hover:bg-orange-200"
                        >
                          Gift Membership
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          <div className="space-y-6 ">
            <CollapsibleCard
              title="API Connect "
              className="col-span-2 "
              contentClassName="p-0"
              showInfoIcon={true}
              action={
                <Button
                  className="bg-[#FF8C00] text-white hover:bg-[#FFA500] rounded"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents toggling the card when clicking the button
                    setShowModal(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Brokers
                </Button>
              }
            >
              <ApiConnect
                userId={userId}
                showModal={showModal}
                setShowModal={setShowModal}
              />
            </CollapsibleCard>
            {/* Support Tickets */}
            <Collapsible
              open={openSections.support}
              onOpenChange={() => toggleSection("support")}
            >
              <Card className="bg-card dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white transition-colors duration-300">
                <CardHeader className="bg-[#4A0D0D] dark:bg-[#3b3b41] text-white rounded-t-lg transition-colors duration-300 dark:text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg font-medium">
                        Support Tickets
                      </CardTitle>
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <CollapsibleTrigger>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket Number</TableHead>
                          <TableHead>Created On</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supportTickets.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4">
                              No data available
                            </TableCell>
                          </TableRow>
                        ) : (
                          supportTickets.map((ticket, i) => (
                            <TableRow key={i}>
                              <TableCell>{ticket.number}</TableCell>
                              <TableCell>{ticket.createdOn}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    ticket.status === "Resolved"
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {ticket.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    <div className="p-4 text-center">
                      <Button variant="ghost" className="text-gray-500">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Give Feedback
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>
      </main>
      {/* Edit Strategy Popup */}
      {editPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleEditSubmit} className="bg-white dark:bg-[#232326] p-6 rounded-lg w-full max-w-2xl shadow-lg relative">
            <h2 className="text-xl font-semibold mb-4  dark:text-[#FF8C00]">Edit Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1  dark:text-[#FF8C00]">Name</label>
                <input type="text" className="w-full border  dark: rounded px-3 py-2 bg-white dark:bg-[#232326]  dark:text-white placeholder-gray-400 dark:placeholder-gray-500" value={editStrategy?.name || ''} onChange={e => handleEditChange('name', e.target.value)} />
              </div>
              <div>
                <label className="block mb-1  dark:text-[#FF8C00]">Direction</label>
                <select className="w-full border  dark: rounded px-3 py-2 bg-white dark:bg-[#232326] dark:text-white" value={editStrategy?.direction || ''} onChange={e => handleEditChange('direction', e.target.value)}>
                  <option value="">Select Direction</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div>
                <label className="block mb-1  dark:text-[#FF8C00]">Quantity</label>
                <select
                  className="w-full border  dark: rounded px-3 py-2 bg-white dark:bg-[#232326]  dark:text-white"
                  value={editStrategy?.quantity || ''}
                  onChange={e => handleEditChange('quantity', e.target.value)}
                  disabled={isQuantitiesLoading}
                >
                  <option value="">Select Quantity</option>
                  {(Array.isArray(quantities) ? quantities : []).map((q: any) => (
                    <option key={q.id || q.quantity} value={q.quantity}>{q.quantity}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1  dark:text-[#FF8C00]">Asset</label>
                <select
                  className="w-full border  dark: rounded px-3 py-2 bg-white dark:bg-[#232326]  dark:text-white"
                  value={editStrategy?.assetSymbol || ''}
                  onChange={e => handleEditChange('assetSymbol', e.target.value)}
                  disabled={isAssetsLoading}
                >
                  <option value="">Select Asset</option>
                  {(Array.isArray(assets) ? assets : []).map((a: any) => (
                    <option key={a.id || a.symbol || a.asset} value={a.symbol || a.asset}>{a.symbol || a.asset}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1  dark:text-[#FF8C00]">Indicator</label>
                <select className="w-full border  dark: rounded px-3 py-2 bg-white dark:bg-[#232326]  dark:text-white" value={editStrategy?.conditions?.[0]?.indicator || ''} onChange={e => {
                  const newCond = [...(editStrategy?.conditions || [])];
                  if (!newCond[0]) newCond[0] = { indicator: '', action: '', value: '' };
                  newCond[0].indicator = e.target.value;
                  setEditStrategy((prev: any) => ({ ...prev, conditions: newCond }));
                }}>
                  <option value="">Select Indicator</option>
                  {STRATEGY_KEYWORDS.indicators.map((ind: string) => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1  dark:text-[#FF8C00]">Action</label>
                <select className="w-full border  dark: rounded px-3 py-2 bg-white dark:bg-[#232326]  dark:text-white" value={editStrategy?.conditions?.[0]?.action || ''} onChange={e => {
                  const newCond = [...(editStrategy?.conditions || [])];
                  if (!newCond[0]) newCond[0] = { indicator: '', action: '', value: '' };
                  newCond[0].action = e.target.value;
                  setEditStrategy((prev: any) => ({ ...prev, conditions: newCond }));
                }}>
                  <option value="">Select Action</option>
                  {STRATEGY_KEYWORDS.actions.map((act: string) => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1  dark:text-[#FF8C00]">Value</label>
                <select
                  className="w-full border  dark: rounded px-3 py-2 bg-white dark:bg-[#232326]  dark:text-white"
                  value={editStrategy?.conditions?.[0]?.value || ''}
                  onChange={e => {
                    const newCond = [...(editStrategy?.conditions || [])];
                    if (!newCond[0]) newCond[0] = { indicator: '', action: '', value: '' };
                    newCond[0].value = e.target.value;
                    setEditStrategy((prev: any) => ({ ...prev, conditions: newCond }));
                  }}
                  disabled={isValuesLoading}
                >
                  <option value="">Select Value</option>
                  {(Array.isArray(indicatorValues) ? indicatorValues : []).map((v: any) => (
                    <option key={v.id || v.value} value={v.value}>{v.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1  dark:text-[#FF8C00]">Provider</label>
                <select className="w-full border  dark: rounded px-3 py-2 bg-white dark:bg-[#232326]  dark:text-white" value={editStrategy?.provider || ''} onChange={e => handleEditChange('provider', e.target.value)}>
                  <option value="">Select Provider</option>
                  <option value="binance">Binance</option>
                  <option value="zerodha">Zerodha</option>
                  {/* Add more providers as needed */}
                </select>
              </div>
            </div>
            {editError && <div className="text-red-600 mb-2 whitespace-pre-line">{editError}</div>}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditPopupOpen(false)} disabled={editLoading}>Cancel</Button>
              <Button type="submit" className="bg-[#FF8C00] text-white" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </div>
      )}
      
      {/* Portal-based dropdown menu */}
      {openMenuIndex !== null && dropdownPosition && createPortal(
        <div
          ref={el => (menuRefs.current[openMenuIndex] = el)}
          className="fixed w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-[9999]"
          style={{
            left: `${dropdownPosition.x}px`,
            top: `${dropdownPosition.y}px`
          }}
        >
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
            onClick={() => handleEditClick(currentStrategies[openMenuIndex])}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-red-400 transition-colors"
            onClick={() => handleDeleteStrategy(currentStrategies[openMenuIndex].id)}
          >
            Delete
          </button>
        </div>,
        document.body
      )}

      {/* Promotional Banner */}
      <PromotionalBanner
        isOpen={showDemoBanner}
        onClose={() => setShowDemoBanner(false)}
      />
    </div>
  );
}