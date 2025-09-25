'use client'

import * as React from "react"
import { ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"
import { AccountDetailsCard } from "@/components/trade/AccountDetailsCard"
import { brokerageService } from "@/api/brokerage"

export default function SmartGrid() {
  const [isOpen, setIsOpen] = React.useState(true)
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)
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
      <form className="space-y-4 mt-4 dark:text-white">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-t-md bg-[#4A1515] p-4 border border-t-0 font-medium text-white hover:bg-[#5A2525]">
            <span>Smart Grid</span>
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
              <Label>Select Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline">Neutral</Button>
                <Button variant="outline">Long</Button>
                <Button variant="outline">Short</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Data Set
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="grid grid-cols-5 gap-2">
                <Button variant="outline" size="sm">3D</Button>
                <Button variant="outline" size="sm">7D</Button>
                <Button variant="outline" size="sm">30D</Button>
                <Button variant="outline" size="sm">180D</Button>
                <Button variant="outline" size="sm">365D</Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Lower Limit
                  <span className="text-muted-foreground">ⓘ</span>
                </Label>
                <div className="flex gap-2">
                  <Input placeholder="Value" />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Upper Limit
                  <span className="text-muted-foreground">ⓘ</span>
                </Label>
                <div className="flex gap-2">
                  <Input placeholder="Value" />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Levels</Label>
              <Input placeholder="Value" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Profit per Level
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input placeholder="Value" />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                </div>
                <div className="relative">
                  <Input placeholder="Value" />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                </div>
              </div>
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
            </div>

            <div className="space-y-2">
              <Label>Minimum Investment</Label>
              <Input placeholder="Value" />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between border border-t-0 rounded-t-md bg-[#4A1515] p-4 font-medium text-white hover:bg-[#5A2525]">
            <span>Advanced Settings</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 rounded-b-md border border-t-0 p-4">
            <div className="space-y-2">
              <Label>Stop Grid Loss</Label>
              <div className="flex gap-2">
                <Input placeholder="Numeric Value" />
                <Select defaultValue="point-9">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Point 9" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="point-9">Point 9</SelectItem>
                    <SelectItem value="point-8">Point 8</SelectItem>
                    <SelectItem value="point-7">Point 7</SelectItem>
                  </SelectContent>
                </Select>
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