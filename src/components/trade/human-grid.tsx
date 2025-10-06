'use client'

import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AccountDetailsCard } from "@/components/trade/AccountDetailsCard"
import { TradeConfirmationDialog, StrategyType } from "@/components/trade/trade-confirmation-dialog"
import { useEffect, useState } from "react"
import { brokerageService } from "@/api/brokerage"
import { toast } from "sonner"

export default function HumanGrid() {
  const [apiError, setApiError] = useState("");
  const [isOpen, setIsOpen] = React.useState(true)
  const [selectedApi, setSelectedApi] = React.useState("");
  const [isBrokeragesLoading, setIsBrokeragesLoading] = React.useState(false);
  const [brokerages, setBrokerages] = React.useState([]);
  const [segment, setSegment] = React.useState("Delivery/Spot/Cash");
  const [pair, setPair] = React.useState("BTCUSDT");
  const [strategyName, setStrategyName] = useState("");
  const [investment, setInvestment] = useState("");
  const [investmentCap, setInvestmentCap] = useState("");
  const [lowerLimit, setLowerLimit] = useState("");
  const [upperLimit, setUpperLimit] = useState("");
  const [leverage, setLeverage] = useState("");
  const [direction, setDirection] = useState("Long");
  const [entryInterval, setEntryInterval] = useState("");
  const [bookProfitBy, setBookProfitBy] = useState("");
  const [stopLossBy, setStopLossBy] = useState("");
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strategyId, setStrategyId] = useState<string | null>(null);

  // ✅ Updated condition to check for futures segments
  const isCryptoFutures = segment.toLowerCase().includes('futures') || 
                         segment.toLowerCase().includes('future') ||
                         segment === "Crypto Futures" ||
                         segment === "Futures";

  // ✅ Add debug logging to see the current segment value
  console.log('Current segment:', segment);
  console.log('Is Crypto Futures:', isCryptoFutures);

  useEffect(() => {
    async function fetchBrokerages() {
      setIsBrokeragesLoading(true);
      try {
        const res = await brokerageService.getBrokerageDetails();
        setBrokerages(res.data.data || []);
      } catch {
        setBrokerages([]);
      } finally {
        setIsBrokeragesLoading(false);
      }
    }
    fetchBrokerages();
  }, []);

  // ✅ Add useEffect to log segment changes
  useEffect(() => {
    console.log('Segment changed to:', segment);
    console.log('Should show futures fields:', isCryptoFutures);
  }, [segment, isCryptoFutures]);
  
  const handleProceed = async (e: React.MouseEvent) => {
    e.preventDefault();
    setApiError("");

    if (!selectedApi) {
      setApiError("Please select an API connection");
      toast.error("Please select an API connection");
      return;
    }

    // ✅ Updated validation for mandatory fields only
    const mandatoryFields = [
      { value: strategyName, name: "Strategy Name" },
      { value: investment, name: "Investment" },
      { value: lowerLimit, name: "Lower Limit" },
      { value: upperLimit, name: "Upper Limit" },
      { value: entryInterval, name: "Entry Interval" },
      { value: bookProfitBy, name: "Book Profit By" }
    ];

    // ✅ Add leverage validation only for Crypto Futures
    if (isCryptoFutures) {
      mandatoryFields.push({ value: leverage, name: "Leverage" });
    }

    // ✅ Direction is now always mandatory regardless of segment
    mandatoryFields.push({ value: direction, name: "Direction" });

    const emptyFields = mandatoryFields.filter(field => !field.value.trim());
    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map(field => field.name).join(", ");
      setApiError(`Please fill in required fields: ${fieldNames}`);
      toast.error(`Please fill in required fields: ${fieldNames}`);
      return;
    }

    // ✅ Validate numeric fields
    const numericFields = [investment, lowerLimit, upperLimit, entryInterval, bookProfitBy];
    if (isCryptoFutures) numericFields.push(leverage);
    
    const invalidNumbers = numericFields.filter(value => value && isNaN(Number(value)));
    if (invalidNumbers.length > 0) {
      setApiError("Please enter valid numeric values");
      toast.error("Please enter valid numeric values");
      return;
    }

    setLoading(true);
    
    try {
      // ✅ Prepare payload with conditional fields
      const payload: any = {
        strategy_name: strategyName,
        api_connection_id: Number(selectedApi),
        segment,
        pair,
        investment: Number(investment),
        lower_limit: Number(lowerLimit),
        upper_limit: Number(upperLimit),
        entry_interval: Number(entryInterval),
        book_profit_by: Number(bookProfitBy),
        direction: direction // ✅ Always include direction
      };

      // ✅ Add optional fields only if they have values
      if (investmentCap) payload.investment_cap = Number(investmentCap);
      if (stopLossBy) payload.stop_loss_by = Number(stopLossBy);
      
      // ✅ Add leverage only for Crypto Futures
      if (isCryptoFutures) {
        payload.leverage = Number(leverage);
      }

      const accessToken = localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token") || 
                         localStorage.getItem("token") || localStorage.getItem("authToken");
      const baseUrl = import.meta.env.VITE_API_URL;

      if (!baseUrl) {
        setApiError("API base URL is not configured");
        toast.error("API base URL is not configured");
        return;
      }

      if (!accessToken) {
        setApiError("You are not logged in. Please log in again.");
        toast.error("You are not logged in. Please log in again.");
        return;
      }

      const headers = {
        "Authorization": `Bearer ${accessToken.trim()}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      };

      const res = await fetch(`${baseUrl}/human-grid/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (res.status === 201) {
        const responseData = await res.json();
        console.log('Human Grid creation response:', responseData);
        
        const createdStrategyId = responseData.data?.id || responseData.id;
        if (createdStrategyId) {
          setStrategyId(createdStrategyId.toString());
        }
        
        setShowConfirmation(true);
        toast.success("Human Grid strategy created successfully!");
      } else {
        const err = await res.json();
        const errorMessage = err.message || "An error occurred while creating the strategy.";
        setApiError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || "Network error occurred. Please try again.";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStrategyName("");
    setInvestment("");
    setInvestmentCap("");
    setLowerLimit("");
    setUpperLimit("");
    setLeverage("");
    setDirection("Long");
    setEntryInterval("");
    setBookProfitBy("");
    setStopLossBy("");
    setApiError("");
  };

  return (
    <div className="h-screen flex flex-col scrollbar-hide overflow-y-scroll">
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
      <form className="space-y-4 mt-4 dark:text-white">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525] border border-t-0">
            <span>Human Grid</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 rounded-b-md border border-t-0 p-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Strategy Name *
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter strategy name" 
                  value={strategyName} 
                  onChange={(e) => setStrategyName(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment *
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter investment amount" 
                  type="number"
                  value={investment} 
                  onChange={(e) => setInvestment(e.target.value)}
                  required 
                />
                <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
              </div>
              <p className="text-sm text-orange-500">Avbl: 389 USTD</p>
            </div>

            {/* ✅ Investment CAP - Optional field */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment CAP
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter investment cap (optional)" 
                  type="number"
                  value={investmentCap} 
                  onChange={(e) => setInvestmentCap(e.target.value)}
                />
                <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lower Limit *</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter lower limit" 
                    type="number"
                    value={lowerLimit} 
                    onChange={(e) => setLowerLimit(e.target.value)}
                    required 
                  />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Upper Limit *</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter upper limit" 
                    type="number"
                    value={upperLimit} 
                    onChange={(e) => setUpperLimit(e.target.value)}
                    required 
                  />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
            </div>

            {/* ✅ Show Leverage only for Futures, but Direction always shown */}
            <div className="grid grid-cols-2 gap-4">
              {/* ✅ Show Leverage field only for Crypto Futures */}
              {isCryptoFutures && (
                <div className="space-y-2">
                  <Label>Leverage *</Label>
                  <Input 
                    placeholder="Enter leverage" 
                    type="number"
                    value={leverage} 
                    onChange={(e) => setLeverage(e.target.value)}
                    required 
                  />
                </div>
              )}
              
              {/* ✅ Direction field is now always shown */}
              <div className={`space-y-2 ${!isCryptoFutures ? 'col-span-2' : ''}`}>
                <Label>Direction *</Label>
                <Select value={direction} onValueChange={setDirection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Long">Long</SelectItem>
                    <SelectItem value="Short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Entry Interval *
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="relative">
                <Input 
                  placeholder="Enter entry interval" 
                  type="number"
                  value={entryInterval} 
                  onChange={(e) => setEntryInterval(e.target.value)}
                  required 
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">Pts</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Book Profit By *
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Input 
                placeholder="Enter profit percentage" 
                type="number"
                value={bookProfitBy} 
                onChange={(e) => setBookProfitBy(e.target.value)}
                required 
              />
            </div>

            {/* ✅ Stop Loss By - Optional field */}
            <div className="space-y-2">
              <Label>Stop Loss By</Label>
              <div className="relative">
                <Input 
                  placeholder="Enter stop loss percentage (optional)" 
                  type="number"
                  value={stopLossBy} 
                  onChange={(e) => setStopLossBy(e.target.value)}
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <p className="text-sm text-green-500">Estimated Net PnL of trade: + 88 Value</p>
          </CollapsibleContent>
        </Collapsible>

        {apiError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {apiError}
          </div>
        )}

        <div className="flex gap-4">
          <Button 
            className="flex-1 bg-[#4A1515] hover:bg-[#5A2525]" 
            onClick={handleProceed}
            disabled={loading || !selectedApi}
          >
            {loading ? "Processing..." : "Proceed"}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]"
            onClick={handleReset}
            type="button"
          >
            Reset
          </Button>
        </div>
      </form>

      {/* ✅ Fix the strategyId type issue */}
      <TradeConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        selectedApi={selectedApi}
        selectedBot={null}
        strategyType={StrategyType.HUMAN_GRID}
        strategyId={strategyId || undefined}
      />
    </div>
  )
}