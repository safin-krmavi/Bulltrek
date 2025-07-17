'use client'

import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Checkbox } from "@/components/ui/checkbox"
import { AccountDetailsCard } from "@/components/trade/AccountDetailsCard"
import { useEffect } from "react"

import { brokerageService } from "@/api/brokerage"

export default function IndyTrend() {
  const [isIndyOpen, setIsIndyOpen] = React.useState(true)
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)
  // const [accountDetailsOpen, setAccountDetailsOpen] = React.useState(true)
  const [selectedApi, setSelectedApi] = React.useState("")
  const [isBrokeragesLoading, setIsBrokeragesLoading] = React.useState(false)
  const [brokerages, setBrokerages] = React.useState([])

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

  return (
    <div>
      <AccountDetailsCard
        selectedApi={selectedApi}
        setSelectedApi={setSelectedApi}
        isBrokeragesLoading={isBrokeragesLoading}
        brokerages={brokerages}
      />
      <form className="space-y-4 p-4">
        <Collapsible
          open={isIndyOpen}
          onOpenChange={setIsIndyOpen}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1C24] text-white p-4 font-medium hover:bg-[#5A2525] transition-colors duration-200">
            <span>Indy Trend</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isIndyOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 rounded-b-md border border-border border-t-0 bg-card p-4">
            <div className="space-y-2">
              <Label htmlFor="strategy">Strategy Name</Label>
              <Input id="strategy" placeholder="Enter Name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="investment">Investment</Label>
              <div className="relative">
                <Input id="investment" placeholder="Value" />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">USTD</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment-cap">Investment CAP</Label>
              <div className="relative">
                <Input id="investment-cap" placeholder="Value" />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">USTD</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Leverage</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input placeholder="Lower Limit" />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">USTD</span>
                </div>
                <div className="relative">
                  <Input placeholder="Upper Limit" />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">USTD</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price Trigger</Label>
              <div className="space-y-4">
                <div className="relative">
                  <Input placeholder="Start Value" />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">USTD</span>
                </div>
                <div className="relative">
                  <Input placeholder="Stop Value" />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">USTD</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stop-loss">Stop Loss By</Label>
              <div className="relative">
                <Input id="stop-loss" placeholder="Value" />
                <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">USTD</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible
          open={isAdvancedOpen}
          onOpenChange={setIsAdvancedOpen}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-primary p-4 font-medium text-primary-foreground hover:bg-primary/90">
            <span>Advanced Settings</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 rounded-b-md border border-border border-t-0 bg-card p-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="supertread" />
              <Label htmlFor="supertread">Supertread</Label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button variant="outline" size="sm">Neutral</Button>
              <Button variant="outline" size="sm">Long</Button>
              <Button variant="outline" size="sm">Short</Button>
            </div>

            {['RSI 1', 'RSI 2', 'RSI 3', 'ADX'].map((item, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id={item.toLowerCase().replace(' ', '-')} />
                  <Label htmlFor={item.toLowerCase().replace(' ', '-')}>{item}</Label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <Input defaultValue="21" />
                  </div>
                  <div className="space-y-2">
                    <Label>Source</Label>
                    <Select defaultValue="close">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="close">Close</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timeframe</Label>
                    <Input defaultValue="6S" />
                  </div>
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <div className="flex justify-center gap-4 pt-2">
          <Button className="w-fit px-6 bg-[#4A1C24] hover:bg-[#5A2525] text-white shadow-md transition-colors duration-200">Proceed</Button>
          <Button className="w-fit px-4 bg-[#D97706] hover:bg-[#B45309] text-white shadow-md transition-colors duration-200">Reset</Button>
        </div>
      </form>
    </div>
  )
}

