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
import { useEffect, useState } from "react"
import { brokerageService } from "@/api/brokerage"
import { Dialog, DialogContent } from "@/components/ui/dialog"; // Use your modal/dialog component

// import { BrokerageConnection, brokerageService } from "@/api/brokerage"

export default function HumanGrid() {
  const [apiError, setApiError] = useState("");
  const [isOpen, setIsOpen] = React.useState(true)
  const [selectedApi, setSelectedApi] = React.useState("");
  const [isBrokeragesLoading, setIsBrokeragesLoading] = React.useState(false);
  const [brokerages, setBrokerages] = React.useState([]);
  const [segment, setSegment] = React.useState("Delivery/Spot/Cash");
  const [pair, setPair] = React.useState("BTCUSDT");
  const [strategyName, setStrategyName] = useState("");
  const [investment, setInvestment] = useState("");
  const [investmentCap, setInvestmentCap] = useState("");
  const [lowerLimit, setLowerLimit] = useState("");
  const [upperLimit, setUpperLimit] = useState("");
  const [leverage, setLeverage] = useState("");
  const [direction, setDirection] = useState("Long");
  const [entryInterval, setEntryInterval] = useState("");
  const [bookProfitBy, setBookProfitBy] = useState("");
  const [stopLossBy, setStopLossBy] = useState("");
  const [showPopup, setShowPopup] = useState(false);

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
    setApiError(""); // Clear previous errors
    // Prepare payload
    const payload = {
      strategy_name: strategyName,
      api_connection_id: Number(selectedApi),
      segment,
      pair,
      investment: Number(investment),
      investment_cap: Number(investmentCap),
      lower_limit: Number(lowerLimit),
      upper_limit: Number(upperLimit),
      leverage: Number(leverage),
      direction,
      entry_interval: Number(entryInterval),
      book_profit_by: Number(bookProfitBy),
      stop_loss_by: Number(stopLossBy)
    };
    // Get token
    const accessToken = localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token");
    const baseUrl = import.meta.env.VITE_API_URL;
    const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
    // API call
    const res = await fetch(`${baseUrl}/human-grid/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (res.status === 201) {
      setShowPopup(true); // Show popup only on success
    } else {
      const err = await res.json();
      setApiError(err.message || "An error occurred.");
      setShowPopup(false); // Do NOT show popup on error
    }
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
        pair={pair}
        setPair={setPair}
      />
      <form className="space-y-4 mt-4 dark:text-white">
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
              <div className="flex gap-2">
                <Input placeholder="Value" value={strategyName} onChange={(e) => setStrategyName(e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="flex gap-2">
                <Input placeholder="Value" value={investment} onChange={(e) => setInvestment(e.target.value)} />
                <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
              </div>
              <p className="text-sm text-orange-500">Avbl: 389 USTD</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment CAP
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="flex gap-2">
                <Input placeholder="Value" value={investmentCap} onChange={(e) => setInvestmentCap(e.target.value)} />
                <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lower Limit</Label>
                <div className="flex gap-2">
                  <Input placeholder="Value" value={lowerLimit} onChange={(e) => setLowerLimit(e.target.value)} />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Upper Limit</Label>
                <div className="flex gap-2">
                  <Input placeholder="Value" value={upperLimit} onChange={(e) => setUpperLimit(e.target.value)} />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Leverage</Label>
                <Input placeholder="Value" value={leverage} onChange={(e) => setLeverage(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select defaultValue="Long" value={direction} onValueChange={setDirection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Long">Long</SelectItem>
                    <SelectItem value="Short">Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Entry Interval
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="relative">
                <Input placeholder="Value" value={entryInterval} onChange={(e) => setEntryInterval(e.target.value)} />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">Pts</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Book Profit By
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Input placeholder="Value" value={bookProfitBy} onChange={(e) => setBookProfitBy(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Stop Loss By</Label>
              <div className="relative">
                <Input placeholder="Value" value={stopLossBy} onChange={(e) => setStopLossBy(e.target.value)} />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <p className="text-sm text-green-500">Estimated Net PnL of trade: + 88 Value</p>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-4">
          <Button className="flex-1 bg-[#4A1515] hover:bg-[#5A2525]" onClick={handleProceed}>Proceed</Button>
          <Button variant="outline" className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]">
            Reset
          </Button>
        </div>
      </form>

      {/* Success Popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
  <DialogContent className="max-w-xl bg-white rounded-xl border border-gray-300 shadow-lg p-6">
    {apiError && (
      <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
        {apiError}
      </div>
    )}
    <h2 className="text-lg font-bold text-[#D97706] mb-2">Account Details</h2>
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2 text-sm">
      <div>
        <span className="font-semibold">API Key:</span>
        <span className="ml-2">{selectedApi || "API Connection Name"}</span>
      </div>
      <div>
        <span className="font-semibold">Coin/Stock/Pairs:</span>
        <span className="ml-2">{pair || "Name equal Pairs"}</span>
      </div>
    </div>
    <hr className="my-2 border-dashed" />
    <h2 className="text-lg font-bold text-[#D97706] mb-2">Human Grid Details</h2>
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2 text-sm">
      <div>
        <span className="font-semibold">Strategy Name:</span>
        <span className="ml-2">{strategyName}</span>
      </div>
      <div>
        <span className="font-semibold">Investment:</span>
        <span className="ml-2">{investment} USTD</span>
      </div>
      <div>
        <span className="font-semibold">Investment CAP:</span>
        <span className="ml-2">{investmentCap} USTD</span>
      </div>
      <div>
        <span className="font-semibold">Lower Limit:</span>
        <span className="ml-2">{lowerLimit} USTD</span>
      </div>
      <div>
        <span className="font-semibold">Upper Limit:</span>
        <span className="ml-2">{upperLimit} USTD</span>
      </div>
      <div>
        <span className="font-semibold">Leverage:</span>
        <span className="ml-2">{leverage}</span>
      </div>
      <div>
        <span className="font-semibold">Direction:</span>
        <span className="ml-2">{direction}</span>
      </div>
      <div>
        <span className="font-semibold">Entry Interval:</span>
        <span className="ml-2">{entryInterval} Pts</span>
      </div>
      <div>
        <span className="font-semibold">Book Profit By:</span>
        <span className="ml-2">{bookProfitBy}</span>
      </div>
      <div>
        <span className="font-semibold">Stop Loss By:</span>
        <span className="ml-2">{stopLossBy}%</span>
      </div>
    </div>
    <div className="my-4">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="accent-[#4A1515]" />
        *I Agree Bulltrek's Terms & Conditions, Privacy policy and disclaimers
      </label>
    </div>
    <div className="flex gap-3 mt-2 w-full justify-center">
      <Button className="bg-[#4A1515] text-white px-6 py-2 rounded font-semibold">Run On Live Market</Button>
      <Button className="bg-[#4A1515] text-white px-6 py-2 rounded font-semibold">Edit</Button>
      <Button className="bg-[#4A1515] text-white px-6 py-2 rounded font-semibold">Publish</Button>
      <Button className="bg-[#D97706] text-white px-6 py-2 rounded font-semibold">Backtest</Button>
    </div>
    <p className="mt-4 text-xs text-center text-gray-500">** For Buttons see respective user **</p>
  </DialogContent>
</Dialog>
    </div>
  )
}