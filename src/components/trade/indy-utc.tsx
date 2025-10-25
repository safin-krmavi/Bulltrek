'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AccountDetailsCard } from "@/components/trade/AccountDetailsCard"
import { brokerageService } from "@/api/brokerage"
// import { ErrorBoundary } from 'react-error-boundary'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown } from "lucide-react"

// Define types
interface Brokerage {
  id: string;
  name: string;
  // Add other brokerage properties as needed
}

interface Strategy {
  name: string;
  strategy_type: string;
  provider: string;
  conditions: Array<{
    indicator: string;
    action: string;
    value: string;
  }>;
  direction: string;
  quantity: number;
  asset: string;
  utc_session: string;
  trading_window_start: string;
  trading_window_end: string;
  timezone: string;
  risk_level: string;
}

// function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
//   return (
//     <div className="p-4 text-red-500">
//       <p>Something went wrong:</p>
//       <pre>{error.message}</pre>
//       <Button onClick={resetErrorBoundary}>Try again</Button>
//     </div>
//   );
// }

export default function IndyUTC() {
  // Main states
  const [isMainOpen, setIsMainOpen] = React.useState(true)
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)
  const [selectedApi, setSelectedApi] = React.useState("")
  const [isBrokeragesLoading, setIsBrokeragesLoading] = React.useState(false)
  const [brokerages, setBrokerages] = React.useState<Brokerage[]>([])
  const [segment, setSegment] = React.useState("")
  const [pair, setPair] = React.useState("")

  // Form states
  const [name, setName] = React.useState("")
  const [direction, setDirection] = React.useState("both")
  const [quantity, setQuantity] = React.useState("")
  const [asset, setAsset] = React.useState("")
  const [utcSession, setUtcSession] = React.useState("london_open")
  const [tradingWindowStart, setTradingWindowStart] = React.useState("")
  const [tradingWindowEnd, setTradingWindowEnd] = React.useState("")
  const [timezone, setTimezone] = React.useState("UTC")
  const [riskLevel, setRiskLevel] = React.useState("medium")
  const [loading, setLoading] = React.useState(false)

  // Advanced settings states
  const [utBuy, setUtBuy] = React.useState("")
  const [utSell, setUtSell] = React.useState("")
  const [sensitivity, setSensitivity] = React.useState("")
  const [atrPeriod, setAtrPeriod] = React.useState("")
  const [length, setLength] = React.useState("")
  const [fastLength, setFastLength] = React.useState("")

  React.useEffect(() => {
    async function fetchBrokerages() {
      setIsBrokeragesLoading(true)
      try {
        const res = await brokerageService.getBrokerageDetails()
        setBrokerages(res.data.data || [])
      } catch (error) {
        console.error('Failed to fetch brokerages:', error)
        setBrokerages([])
        toast.error("Failed to fetch brokerages")
      } finally {
        setIsBrokeragesLoading(false)
      }
    }
    fetchBrokerages()
  }, [])

  const validateAsset = React.useCallback((value: string) => {
    return /^[A-Z]{6}$/.test(value);
  }, []);

  const resetForm = React.useCallback(() => {
    setName("");
    setDirection("both");
    setQuantity("");
    setAsset("");
    setUtcSession("london_open");
    setTradingWindowStart("");
    setTradingWindowEnd("");
    setTimezone("UTC");
    setRiskLevel("medium");
    setUtBuy("")
    setUtSell("")
    setSensitivity("")
    setAtrPeriod("")
    setLength("")
    setFastLength("")
  }, []);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateAsset(asset)) {
      toast.error("Asset must be exactly 6 uppercase letters (e.g., EURUSD)");
      return;
    }

    if (tradingWindowStart >= tradingWindowEnd) {
      toast.error("Trading window start must be before end time");
      return;
    }

    if (Number(quantity) <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const strategy: Strategy = {
        name,
        strategy_type: "indy_utc",
        provider: "IndyUTCService",
        conditions: [
          {
            indicator: "UTC Session",
            action: "active_during",
            value: utcSession,
          },
        ],
        direction,
        quantity: Number(quantity),
        asset,
        utc_session: utcSession,
        trading_window_start: tradingWindowStart,
        trading_window_end: tradingWindowEnd,
        timezone,
        risk_level: riskLevel,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/strategies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(strategy),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create strategy");
      }

      toast.success("Strategy created successfully!");
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Error creating strategy");
      console.error("Strategy creation error:", err);
    } finally {
      setLoading(false);
    }
  }, [name, direction, quantity, asset, utcSession, tradingWindowStart, tradingWindowEnd, timezone, riskLevel, validateAsset, resetForm]);

  return (
      <div className="h-screen flex flex-col scrollbar-hide overflow-y-auto">
      <div className="flex-1 overflow-y-auto pr-4">
        <AccountDetailsCard
          selectedApi={selectedApi}
          setSelectedApi={setSelectedApi}
          isBrokeragesLoading={isBrokeragesLoading}
          brokerages={brokerages}
          segment={segment}
          setSegment={setSegment}
          pair={pair}
          setPair={setPair}
        />
        <div className="mt-4 rounded-lg border border-[#e5e7eb] dark:border-[#4A1515] bg-white dark:bg-[#18181B] shadow-lg">
          <Collapsible open={isMainOpen} onOpenChange={setIsMainOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="rounded-t-lg bg-[#4A1515] dark:bg-[#4A1515] px-4 py-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-white dark:text-white">Indy UTC</span>
                <ChevronDown className={`h-4 w-4 text-white transition-transform ${isMainOpen ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                {/* Strategy Name */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Strategy Name
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-muted-foreground">ⓘ</span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl">
                          <p>Enter your strategy name</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white dark:bg-[#232326] border border-[#e5e7eb]"
                  />
                </div>

                {/* Investment */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Investment
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-muted-foreground">ⓘ</span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl">
                          <p>Enter investment amount</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Value"
                      type="number"
                      className="flex-1"
                    />
                    <Select defaultValue="USDT">
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-orange-500">Avbl: 389 USDT</p>
                </div>

                {/* Time Frame */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Time Frame
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-muted-foreground">ⓘ</span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl">
                          <p>Please select the timeframe you wish to use on this strategy. Default is 5Minutes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Minute</SelectItem>
                      <SelectItem value="5">5 Minutes</SelectItem>
                      <SelectItem value="15">15 Minutes</SelectItem>
                      <SelectItem value="30">30 Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Leverage */}
                <div className="space-y-2">
                  <Label>Leverage</Label>
                  <Input
                    placeholder="Value"
                    type="number"
                    className="bg-white dark:bg-[#232326] border border-[#e5e7eb]"
                  />
                </div>

                {/* Lower and Upper Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Lower Limit
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-muted-foreground">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl">
                            <p>Set the lowest price range</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="flex gap-2">
                      <Input placeholder="Value" />
                      <Select defaultValue="USDT">
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Upper Limit
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-muted-foreground">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl">
                            <p>Set the highest price range</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="flex gap-2">
                      <Input placeholder="Value" />
                      <Select defaultValue="USDT">
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Price Trigger Start/Stop */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Price Trigger Start</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Value" />
                      <Select defaultValue="USDT">
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Price Trigger Stop</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Value" />
                      <Select defaultValue="USDT">
                        <SelectTrigger className="w-[80px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDT">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Stop Loss */}
                <div className="space-y-2">
                  <Label>Stop Loss By</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Value" />
                    <span className="flex items-center px-3">%</span>
                  </div>
                </div>

              </form>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Advanced Settings Card */}
        <div className="mt-4 rounded-lg border border-[#e5e7eb] dark:border-[#4A1515] bg-white dark:bg-[#18181B] shadow-lg">
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="rounded-t-lg bg-[#4A1515] dark:bg-[#4A1515] px-4 py-3 flex items-center justify-between">
                <span className="text-lg font-semibold text-white dark:text-white">Advanced Settings</span>
                <ChevronDown className={`h-4 w-4 text-white transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-6 space-y-4">
                {/* UT Buy/Sell Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>UT Buy</Label>
                    <Input 
                      type="number"
                      placeholder="2"
                      value={utBuy}
                      onChange={(e) => setUtBuy(e.target.value)}
                      className="bg-white dark:bg-[#232326] border border-[#e5e7eb]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>UT Sell</Label>
                    <Input 
                      type="number"
                      placeholder="300"
                      value={utSell}
                      onChange={(e) => setUtSell(e.target.value)}
                      className="bg-white dark:bg-[#232326] border border-[#e5e7eb]"
                    />
                  </div>
                </div>

                {/* Sensitivity/ATR Period Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Sensitivity
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-muted-foreground">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl">
                            <p>Adjust sensitivity settings</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input 
                      type="number"
                      placeholder="80"
                      value={sensitivity}
                      onChange={(e) => setSensitivity(e.target.value)}
                      className="bg-white dark:bg-[#232326] border border-[#e5e7eb]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      ATR Period
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-muted-foreground">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl">
                            <p>Set ATR Period value</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input 
                      type="number"
                      placeholder="27"
                      value={atrPeriod}
                      onChange={(e) => setAtrPeriod(e.target.value)}
                      className="bg-white dark:bg-[#232326] border border-[#e5e7eb]"
                    />
                  </div>
                </div>

                {/* Length/Fast Length Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Length
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-muted-foreground">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl">
                            <p>Set Length parameter</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input 
                      type="number"
                      placeholder="1"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="bg-white dark:bg-[#232326] border border-[#e5e7eb]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Fast Length
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-muted-foreground">ⓘ</span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl">
                            <p>Set Fast Length parameter</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input 
                      type="number"
                      placeholder="1"
                      value={fastLength}
                      onChange={(e) => setFastLength(e.target.value)}
                      className="bg-white dark:bg-[#232326] border border-[#e5e7eb]"
                    />
                  </div>
                </div>

                {/* UT Oscillator */}
                <div className="space-y-2">
                  <Label>UT Oscillator</Label>
                  <Input 
                    type="number"
                    disabled
                    value="27"
                    className="bg-gray-100 dark:bg-[#2A2A2D] border border-[#e5e7eb]"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        
                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <Button
                    className="flex-1 bg-[#4A1515] hover:bg-[#5A2525] text-white"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Proceed"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-[#F59E42] text-white hover:bg-[#B45309]"
                    onClick={resetForm}
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </div>
                </div>
      </div>

  )
}

