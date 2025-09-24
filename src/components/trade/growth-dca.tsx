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
import { AccountDetailsCard } from "./AccountDetailsCard"
import { ProceedPopup } from "@/components/dashboard/proceed-popup"

export default function GrowthDCA() {
  const [showProceedPopup, setShowProceedPopup] = useState(false);
  const [isOpen, setIsOpen] = React.useState(true)
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)

  // Dialog and selection state
  const [selectedApi, setSelectedApi] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [brokerages, setBrokerages] = useState<BrokerageConnection[]>([])
  const [isBrokeragesLoading, setIsBrokeragesLoading] = useState(true)

  // Form state
  const [strategyName, setStrategyName] = useState("");
  const [pair, setPair] = useState("BTCUSDT");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investmentCurrency, setInvestmentCurrency] = useState("USTD");
  const [investmentCap, setInvestmentCap] = useState("");
  const [duration, setDuration] = useState("");
  const [segment, setSegment] = useState("Delivery/Spot/Cash");
  const [bookProfitBy, setBookProfitBy] = useState("");
  const [bookProfitMethod, setBookProfitMethod] = useState("percentage");
  const [priceTriggerStart, setPriceTriggerStart] = useState("45000");
  const [priceTriggerStop, setPriceTriggerStop] = useState("70000");
  const [stopLossBy, setStopLossBy] = useState("10");
  // Schedule fields
  const [scheduleType, setScheduleType] = useState("weekly");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);
  const [repeatTime, setRepeatTime] = useState("14:30");
  const [timezone, setTimezone] = useState("UTC");
  // Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);

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

  // API call handler
  const handleProceed = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setMissingFields([]);
    // Improved validation: check for empty strings and allow zero values for numbers
    const missing: string[] = [];
    if (!selectedApi) missing.push("API Connection");
    if (strategyName.trim() === "") missing.push("Strategy Name");
    if (pair.trim() === "") missing.push("Pair");
    if (investmentAmount.trim() === "" || isNaN(Number(investmentAmount)) || Number(investmentAmount) <= 0) missing.push("Investment Amount");
    if (investmentCap.trim() === "" || isNaN(Number(investmentCap)) || Number(investmentCap) <= 0) missing.push("Investment CAP");
    if (duration.trim() === "") missing.push("Duration");
    if (bookProfitBy.trim() === "" || isNaN(Number(bookProfitBy)) || Number(bookProfitBy) <= 0) missing.push("Book Profit By (%)");
    if (priceTriggerStart.trim() === "" || isNaN(Number(priceTriggerStart)) || Number(priceTriggerStart) <= 0) missing.push("Price Trigger Start");
    if (priceTriggerStop.trim() === "" || isNaN(Number(priceTriggerStop)) || Number(priceTriggerStop) <= 0) missing.push("Price Trigger Stop");
    if (stopLossBy.trim() === "" || isNaN(Number(stopLossBy)) || Number(stopLossBy) <= 0) missing.push("Stop Loss By (%)");
    if (missing.length > 0) {
      setMissingFields(missing);
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
      const body = {
        strategy_name: strategyName,
        api_connection_id: Number(selectedApi),
        segment,
        pair,
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
      const headers = {
        "Authorization": authHeader,
        "Accept": "application/json",
        "Content-Type": "application/json"
      };
      const res = await fetch(`${baseUrl}/growth-dca/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create Growth DCA strategy.");
      }
  setSuccess("Growth DCA strategy created successfully.");
  setShowProceedPopup(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStrategyName("");
    setPair("BTCUSDT");
    setInvestmentAmount("");
    setInvestmentCurrency("USTD");
    setInvestmentCap("");
    setDuration("");
    setSegment("Delivery/Spot/Cash");
    setBookProfitBy("");
    setBookProfitMethod("percentage");
  setPriceTriggerStart("45000");
  setPriceTriggerStop("70000");
  setStopLossBy("10");
    setScheduleType("weekly");
    setSelectedDays(["Monday", "Wednesday", "Friday"]);
    setRepeatTime("14:30");
    setTimezone("UTC");
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
        segment={segment}
        setSegment={setSegment}
      />
      <form className="space-y-4 mt-4 dark:text-white">
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
              <Input
                placeholder="Enter Name"
                value={strategyName}
                onChange={e => setStrategyName(e.target.value)}
                className={(!strategyName && error) ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Pair
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Input
                placeholder="e.g. BTCUSDT"
                value={pair}
                onChange={e => setPair(e.target.value)}
                className={(!pair && error) ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Value"
                  value={investmentAmount}
                  onChange={e => setInvestmentAmount(e.target.value)}
                  className={(!investmentAmount && error) ? "border-red-500" : ""}
                />
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
                <Input
                  placeholder="Value"
                  value={investmentCap}
                  onChange={e => setInvestmentCap(e.target.value)}
                  className={(!investmentCap && error) ? "border-red-500" : ""}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Duration
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Book Profit By (%)
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Input
                type="number"
                placeholder="Percentage"
                value={bookProfitBy}
                onChange={e => setBookProfitBy(e.target.value)}
                className={(!bookProfitBy && error) ? "border-red-500" : ""}
              />
              <Select value={bookProfitMethod} onValueChange={setBookProfitMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525] border border-t-0">
            <span>Advanced Settings</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 rounded-b-md border border-t-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceTriggerStart">Price Trigger Start</Label>
                <Input
                  id="priceTriggerStart"
                  type="number"
                  placeholder="e.g. 45000"
                  value={priceTriggerStart}
                  onChange={e => setPriceTriggerStart(e.target.value)}
                  className={(!priceTriggerStart && error) ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceTriggerStop">Price Trigger Stop</Label>
                <Input
                  id="priceTriggerStop"
                  type="number"
                  placeholder="e.g. 70000"
                  value={priceTriggerStop}
                  onChange={e => setPriceTriggerStop(e.target.value)}
                  className={(!priceTriggerStop && error) ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="stopLossBy">Stop Loss By (%)</Label>
                <Input
                  id="stopLossBy"
                  type="number"
                  placeholder="e.g. 10"
                  value={stopLossBy}
                  onChange={e => setStopLossBy(e.target.value)}
                  className={(!stopLossBy && error) ? "border-red-500" : ""}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Schedule Section */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Schedule Type
            <span className="text-muted-foreground">ⓘ</span>
          </Label>
          <Select value={scheduleType} onValueChange={setScheduleType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Schedule Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Selected Days
            <span className="text-muted-foreground">ⓘ</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
              <Button
                key={day}
                type="button"
                variant="outline"
                className={`px-2 py-1 text-xs border rounded transition-colors duration-150 ${selectedDays.includes(day) ? "bg-[#4A1515] text-white border-[#4A1515]" : "bg-white text-black border-gray-300"}`}
                onClick={() => setSelectedDays(selectedDays.includes(day) ? selectedDays.filter(d => d !== day) : [...selectedDays, day])}
              >
                {day}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Repeat Time
            <span className="text-muted-foreground">ⓘ</span>
          </Label>
          <Input type="time" value={repeatTime} onChange={e => setRepeatTime(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Timezone
            <span className="text-muted-foreground">ⓘ</span>
          </Label>
          <Input placeholder="e.g. UTC" value={timezone} onChange={e => setTimezone(e.target.value)} />
        </div>

        {missingFields.length > 0 && (
          <div className="text-red-500 text-sm">
            <div className="font-semibold">Missing Fields:</div>
            <ul className="list-disc ml-5">
              {missingFields.map(field => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>
        )}
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
      {showProceedPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="flex items-center justify-center w-full h-full">
            <div className="bg-white rounded-lg shadow-lg p-0 max-h-[90vh] overflow-y-auto mx-auto my-auto">
              <ProceedPopup
                variant="extended"
                strategyData={{
                  accountDetails: {
                    API: selectedApi,
                    Segment: segment,
                    Pair: pair,
                    InvestmentAmount: investmentAmount,
                    InvestmentCurrency: investmentCurrency,
                    InvestmentCap: investmentCap,
                    Duration: duration
                  },
                  advancedSettings: {
                    PriceTriggerStart: priceTriggerStart,
                    PriceTriggerStop: priceTriggerStop,
                    StopLossBy: stopLossBy
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

