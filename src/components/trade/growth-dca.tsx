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
  const [selectedApi, setSelectedApi] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [brokerages, setBrokerages] = useState<BrokerageConnection[]>([]);
  const [isBrokeragesLoading, setIsBrokeragesLoading] = useState(true);

  // Form state
  const [strategyName, setStrategyName] = useState("");
  const [pair, setPair] = useState("BTCUSDT");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [investmentCurrency, setInvestmentCurrency] = useState("USTD");
  const [investmentCap, setInvestmentCap] = useState("");
  const [duration, setDuration] = useState("");
  const [segment, setSegment] = useState("Delivery/Spot/Cash");
  const [bookProfitBy, setBookProfitBy] = useState("");
  const [priceTriggerStart, setPriceTriggerStart] = useState("");
  const [priceTriggerStop, setPriceTriggerStop] = useState("");
  const [stopLossBy, setStopLossBy] = useState("");
  // Schedule fields
  const [scheduleType, setScheduleType] = useState("weekly");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Monday", "Wednesday", "Friday"]);
  const [repeatTime, setRepeatTime] = useState("14:30");
  const [timezone, setTimezone] = useState("UTC");
  // Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { } = useBotManagement();

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

  // API call handler
  const handleProceed = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Basic validation
    if (!selectedApi || !strategyName || !pair || !investmentAmount || !investmentCap || !duration || !bookProfitBy || !priceTriggerStart || !priceTriggerStop || !stopLossBy) {
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
          percentage: Number(bookProfitBy)
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
      setShowConfirmation(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
                <Select value={investmentCurrency} onValueChange={setInvestmentCurrency}>
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
                Book Profit By
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Percentage"
                  value={bookProfitBy}
                  onChange={e => setBookProfitBy(e.target.value)}
                  className="pr-10"
                />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525] border border-t-0">
            <span>Advanced Settings</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 rounded-b-md border border-t-0 p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="priceTriggerStart">Price Trigger Start</Label>
                <div className="flex gap-2">
                  <Input id="priceTriggerStart" type="number" placeholder="Value" value={priceTriggerStart} onChange={e => setPriceTriggerStart(e.target.value)} className="flex-1" />
                  <Select value={investmentCurrency} onValueChange={setInvestmentCurrency}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USTD">USTD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceTriggerStop">Price Trigger Stop</Label>
                <div className="flex gap-2">
                  <Input id="priceTriggerStop" type="number" placeholder="Value" value={priceTriggerStop} onChange={e => setPriceTriggerStop(e.target.value)} className="flex-1" />
                  <Select value={investmentCurrency} onValueChange={setInvestmentCurrency}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USTD">USTD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stopLossBy">Stop Loss By</Label>
                <div className="relative">
                  <Input id="stopLossBy" type="number" placeholder="Value" value={stopLossBy} onChange={e => setStopLossBy(e.target.value)} className="pr-10" />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Schedule Section */}
        {/* <div className="space-y-2">
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
        </div> */}

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
          <Button variant="outline" className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]" type="button" onClick={() => {
            setStrategyName("");
            setPair("BTCUSDT");
            setInvestmentAmount("");
            setInvestmentCurrency("USTD");
            setInvestmentCap("");
            setDuration("");
            setSegment("Delivery/Spot/Cash");
            setBookProfitBy("");
            setPriceTriggerStart("");
            setPriceTriggerStop("");
            setStopLossBy("");
            setScheduleType("weekly");
            setSelectedDays(["Monday", "Wednesday", "Friday"]);
            setRepeatTime("14:30");
            setTimezone("UTC");
            setError("");
            setSuccess("");
          }}>
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