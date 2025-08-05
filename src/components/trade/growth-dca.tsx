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
  // const [accountDetailsOpen, setAccountDetailsOpen] = useState(true)

  // Dialog and selection state
  const [selectedApi, setSelectedApi] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [brokerages, setBrokerages] = useState<BrokerageConnection[]>([])
  const [isBrokeragesLoading, setIsBrokeragesLoading] = useState(true)

  const {
  } = useBotManagement()

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

  const handleProceed = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!selectedApi) {
      // Optionally show an error
      return
    }
    setShowConfirmation(true)
  }

  return (
    <div className="w-full max-w-md mx-auto">
       <AccountDetailsCard
           selectedApi={selectedApi}
           setSelectedApi={setSelectedApi}
           isBrokeragesLoading={isBrokeragesLoading}
           brokerages={brokerages}
         />
      <form className="space-y-4  mt-4 dark:text-white">
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
              <Input placeholder="Enter Name" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="flex gap-2">
                <Input placeholder="Value" />
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
                <Input placeholder="Value" />
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
              <Label className="flex items-center gap-2">
                Duration
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" className="flex-1">Daily</Button>
                <Button variant="outline" className="flex-1">Weekly</Button>
                <Button variant="outline" className="flex-1">Monthly</Button>
                <Button variant="outline" className="flex-1">Hourly</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Book Profit By
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="relative">
                <Input placeholder="Value" />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-sm text-green-500">+ 88 Value</p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525] border border-t-0">
            <span>Advanced Settings</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 rounded-b-md border border-t-0 p-4">
            <div className="space-y-2">
              <Label>Price Trigger Start</Label>
              <div className="flex gap-2">
                <Input placeholder="Value" />
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
                <Input placeholder="Value" />
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
              <Label>Stop Loss By</Label>
              <div className="relative">
                <Input placeholder="Value" />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>


        <div className="flex gap-4">
          <Button
            className="flex-1 bg-[#4A1515] hover:bg-[#5A2525]"
            onClick={handleProceed}
            disabled={!selectedApi}
          >
            Proceed
          </Button>
          <Button variant="outline" className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]">
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

