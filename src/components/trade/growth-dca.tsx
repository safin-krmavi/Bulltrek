'use client'

import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TradeConfirmationDialog } from "@/components/trade/trade-confirmation-dialog"
import { useBotManagement } from "@/hooks/useBotManagement"
import { useEffect, useState } from "react"
import { BrokerageConnection, brokerageService } from "@/api/brokerage"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AccountDetailsCard } from "./AccountDetailsCard"

export default function GrowthDCA() {
  const [isOpen, setIsOpen] = React.useState(true)
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)

  // Dialog and selection state
  const [selectedApi, setSelectedApi] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [brokerages, setBrokerages] = useState<BrokerageConnection[]>([])
  const [isBrokeragesLoading, setIsBrokeragesLoading] = useState(true)

  // Form state
  const [strategyName, setStrategyName] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investmentCurrency, setInvestmentCurrency] = useState("USTD");
  const [investmentCap, setInvestmentCap] = useState("");
  const [investmentCapCurrency, setInvestmentCapCurrency] = useState("USTD");
  const [duration, setDuration] = useState("");
  const [bookProfitBy, setBookProfitBy] = useState("");
  const [bookProfitMethod, setBookProfitMethod] = useState("percentage");
  const [priceTriggerStart, setPriceTriggerStart] = useState("");
  const [priceTriggerStop, setPriceTriggerStop] = useState("");
  const [stopLossBy, setStopLossBy] = useState("");
  // Schedule (for demo, hardcoded, but you can add UI for these)
  const [scheduleType] = useState("weekly");
  const [selectedDays] = useState(["Monday", "Wednesday", "Friday"]);
  const [repeatTime] = useState("14:30");
  const [timezone] = useState("UTC");
  // Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { } = useBotManagement()

  useEffect(() => {
    async function fetchBrokerages() {
      setIsBrokeragesLoading(true)
      try {
        const res = await brokerageService.getBrokerageDetails()
        setBrokerages(res.data.data || [])
      } catch {
        setBrokerages([])
      } finally {
        setIsBrokeragesLoading(false)
      }
    }
    fetchBrokerages()
  }, [])

  // Duration button handler
  const handleDuration = (val: string) => setDuration(val);

  // API call handler
  const handleProceed = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedApi || !strategyName || !investmentAmount || !investmentCap || !duration || !bookProfitBy || !priceTriggerStart || !priceTriggerStop || !stopLossBy) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      // Robustly get the token set after login
      const accessToken = localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token") || localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");
      const baseUrl = import.meta.env.VITE_API_URL || "";
      if (!baseUrl) {
        setError("API base URL is not set. Please check your environment variables.");
        setLoading(false);
        return;
      }
      if (!accessToken || typeof accessToken !== "string" || accessToken.trim() === "") {
        setError("You are not logged in. Please log in again.");
        setLoading(false);
        return;
      }
      const authHeader = `Bearer ${accessToken.trim()}`;
      console.log("[GrowthDCA] API URL:", baseUrl + "/growth-dca/create");
      console.log("[GrowthDCA] Authorization header:", authHeader);
      const body = {
        strategy_name: strategyName,
        api_connection_id: Number(selectedApi),
        segment: "Delivery/Spot/Cash",
        pair: "BTCUSDT",
        investment_amount: Number(investmentAmount),
        investment_currency: investmentCurrency,
        investment_cap: Number(investmentCap),
        duration,
        book_profit_by: {
          percentage: Number(bookProfitBy),
          method: bookProfitMethod
        },
        advanced_settings: {
          price_trigger_start: Number(priceTriggerStart),
          price_trigger_stop: Number(priceTriggerStop),
          stop_loss_by: Number(stopLossBy)
        },
        schedule: {
          type: scheduleType,
          selected_days: selectedDays,
          repeat_time: repeatTime,
          timezone: timezone
        }
      };
      // Use the robust token for the Authorization header
      const headers = {
        "Authorization": authHeader,
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      console.log("[GrowthDCA] Headers:", headers);
      console.log("[GrowthDCA] Body:", body);
      const res = await fetch(`${baseUrl}/growth-dca/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      console.log("[GrowthDCA] Response status:", res.status);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create Growth DCA strategy.");
      }
      setSuccess("Growth DCA strategy created successfully.");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStrategyName("");
    setInvestmentAmount("");
    setInvestmentCurrency("USTD");
    setInvestmentCap("");
    setInvestmentCapCurrency("USTD");
    setDuration("");
    setBookProfitBy("");
    setBookProfitMethod("percentage");
    setPriceTriggerStart("");
    setPriceTriggerStop("");
    setStopLossBy("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AccountDetailsCard
        selectedApi={selectedApi}
        setSelectedApi={setSelectedApi}
        isBrokeragesLoading={isBrokeragesLoading}
        brokerages={brokerages}
      />
      <form className="space-y-4  mt-4 dark:text-white">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525] border border-t-0">
            <span>Growth DCA</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 rounded-b-md border border-t-0 p-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Strategy Name
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Input placeholder="Enter Name" value={strategyName} onChange={e => setStrategyName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="flex gap-2">
                <Input placeholder="Value" value={investmentAmount} onChange={e => setInvestmentAmount(e.target.value)} />
                <Select value={investmentCurrency} onValueChange={setInvestmentCurrency}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USTD">USTD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-orange-500">Avbl: 389 USTD</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment CAP
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="flex gap-2">
                <Input placeholder="Value" value={investmentCap} onChange={e => setInvestmentCap(e.target.value)} />
                <Select value={investmentCapCurrency} onValueChange={setInvestmentCapCurrency}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USTD">USTD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Duration
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {['Daily', 'Weekly', 'Monthly', 'Hourly'].map(val => (
                  <Button key={val} variant={duration === val ? "default" : "outline"} className="flex-1" type="button" onClick={() => handleDuration(val)}>{val}</Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Book Profit By
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="relative">
                <Input placeholder="Value" value={bookProfitBy} onChange={e => setBookProfitBy(e.target.value)} />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-sm text-green-500">+ 88 Value</p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525] border border-t-0">
            <span>Advanced Settings</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 rounded-b-md border border-t-0 p-4">
            <div className="space-y-2">
              <Label>Price Trigger Start</Label>
              <div className="flex gap-2">
                <Input placeholder="Value" value={priceTriggerStart} onChange={e => setPriceTriggerStart(e.target.value)} />
                <Select value={investmentCurrency} disabled>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USTD">USTD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price Trigger Stop</Label>
              <div className="flex gap-2">
                <Input placeholder="Value" value={priceTriggerStop} onChange={e => setPriceTriggerStop(e.target.value)} />
                <Select value={investmentCurrency} disabled>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USTD">USTD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stop Loss By</Label>
              <div className="relative">
                <Input placeholder="Value" value={stopLossBy} onChange={e => setStopLossBy(e.target.value)} />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}

        <div className="flex gap-4">
          <Button
            className="flex-1 bg-[#4A1515] hover:bg-[#5A2525]"
            onClick={handleProceed}
            disabled={!selectedApi || loading}
          >
            {loading ? "Processing..." : "Proceed"}
          </Button>
          <Button variant="outline" className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]" type="button" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>
      <TradeConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        selectedApi={selectedApi}
        selectedBot={null}
      />
    </div>
  )
}

