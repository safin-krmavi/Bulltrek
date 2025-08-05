'use client'

import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { AccountDetailsCard } from "@/components/trade/AccountDetailsCard"
import { brokerageService } from "@/api/brokerage"

export default function IndyLESI() {
  const [isOpen, setIsOpen] = React.useState(true)
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
    <div className="w-full max-w-md mx-auto">
         <AccountDetailsCard
     selectedApi={selectedApi}
     setSelectedApi={setSelectedApi}
     isBrokeragesLoading={isBrokeragesLoading}
     brokerages={brokerages}
   />
      <form className="space-y-4 mt-4 dark:text-white ">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex w-full items-center  border border-t-0 justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525]">
            <span>Indy LESI</span>
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
                <Input placeholder="Value" />
                <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Time Frame
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <Select defaultValue="5m">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Leverage</Label>
              <Input placeholder="Value" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Lower Limit</Label>
                <div className="flex gap-2">
                  <Input placeholder="Value" />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Upper Limit</Label>
                <div className="flex gap-2">
                  <Input placeholder="Value" />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price Trigger Start</Label>
              <div className="flex gap-2">
                <Input placeholder="Value" />
                <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price Trigger Stop</Label>
              <div className="flex gap-2">
                <Input placeholder="Value" />
                <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
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

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525] border border-t-0">
            <span>Advanced Settings</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-6 rounded-b-md border border-t-0 p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="lc" />
                <Label htmlFor="lc">LC</Label>
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
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="ema" />
                <Label htmlFor="ema">EMA</Label>
              </div>
              <div className="space-y-2">
                <Label>Length</Label>
                <Input defaultValue="200" />
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
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="larsi" />
                <Label htmlFor="larsi">LaRSI</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Source
                    <span className="text-muted-foreground">ⓘ</span>
                  </Label>
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
                  <Label>Alpha</Label>
                  <Input defaultValue="0.2" />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-4">
          <Button className="flex-1 bg-[#4A1515] hover:bg-[#5A2525]">Proceed</Button>
          <Button variant="outline" className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]">
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}

