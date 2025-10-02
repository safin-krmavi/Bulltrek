'use client'

import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { AccountDetailsCard } from "@/components/trade/AccountDetailsCard"
import { brokerageService } from "@/api/brokerage"
import { ErrorBoundary } from 'react-error-boundary'

interface Strategy {
  name: string;
  strategy_type: string;
  provider: string;
  investment: number;
  investment_cap: number;
  risk_level: string;
  price_trigger_start: number;
  price_trigger_stop: number;
  take_profit: number;
  stop_loss: number;
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

export default function PriceAction() {
  // State for collapsible sections
  const [isOpen, setIsOpen] = React.useState(true)
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)

  // Account Details States
  const [selectedApi, setSelectedApi] = React.useState("")
  const [isBrokeragesLoading, setIsBrokeragesLoading] = React.useState(false)
  const [brokerages, setBrokerages] = React.useState([])
  const [segment, setSegment] = React.useState("")
  const [pair, setPair] = React.useState("")

  // Form States
  const [strategyName, setStrategyName] = React.useState("")
  const [investment, setInvestment] = React.useState("")
  const [investmentCap, setInvestmentCap] = React.useState("")
  const [riskLevel, setRiskLevel] = React.useState("safe")
  const [priceTriggerStart, setPriceTriggerStart] = React.useState("")
  const [priceTriggerStop, setPriceTriggerStop] = React.useState("")
  const [takeProfit, setTakeProfit] = React.useState("")
  const [stopLoss, setStopLoss] = React.useState("")
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

  const resetForm = React.useCallback(() => {
    setStrategyName("");
    setInvestment("");
    setInvestmentCap("");
    setRiskLevel("safe");
    setPriceTriggerStart("");
    setPriceTriggerStop("");
    setTakeProfit("");
    setStopLoss("");
  }, []);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedApi) {
      toast.error("Please select an API first");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const strategy: Strategy = {
        name: strategyName,
        strategy_type: "price_action",
        provider: "PriceActionService",
        investment: Number(investment),
        investment_cap: Number(investmentCap),
        risk_level: riskLevel,
        price_trigger_start: Number(priceTriggerStart),
        price_trigger_stop: Number(priceTriggerStop),
        take_profit: Number(takeProfit),
        stop_loss: Number(stopLoss)
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/strategies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(strategy),
      });

      if (!response.ok) {
        const errorData = await response.json();
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
  }, [selectedApi, strategyName, investment, investmentCap, riskLevel, priceTriggerStart, priceTriggerStop, takeProfit, stopLoss, resetForm]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
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
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525]">
              <span>Price Action</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 rounded-b-md border border-t-0 p-4">
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="bg-[#D97706] text-white hover:bg-[#B45309]">
                  Safe
                </Button>
                <Button variant="outline">Moderate</Button>
                <Button variant="outline">Risky</Button>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Strategy Name
                  <span className="text-muted-foreground">ⓘ</span>
                </Label>
                <Input placeholder="Enter Name" value={strategyName} onChange={(e) => setStrategyName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Investment
                  <span className="text-muted-foreground">ⓘ</span>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Value" 
                    value={investment} 
                    onChange={(e) => setInvestment(e.target.value)} 
                    disabled={loading}
                  />
                  <Select defaultValue="USTD">
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
                    onChange={(e) => setInvestmentCap(e.target.value)} 
                    disabled={loading}
                  />
                  <Select defaultValue="USTD">
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USTD">USTD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525]">
              <span>Advanced Settings</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 rounded-b-md border border-t-0 p-4">
              <div className="space-y-2">
                <Label>Price Trigger Start</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Value" 
                    value={priceTriggerStart} 
                    onChange={(e) => setPriceTriggerStart(e.target.value)} 
                    disabled={loading}
                  />
                  <Select defaultValue="USTD">
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
                  <Input 
                    placeholder="Value" 
                    value={priceTriggerStop} 
                    onChange={(e) => setPriceTriggerStop(e.target.value)} 
                    disabled={loading}
                  />
                  <Select defaultValue="USTD">
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
                <Label>Take Profit</Label>
                <div className="relative">
                  <Input 
                    placeholder="Value" 
                    value={takeProfit} 
                    onChange={(e) => setTakeProfit(e.target.value)} 
                    disabled={loading}
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Stop Loss By</Label>
                <div className="relative">
                  <Input 
                    placeholder="Value" 
                    value={stopLoss} 
                    onChange={(e) => setStopLoss(e.target.value)} 
                    disabled={loading}
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex gap-4">
            <Button 
              type="submit"
              className="flex-1 bg-[#4A1515] hover:bg-[#5A2525]"
              disabled={loading}
            >
              {loading ? "Processing..." : "Proceed"}
            </Button>
            <Button 
              type="button"
              variant="outline" 
              className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]"
              disabled={loading}
              onClick={resetForm}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  )
}