'use client'
import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { AccountDetailsCard } from "@/components/trade/AccountDetailsCard"
import { brokerageService, BrokerageConnection } from "@/api/brokerage"

export default function PriceAction() {
  const [isOpen, setIsOpen] = useState(true)
  const [selectedApi, setSelectedApi] = useState("")
  const [isBrokeragesLoading, setIsBrokeragesLoading] = useState(false)
  const [brokerages, setBrokerages] = useState<BrokerageConnection[]>([])
  // Added missing state for segment and pair
  const [segment, setSegment] = useState("Delivery/Spot/Cash")
  const [pair, setPair] = useState("BTCUSDT")
  // Form state
  const [name, setName] = useState("")
  const [direction, setDirection] = useState("buy")
  const [quantity, setQuantity] = useState("")
  const [asset, setAsset] = useState("BTCUSDT")
  const [timeframe, setTimeframe] = useState("4h")
  const [patternConfidence, setPatternConfidence] = useState("")
  const [supportResistanceStrength, setSupportResistanceStrength] = useState("")
  const [breakoutThreshold, setBreakoutThreshold] = useState("")
  const [riskLevel, setRiskLevel] = useState("medium")
  const [supportLevel, setSupportLevel] = useState("")
  const [candlestickPattern, setCandlestickPattern] = useState("")
  const [operator, setOperator] = useState("AND")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
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
    if (!name || !quantity || !supportLevel || !candlestickPattern || !patternConfidence || !supportResistanceStrength || !breakoutThreshold) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      const body = {
        name,
        strategy_type: "price_action",
        provider: "PriceActionService",
        conditions: [
          {
            indicator: "Support Level",
            action: "bounces_off",
            value: Number(supportLevel)
          },
          {
            indicator: "Candlestick Pattern",
            action: "bullish_engulfing",
            value: Number(candlestickPattern)
          }
        ],
        operators: [operator],
        direction,
        quantity: Number(quantity),
        asset,
        timeframe,
        pattern_confidence: Number(patternConfidence),
        support_resistance_strength: Number(supportResistanceStrength),
        breakout_threshold: Number(breakoutThreshold),
        risk_level: riskLevel,
        api_id: selectedApi,
        segment,
        pair
      };
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${baseUrl}/strategies`, {
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
      setSuccess("Price Action strategy created successfully!");
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
        segment={segment}
        setSegment={setSegment}
        pair={pair}
        setPair={setPair}
      />
      <form className="space-y-4 mt-4 dark:text-white">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white  border border-t-0 hover:bg-[#5A2525]">
            <span>Price Action</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
              <Label>Timeframe</Label>
              <Input placeholder="4h" value={timeframe} onChange={e => setTimeframe(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Pattern Confidence</Label>
              <Input placeholder="80" value={patternConfidence} onChange={e => setPatternConfidence(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Support Resistance Strength</Label>
              <Input placeholder="3" value={supportResistanceStrength} onChange={e => setSupportResistanceStrength(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Breakout Threshold</Label>
              <Input placeholder="1.5" value={breakoutThreshold} onChange={e => setBreakoutThreshold(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Support Level (bounces off)</Label>
              <Input placeholder="45000" value={supportLevel} onChange={e => setSupportLevel(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Candlestick Pattern (bullish engulfing)</Label>
              <Input placeholder="1" value={candlestickPattern} onChange={e => setCandlestickPattern(e.target.value)} />
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
          <Button className="flex-1 bg-[#4A1515] hover:bg-[#5A2525]" onClick={handleProceed} disabled={loading || !selectedApi}>
            {loading ? "Processing..." : "Proceed"}
          </Button>
          <Button variant="outline" className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]" onClick={e => {
            e.preventDefault();
            setName("");
            setDirection("buy");
            setQuantity("");
            setAsset("BTCUSDT");
            setTimeframe("4h");
            setPatternConfidence("");
            setSupportResistanceStrength("");
            setBreakoutThreshold("");
            setSupportLevel("");
            setCandlestickPattern("");
            setOperator("AND");
            setRiskLevel("medium");
            setError("");
            setSuccess("");
            setSegment("Delivery/Spot/Cash");
            setPair("BTCUSDT");
          }}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}

