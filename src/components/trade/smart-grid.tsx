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

interface Brokerage {
  id: string;
  name: string;
}

interface FormData {
  strategyName: string;
  type: 'neutral' | 'long' | 'short';
  dataSet: '3D' | '7D' | '30D' | '180D' | '365D';
  lowerLimit: string;
  upperLimit: string;
  levels: string;
  profitPerLevelMin: string;
  profitPerLevelMax: string;
  investment: string;
  minimumInvestment: string;
  stopGridLoss: string;
  stopGridPoint: string;
}

export default function SmartGrid() {
  // Main states
  const [isOpen, setIsOpen] = React.useState(true)
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false)
  const [selectedApi, setSelectedApi] = React.useState("")
  const [isBrokeragesLoading, setIsBrokeragesLoading] = React.useState(false)
  const [brokerages, setBrokerages] = React.useState<Brokerage[]>([])
  const [segment, setSegment] = React.useState("")
  const [pair, setPair] = React.useState("")

  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    strategyName: "",
    type: "neutral",
    dataSet: "3D",
    lowerLimit: "",
    upperLimit: "",
    levels: "",
    profitPerLevelMin: "",
    profitPerLevelMax: "",
    investment: "",
    minimumInvestment: "",
    stopGridLoss: "",
    stopGridPoint: "point-9"
  })

  // Effect for fetching brokerages
  React.useEffect(() => {
    async function fetchBrokerages() {
      setIsBrokeragesLoading(true)
      try {
        const res = await brokerageService.getBrokerageDetails()
        setBrokerages(res.data.data || [])
      } catch (error: any) {
        console.error('Failed to fetch brokerages:', error)
        setBrokerages([])
        toast.error("Failed to fetch brokerages")
      } finally {
        setIsBrokeragesLoading(false)
      }
    }
    fetchBrokerages()
  }, [])

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTypeSelect = (type: FormData['type']) => {
    setFormData(prev => ({
      ...prev,
      type
    }))
  }

  const handleDataSetSelect = (dataSet: FormData['dataSet']) => {
    setFormData(prev => ({
      ...prev,
      dataSet
    }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.strategyName.trim()) {
      toast.error("Strategy name is required")
      return
    }

    if (!formData.lowerLimit || !formData.upperLimit) {
      toast.error("Limits are required")
      return
    }

    try {
      // Your form submission logic here
      toast.success("Strategy created successfully")
      resetForm()
    } catch (error: any) {
      toast.error(error?.message || "Failed to create strategy")
    }
  }

  const resetForm = () => {
    setFormData({
      strategyName: "",
      type: "neutral",
      dataSet: "3D",
      lowerLimit: "",
      upperLimit: "",
      levels: "",
      profitPerLevelMin: "",
      profitPerLevelMax: "",
      investment: "",
      minimumInvestment: "",
      stopGridLoss: "",
      stopGridPoint: "point-9"
    })
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
      <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 dark:text-white">
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
              <Input 
                name="strategyName"
                value={formData.strategyName}
                onChange={handleInputChange}
                placeholder="Enter Name" 
              />
            </div>

            <div className="space-y-2">
              <Label>Select Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline"
                  onClick={() => handleTypeSelect('neutral')}
                  className={formData.type === 'neutral' ? 'bg-[#5A2525]' : ''}
                >
                  Neutral
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleTypeSelect('long')}
                  className={formData.type === 'long' ? 'bg-[#5A2525]' : ''}
                >
                  Long
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleTypeSelect('short')}
                  className={formData.type === 'short' ? 'bg-[#5A2525]' : ''}
                >
                  Short
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Data Set
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="grid grid-cols-5 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDataSetSelect('3D')}
                  className={formData.dataSet === '3D' ? 'bg-[#5A2525]' : ''}
                >
                  3D
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDataSetSelect('7D')}
                  className={formData.dataSet === '7D' ? 'bg-[#5A2525]' : ''}
                >
                  7D
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDataSetSelect('30D')}
                  className={formData.dataSet === '30D' ? 'bg-[#5A2525]' : ''}
                >
                  30D
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDataSetSelect('180D')}
                  className={formData.dataSet === '180D' ? 'bg-[#5A2525]' : ''}
                >
                  180D
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDataSetSelect('365D')}
                  className={formData.dataSet === '365D' ? 'bg-[#5A2525]' : ''}
                >
                  365D
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Lower Limit
                  <span className="text-muted-foreground">ⓘ</span>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    name="lowerLimit"
                    value={formData.lowerLimit}
                    onChange={handleInputChange}
                    placeholder="Value" 
                  />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Upper Limit
                  <span className="text-muted-foreground">ⓘ</span>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    name="upperLimit"
                    value={formData.upperLimit}
                    onChange={handleInputChange}
                    placeholder="Value" 
                  />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Levels</Label>
              <Input 
                name="levels"
                value={formData.levels}
                onChange={handleInputChange}
                placeholder="Value" 
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Profit per Level
                <span className="text-muted-foreground">ⓘ</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input 
                    name="profitPerLevelMin"
                    value={formData.profitPerLevelMin}
                    onChange={handleInputChange}
                    placeholder="Value" 
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                </div>
                <div className="relative">
                  <Input 
                    name="profitPerLevelMax"
                    value={formData.profitPerLevelMax}
                    onChange={handleInputChange}
                    placeholder="Value" 
                  />
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
                <Input 
                  name="investment"
                  value={formData.investment}
                  onChange={handleInputChange}
                  placeholder="Value" 
                />
                <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Minimum Investment</Label>
              <Input 
                name="minimumInvestment"
                value={formData.minimumInvestment}
                onChange={handleInputChange}
                placeholder="Value" 
              />
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
                <Input 
                  name="stopGridLoss"
                  value={formData.stopGridLoss}
                  onChange={handleInputChange}
                  placeholder="Numeric Value" 
                />
                <Select 
                  name="stopGridPoint"
                  value={formData.stopGridPoint}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stopGridPoint: value }))}
                  defaultValue="point-9"
                >
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
          <Button 
            type="submit" 
            className="flex-1 bg-[#4A1515] hover:bg-[#5A2525]"
          >
            Proceed
          </Button>
          <Button 
            type="button"
            variant="outline" 
            className="flex-1 bg-[#D97706] text-white hover:bg-[#B45309]"
            onClick={resetForm}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  )
}