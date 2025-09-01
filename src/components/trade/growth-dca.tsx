'use client'

import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TradeConfirmationDialog } from "@/components/trade/trade-confirmation-dialog"
// Removed unused import useBotManagement
import { useEffect, useState } from "react"
import { BrokerageConnection, brokerageService } from "@/api/brokerage"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { AccountDetailsCard } from "./AccountDetailsCard"

export default function GrowthDCA() {
  const [isOpen, setIsOpen] = React.useState(true)
  // Removed unused state isAdvancedOpen, setIsAdvancedOpen
  // Dialog and selection state
  const [selectedApi, setSelectedApi] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [brokerages, setBrokerages] = useState<BrokerageConnection[]>([])
  const [isBrokeragesLoading, setIsBrokeragesLoading] = useState(true)

  // Strategy form state
  const [name, setName] = useState("")
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [asset, setAsset] = useState("BTCUSDT")
  const [quantity, setQuantity] = useState("")
  const [frequency, setFrequency] = useState("daily")
  const [riskLevel, setRiskLevel] = useState("low")
  const [direction, setDirection] = useState("buy")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Auth token (replace with your actual hook/context)
  // Example: const { token } = useAuth()
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
    if (!name || !investmentAmount || !quantity) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      // Step 1: Validate investment
      const validateRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/growth-dca/validate-investment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(investmentAmount),
          frequency,
          asset
        })
      });
      if (!validateRes.ok) {
        const err = await validateRes.json();
        throw new Error(err.message || "Investment validation failed.");
      }

      // Step 2: Create strategy
      const body = {
        name,
        strategy_type: "growth_dca",
        provider: "DcaBotService",
        conditions: [
          {
            indicator: "Time Interval",
            action: "equals",
            value: frequency === "daily" ? 24 : frequency === "weekly" ? 168 : frequency === "monthly" ? 720 : frequency === "hourly" ? 1 : 24
          }
        ],
        direction,
        quantity: Number(quantity),
        asset,
        start_time: startTime || "09:00",
        end_time: endTime || "17:00",
        investment_amount: Number(investmentAmount),
        frequency,
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
      setSuccess("Strategy created successfully!");
      setShowConfirmation(true);
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
              <Input placeholder="Enter Name" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment Amount
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Input placeholder="Value" value={investmentAmount} onChange={e => setInvestmentAmount(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Quantity
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Input placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Asset
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Input placeholder="Asset" value={asset} onChange={e => setAsset(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Frequency
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {['daily', 'weekly', 'monthly', 'hourly'].map(f => (
                  <Button
                    key={f}
                    variant={frequency === f ? "default" : "outline"}
                    className="flex-1"
                    onClick={e => { e.preventDefault(); setFrequency(f); }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Direction
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Risk Level
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Start Time
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Input placeholder="09:00" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                End Time
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Input placeholder="17:00" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-4">
          <Button
            className="flex-1 bg-[#4A1515] hover:bg-[#5A2525]"
            onClick={handleProceed}
            disabled={!selectedApi || loading}
          >
            {loading ? "Processing..." : "Proceed"}
          </Button>
          <Button variant="outline" className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]" onClick={e => {e.preventDefault(); setName(""); setInvestmentAmount(""); setAsset("BTCUSDT"); setQuantity(""); setFrequency("daily"); setRiskLevel("low"); setDirection("buy"); setStartTime(""); setEndTime(""); setError(""); setSuccess("");}}>
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

