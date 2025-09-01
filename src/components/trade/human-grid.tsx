'use client'

import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { cn } from "@/lib/utils"
import { AccountDetailsCard } from "@/components/trade/AccountDetailsCard"
import { useEffect } from "react"
import { brokerageService } from "@/api/brokerage"

// import { BrokerageConnection, brokerageService } from "@/api/brokerage"

export default function HumanGrid() {
  const [isOpen, setIsOpen] = React.useState(true)
  const [selectedApi, setSelectedApi] = React.useState("");
  const [isBrokeragesLoading, setIsBrokeragesLoading] = React.useState(false);
  const [brokerages, setBrokerages] = React.useState([]);
  // Form state
  const [name, setName] = React.useState("")
  const [direction, setDirection] = React.useState("both")
  const [quantity, setQuantity] = React.useState("")
  const [asset, setAsset] = React.useState("ETHUSDT")
  const [manualGridLevels, setManualGridLevels] = React.useState("")
  const [customGridSpacing, setCustomGridSpacing] = React.useState("")
  const [manualControl, setManualControl] = React.useState(true)
  const [requireConfirmation, setRequireConfirmation] = React.useState(true)
  const [riskLevel, setRiskLevel] = React.useState("medium")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  // Auth token
  const token = localStorage.getItem("authToken") || "";

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

  const handleProceed = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!selectedApi) {
      setError("Please select an API connection.");
      return;
    }
    if (!name || !quantity || !manualGridLevels || !customGridSpacing) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      const body = {
        name,
        strategy_type: "human_grid",
        provider: "HumanGridService",
        conditions: [
          {
            indicator: "Manual Grid Levels",
            action: "user_defined",
            value: Number(manualGridLevels)
          }
        ],
        direction,
        quantity: Number(quantity),
        asset,
        manual_grid_levels: Number(manualGridLevels),
        custom_grid_spacing: Number(customGridSpacing),
        manual_control: manualControl,
        require_confirmation: requireConfirmation,
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
      setSuccess("Human Grid strategy created successfully!");
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
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525]">
            <span>Human Grid</span>
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
              <Label>Direction</Label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
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
              <Label>Manual Grid Levels</Label>
              <Input placeholder="Manual Grid Levels" value={manualGridLevels} onChange={e => setManualGridLevels(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Custom Grid Spacing</Label>
              <Input placeholder="Custom Grid Spacing" value={customGridSpacing} onChange={e => setCustomGridSpacing(e.target.value)} />
            </div>

            <div className="space-y-2 flex items-center gap-2">
              <Label>Manual Control</Label>
              <input type="checkbox" checked={manualControl} onChange={e => setManualControl(e.target.checked)} />
            </div>

            <div className="space-y-2 flex items-center gap-2">
              <Label>Require Confirmation</Label>
              <input type="checkbox" checked={requireConfirmation} onChange={e => setRequireConfirmation(e.target.checked)} />
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
          <Button variant="outline" className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]" onClick={e => {e.preventDefault(); setName(""); setDirection("both"); setQuantity(""); setAsset("ETHUSDT"); setManualGridLevels(""); setCustomGridSpacing(""); setManualControl(true); setRequireConfirmation(true); setRiskLevel("medium"); setError(""); setSuccess("");}}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}

