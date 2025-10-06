'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AccountDetailsCard } from "@/components/trade/AccountDetailsCard"
import { brokerageService } from "@/api/brokerage"
import { ErrorBoundary } from 'react-error-boundary'

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

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 text-red-500">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

export default function IndyUTC() {
  // Main states
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
    <ErrorBoundary FallbackComponent={ErrorFallback}>
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
        <div className="mt-4 rounded-lg border border-[#e5e7eb] dark:border-[#4A1515] bg-white dark:bg-[#18181B] shadow-lg">
          <div className="rounded-t-lg bg-[#4A1515] dark:bg-[#4A1515] px-4 py-3 flex items-center">
            <span className="text-lg font-semibold text-white dark:text-white">Indy UTC</span>
          </div>
          <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label className="text-sm text-gray-900 dark:text-white">Strategy Name</Label>
              <Input
                className="bg-white dark:bg-[#232326] border border-[#e5e7eb] dark:border-[#4A1515] text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-gray-900 dark:text-white">Direction</Label>
              <Select value={direction} onValueChange={setDirection} disabled={loading}>
                <SelectTrigger className="w-full bg-white dark:bg-[#232326] border border-[#e5e7eb] dark:border-[#4A1515] text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select Direction" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#232326] text-gray-900 dark:text-white">
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-gray-900 dark:text-white">Quantity</Label>
              <Input
                className="bg-white dark:bg-[#232326] border border-[#e5e7eb] dark:border-[#4A1515] text-gray-900 dark:text-white placeholder:text-gray-400"
                type="number"
                min="1"
                step="1"
                placeholder="Enter Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-gray-900 dark:text-white">Asset</Label>
              <Input
                className="bg-white dark:bg-[#232326] border border-[#e5e7eb] dark:border-[#4A1515] text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="e.g. EURUSD"
                value={asset}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (value === '' || /^[A-Z]{0,6}$/.test(value)) {
                    setAsset(value);
                  }
                }}
                onBlur={(e) => {
                  if (!validateAsset(e.target.value)) {
                    toast.error("Asset must be exactly 6 uppercase letters (e.g., EURUSD)");
                  }
                }}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-gray-900 dark:text-white">UTC Session</Label>
              <Select value={utcSession} onValueChange={setUtcSession} disabled={loading}>
                <SelectTrigger className="w-full bg-white dark:bg-[#232326] border border-[#e5e7eb] dark:border-[#4A1515] text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#232326] text-gray-900 dark:text-white">
                  <SelectItem value="london_open">London Open</SelectItem>
                  <SelectItem value="newyork_open">New York Open</SelectItem>
                  <SelectItem value="tokyo_open">Tokyo Open</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-gray-900 dark:text-white">Trading Window Start</Label>
              <Input
                className="bg-white dark:bg-[#232326] border border-[#e5e7eb] dark:border-[#4A1515] text-gray-900 dark:text-white placeholder:text-gray-400"
                type="time"
                value={tradingWindowStart}
                onChange={(e) => setTradingWindowStart(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-gray-900 dark:text-white">Trading Window End</Label>
              <Input
                className="bg-white dark:bg-[#232326] border border-[#e5e7eb] dark:border-[#4A1515] text-gray-900 dark:text-white placeholder:text-gray-400"
                type="time"
                value={tradingWindowEnd}
                onChange={(e) => setTradingWindowEnd(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-gray-900 dark:text-white">Timezone</Label>
              <Input
                className="bg-white dark:bg-[#232326] border border-[#e5e7eb] dark:border-[#4A1515] text-gray-900 dark:text-white placeholder:text-gray-400"
                placeholder="UTC"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm text-gray-900 dark:text-white">Risk Level</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel} disabled={loading}>
                <SelectTrigger className="w-full bg-white dark:bg-[#232326] border border-[#e5e7eb] dark:border-[#4A1515] text-gray-900 dark:text-white">
                  <SelectValue placeholder="Select Risk" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#232326] text-gray-900 dark:text-white">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 mt-6">
              <Button
                className="flex-1 bg-[#4A1515] dark:bg-[#4A1515] hover:bg-[#5A2525] dark:hover:bg-[#5A2525] text-white font-semibold rounded"
                type="submit"
                disabled={loading || !validateAsset(asset)}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="animate-spin">⌛</span>
                    Submitting...
                  </div>
                ) : (
                  "Proceed"
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-[#F59E42] dark:bg-[#D97706] text-white hover:bg-[#B45309] font-semibold rounded"
                type="button"
                onClick={resetForm}
                disabled={loading}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  )
}

