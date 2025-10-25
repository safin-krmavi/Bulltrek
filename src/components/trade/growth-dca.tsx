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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DurationTooltip } from "@/components/ui/duration-tooltip"

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
  const [durationDetails, setDurationDetails] = React.useState<{
    type: string;
    time?: string;
    amPm?: string;
    date?: string;
    hours?: string;
  }>({ type: "" });
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

  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedAmPm, setSelectedAmPm] = useState("AM");
  const [selectedDate, setSelectedDate] = useState("1");
  const [hourlyStartTime, setHourlyStartTime] = useState("00:00");
  const [hourlyAmPm, setHourlyAmPm] = useState("AM");
  const [hours, setHours] = useState("");
  // const [monthlyTime, setMonthlyTime] = useState("12:00");
  // const [monthlyAmPm, setMonthlyAmPm] = useState("AM");

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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[200px] text-wrap">
                      <p>You can keep desired Strategy Name for reference and reports</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input placeholder="Enter Name" value={strategyName} onChange={e => setStrategyName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[200px] text-wrap">
                      <p>Invest Per trade</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[600px] text-wrap">
                      <p>Strategy Stops when Total Investment of the strategy is equal to Cap Value</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[200px] text-wrap">
                      <p>Please Select the Recurring Duration of the Strategy</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex gap-2">
                <DurationTooltip
  type="Daily"
  onTimeChange={(time) => {
    setSelectedTime(time);
    const value = `${time} ${selectedAmPm}`;
    setDuration(`Daily ${value}`);
    setDurationDetails({ type: "Daily", time: time, amPm: selectedAmPm });
  }}
  onHourlyStartTimeChange={setHourlyStartTime}
  onAmPmChange={(amPm) => {
    setSelectedAmPm(amPm);
    const value = `${selectedTime} ${amPm}`;
    setDuration(`Daily ${value}`);
    setDurationDetails({ type: "Daily", time: selectedTime, amPm: amPm });
  }}
  defaultTime={durationDetails.type === "Daily" ? durationDetails.time : selectedTime}
  defaultAmPm={durationDetails.type === "Daily" ? durationDetails.amPm : selectedAmPm}
  isSelected={duration.startsWith("Daily")}
  onSelectionComplete={(data) => {
    setDurationDetails({ ...data, type: "Daily" });
    const value = `${data.time || selectedTime} ${data.amPm || selectedAmPm}`;
    setDuration(`Daily ${value}`);
  }}
>
  <Button
    type="button"
    variant={duration.startsWith("Daily") ? "default" : "outline"}
    onClick={() => {
      const value = `${selectedTime} ${selectedAmPm}`;
      setDuration(`Daily ${value}`);
      setDurationDetails({ type: "Daily", time: selectedTime, amPm: selectedAmPm });
    }}
    className={duration.startsWith("Daily") ? "bg-[#cabcbc] hover:bg-[#cabcbc]" : ""}
  >
    {duration.startsWith("Daily") ? duration.replace("Daily", "").trim() : "Daily"}
  </Button>
</DurationTooltip>                                <DurationTooltip
                  type="Weekly"
                  onTimeChange={(time) => {
                    setSelectedTime(time);
                    const value = `${time} ${selectedAmPm}`;
                    setDuration(`Weekly ${value}`);
                    setDurationDetails({ type: "Weekly", time: time, amPm: selectedAmPm });
                  }}
                  onHourlyStartTimeChange={setHourlyStartTime}
                  onAmPmChange={(amPm) => {
                    setSelectedAmPm(amPm);
                    const value = `${selectedTime} ${amPm}`;
                    setDuration(`Weekly ${value}`);
                    setDurationDetails({ type: "Weekly", time: selectedTime, amPm: amPm });
                  }}
                  defaultTime={durationDetails.type === "Weekly" ? durationDetails.time : selectedTime}
                  defaultAmPm={durationDetails.type === "Weekly" ? durationDetails.amPm : selectedAmPm}
                  isSelected={duration.startsWith("Weekly")}
                  onSelectionComplete={(data) => {
                    setDurationDetails({ ...data, type: "Weekly" });
                    const value = `${data.time || selectedTime} ${data.amPm || selectedAmPm}`;
                    setDuration(`Weekly ${value}`);
                  }}
                >
                  <Button
                    type="button"
                    variant={duration.startsWith("Weekly") ? "default" : "outline"}
                    onClick={() => {
                      const value = `${selectedTime} ${selectedAmPm}`;
                      setDuration(`Weekly ${value}`);
                      setDurationDetails({ type: "Weekly", time: selectedTime, amPm: selectedAmPm });
                    }}
                    className={duration.startsWith("Weekly") ? "bg-[#cabcbc] hover:bg-[#cabcbc]" : ""}
                  >
                    {duration.startsWith("Weekly") ? duration.replace("Weekly", "").trim() : "Weekly"}
                  </Button>
                </DurationTooltip>

                                <DurationTooltip
                  type="Monthly"
                  onTimeChange={(time) => {
                    setSelectedTime(time);
                    const value = `${selectedDate}, ${time} ${selectedAmPm}`;
                    setDuration(`Monthly ${value}`);
                    setDurationDetails({ type: "Monthly", time, amPm: selectedAmPm, date: selectedDate });
                  }}
                  onHourlyStartTimeChange={setHourlyStartTime}
                  onAmPmChange={(amPm) => {
                    setSelectedAmPm(amPm);
                    const value = `${selectedDate}, ${selectedTime} ${amPm}`;
                    setDuration(`Monthly ${value}`);
                    setDurationDetails({ type: "Monthly", time: selectedTime, amPm, date: selectedDate });
                  }}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    const value = `${date}, ${selectedTime} ${selectedAmPm}`;
                    setDuration(`Monthly ${value}`);
                    setDurationDetails({ type: "Monthly", time: selectedTime, amPm: selectedAmPm, date });
                  }}
                  defaultTime={durationDetails.type === "Monthly" ? durationDetails.time : selectedTime}
                  defaultAmPm={durationDetails.type === "Monthly" ? durationDetails.amPm : selectedAmPm}
                  selectedDate={durationDetails.type === "Monthly" ? durationDetails.date : selectedDate}
                  isSelected={duration.startsWith("Monthly")}
                  onSelectionComplete={(data) => {
                    setDurationDetails({ ...data, type: "Monthly" });
                    const value = `${data.date || selectedDate}, ${data.time || selectedTime} ${data.amPm || selectedAmPm}`;
                    setDuration(`Monthly ${value}`);
                  }}
                >
                  <Button
                    type="button"
                    variant={duration.startsWith("Monthly") ? "default" : "outline"}
                    onClick={() => {
                      const value = `${selectedDate}, ${selectedTime} ${selectedAmPm}`;
                      setDuration(`Monthly ${value}`);
                      setDurationDetails({ type: "Monthly", time: selectedTime, amPm: selectedAmPm, date: selectedDate });
                    }}
                    className={duration.startsWith("Monthly") ? "bg-[#cabcbc] hover:bg-[#cabcbc]" : ""}
                  >
                    {duration.startsWith("Monthly") ? duration.replace("Monthly", "").trim() : "Monthly"}
                  </Button>
                </DurationTooltip>

                              <DurationTooltip
                  type="Hourly"
                  onTimeChange={(value) => {
                    setHours(value);
                    const displayValue = `${value}h, ${hourlyStartTime} ${hourlyAmPm}`;
                    setDuration(`Hourly ${displayValue}`);
                    setDurationDetails({ type: "Hourly", hours: value, time: hourlyStartTime, amPm: hourlyAmPm });
                  }}
                  onHourlyStartTimeChange={(time) => {
                    setHourlyStartTime(time);
                    const displayValue = `${hours || "1"}h, ${time} ${hourlyAmPm}`;
                    setDuration(`Hourly ${displayValue}`);
                    setDurationDetails({ type: "Hourly", hours, time, amPm: hourlyAmPm });
                  }}
                  onAmPmChange={(amPm) => {
                    setHourlyAmPm(amPm);
                    const displayValue = `${hours || "1"}h, ${hourlyStartTime} ${amPm}`;
                    setDuration(`Hourly ${displayValue}`);
                    setDurationDetails({ type: "Hourly", hours, time: hourlyStartTime, amPm });
                  }}
                  defaultTime={durationDetails.type === "Hourly" ? durationDetails.time : hourlyStartTime}
                  defaultAmPm={durationDetails.type === "Hourly" ? durationDetails.amPm : hourlyAmPm}                  
                  isSelected={duration.startsWith("Hourly")}
                  onSelectionComplete={(data) => {
                    setDurationDetails({ ...data, type: "Hourly" });
                    const value = `${data.hours || hours || "1"}h, ${data.time || hourlyStartTime} ${data.amPm || hourlyAmPm}`;
                    setDuration(`Hourly ${value}`);
                  }}
                >
                  <Button
                    type="button"
                    variant={duration.startsWith("Hourly") ? "default" : "outline"}
                    onClick={() => {
                      const value = `${hours || "1"}h, ${hourlyStartTime} ${hourlyAmPm}`;
                      setDuration(`Hourly ${value}`);
                      setDurationDetails({ type: "Hourly", hours, time: hourlyStartTime, amPm: hourlyAmPm });
                    }}
                    className={duration.startsWith("Hourly") ? "bg-[#cabcbc] hover:bg-[#cabcbc]" : ""}
                  >
                    {duration.startsWith("Hourly") ? duration.replace("Hourly", "").trim() : "Hourly"}
                  </Button>     
                </DurationTooltip>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Book Profit By
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[200px] text-wrap">
                      <p className="text-sm whitespace-normal">If You wish to book profit by percentage based on buy price. Please Make sure to check your Transaction fees on respective exchange</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
            setDurationDetails({ type: "" });
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