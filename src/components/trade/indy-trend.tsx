'use client'

import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// Removed unused import Checkbox
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { cn } from "@/lib/utils"
import { AccountDetailsCard } from "@/components/trade/AccountDetailsCard"
import { useEffect } from "react"

import { brokerageService } from "@/api/brokerage"

export default function IndyTrend() {
  const [isIndyOpen, setIsIndyOpen] = React.useState(true)
  const [selectedApi, setSelectedApi] = React.useState("")
  const [isBrokeragesLoading, setIsBrokeragesLoading] = React.useState(false)
  const [brokerages, setBrokerages] = React.useState([])
  // Form state
  const [name, setName] = React.useState("")
  const [direction, setDirection] = React.useState("buy")
  const [quantity, setQuantity] = React.useState("")
  const [asset, setAsset] = React.useState("BTCUSDT")
  const [trendTimeframe, setTrendTimeframe] = React.useState("4h")
  const [confirmationTimeframe, setConfirmationTimeframe] = React.useState("1h")
  const [trendStrengthThreshold, setTrendStrengthThreshold] = React.useState("")
  const [riskLevel, setRiskLevel] = React.useState("medium")
  const [movingAverage, setMovingAverage] = React.useState("")
  const [rsi, setRsi] = React.useState("")
  const [operator, setOperator] = React.useState("AND")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  // Auth token
  const token = localStorage.getItem("authToken") || "";

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

  const handleProceed = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedApi) {
      setError("Please select an API connection.");
      return;
    }
    if (!name || !quantity || !movingAverage || !rsi || !trendStrengthThreshold) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      const body = {
        name,
        strategy_type: "indy_trend",
        provider: "IndyTrendService",
        conditions: [
          {
            indicator: "Moving Average",
            action: "crosses_above",
            value: Number(movingAverage)
          },
          {
            indicator: "RSI",
            action: "greater_than",
            value: Number(rsi)
          }
        ],
        operators: [operator],
        direction,
        quantity: Number(quantity),
        asset,
        trend_timeframe: trendTimeframe,
        confirmation_timeframe: confirmationTimeframe,
        trend_strength_threshold: Number(trendStrengthThreshold),
        risk_level: riskLevel,
        api_id: selectedApi
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/strategies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create strategy.");
      }
      setSuccess("Indy Trend strategy created successfully!");
    } catch (err: any) {
      setError(err.message || "Error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <AccountDetailsCard
        selectedApi={selectedApi}
        setSelectedApi={setSelectedApi}
        isBrokeragesLoading={isBrokeragesLoading}
        brokerages={brokerages}
      />
      <form className="space-y-4 mt-4 dark:text-white">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}
        <Collapsible open={isIndyOpen} onOpenChange={setIsIndyOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between border border-t-0 rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525]">
            <span>Indy Trend</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isIndyOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 rounded-b-md border border-t-0 p-4">
            <div className="space-y-2">
              <Label>Strategy Name</Label>
              <Input placeholder="Enter Name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Direction</Label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Asset</Label>
              <Input placeholder="Asset" value={asset} onChange={e => setAsset(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Trend Timeframe</Label>
              <Input placeholder="4h" value={trendTimeframe} onChange={e => setTrendTimeframe(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Confirmation Timeframe</Label>
              <Input placeholder="1h" value={confirmationTimeframe} onChange={e => setConfirmationTimeframe(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Trend Strength Threshold</Label>
              <Input placeholder="70" value={trendStrengthThreshold} onChange={e => setTrendStrengthThreshold(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Moving Average (crosses above)</Label>
              <Input placeholder="50" value={movingAverage} onChange={e => setMovingAverage(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>RSI (greater than)</Label>
              <Input placeholder="60" value={rsi} onChange={e => setRsi(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Operator</Label>
              <Select value={operator} onValueChange={setOperator}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-4">
          <Button className="flex-1 bg-[#4A1515] text-white hover:bg-[#5A2525]" onClick={handleProceed} disabled={loading || !selectedApi}>
            {loading ? "Processing..." : "Proceed"}
          </Button>
          <Button variant="outline" className="flex-1" onClick={e => {e.preventDefault(); setName(""); setDirection("buy"); setQuantity(""); setAsset("BTCUSDT"); setTrendTimeframe("4h"); setConfirmationTimeframe("1h"); setTrendStrengthThreshold(""); setMovingAverage(""); setRsi(""); setOperator("AND"); setRiskLevel("medium"); setError(""); setSuccess("");}}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}

