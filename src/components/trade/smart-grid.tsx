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
import { TradeConfirmationDialog, StrategyType } from "@/components/trade/trade-confirmation-dialog"
import { brokerageService } from "@/api/brokerage"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"

interface Brokerage {
  id: string;
  name: string;
}

interface FormData {
  strategyName: string;
  type: 'Neutral' | 'Long' | 'Short';
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
  const [segment, setSegment] = React.useState("Delivery/Spot/Cash")
  const [pair, setPair] = React.useState("BTCUSDT")
  
  // ✅ Added states for confirmation dialog and loading
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")
  const [strategyId, setStrategyId] = useState<string | null>(null) // ✅ Added for ID storage

  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    strategyName: "",
    type: "Neutral",
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
  useEffect(() => {
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

  // ✅ Updated form submit handler to use TradeConfirmationDialog with ID capture
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError("") // Clear previous errors

    // ✅ Enhanced validation
    if (!selectedApi) {
      setApiError("Please select an API connection")
      toast.error("Please select an API connection")
      return
    }

    if (!formData.strategyName.trim()) {
      setApiError("Strategy name is required")
      toast.error("Strategy name is required")
      return
    }

    if (!formData.lowerLimit || !formData.upperLimit || !formData.levels || !formData.investment) {
      setApiError("Please fill in all required fields")
      toast.error("Please fill in all required fields")
      return
    }

    // ✅ Validate numeric fields
    if (isNaN(Number(formData.lowerLimit)) || isNaN(Number(formData.upperLimit)) || 
        isNaN(Number(formData.levels)) || isNaN(Number(formData.investment))) {
      setApiError("Please enter valid numeric values")
      toast.error("Please enter valid numeric values")
      return
    }

    setLoading(true)
    
    try {
      // Prepare payload for Smart Grid strategy
      const payload = {
        strategy_name: formData.strategyName,
        api_connection_id: Number(selectedApi),
        segment,
        pair,
        type: formData.type,
        data_set: formData.dataSet,
        lower_limit: Number(formData.lowerLimit),
        upper_limit: Number(formData.upperLimit),
        levels: Number(formData.levels),
        profit_per_level_min: formData.profitPerLevelMin ? Number(formData.profitPerLevelMin) : null,
        profit_per_level_max: formData.profitPerLevelMax ? Number(formData.profitPerLevelMax) : null,
        investment: Number(formData.investment),
        minimum_investment: formData.minimumInvestment ? Number(formData.minimumInvestment) : null,
        stop_grid_loss: formData.stopGridLoss ? Number(formData.stopGridLoss) : null,
        stop_grid_point: formData.stopGridPoint
      }

      // Get token and base URL
      const accessToken = localStorage.getItem("AUTH_TOKEN") || localStorage.getItem("access_token") || 
                         localStorage.getItem("token") || localStorage.getItem("authToken")
      const baseUrl = import.meta.env.VITE_API_URL

      if (!baseUrl) {
        setApiError("API base URL is not configured")
        toast.error("API base URL is not configured")
        return
      }

      if (!accessToken) {
        setApiError("You are not logged in. Please log in again.")
        toast.error("You are not logged in. Please log in again.")
        return
      }

      const headers = {
        "Authorization": `Bearer ${accessToken.trim()}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
      }

      // API call to create Smart Grid strategy
      const res = await fetch(`${baseUrl}/smart-grid/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      })

      if (res.status === 201) {
        // ✅ Get the response data to extract the ID
        const responseData = await res.json()
        console.log('Smart Grid creation response:', responseData)
        
        // ✅ Store the ID for use in TradeConfirmationDialog
        const createdStrategyId = responseData.data?.id || responseData.id
        if (createdStrategyId) {
          setStrategyId(createdStrategyId.toString())
        }
        
        setShowConfirmation(true)
        toast.success("Smart Grid strategy created successfully!")
      } else {
        const err = await res.json()
        const errorMessage = err.message || "An error occurred while creating the strategy."
        setApiError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error: any) {
      const errorMessage = error.message || "Network error occurred. Please try again."
      setApiError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Enhanced reset function
  const resetForm = () => {
    setFormData({
      strategyName: "",
      type: "Neutral",
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
    setApiError("")
  }

  return (
    <div className="h-screen flex flex-col scrollbar-hide overflow-y-scroll">
      <AccountDetailsCard
        selectedApi={selectedApi}
        setSelectedApi={setSelectedApi}
        isBrokeragesLoading={isBrokeragesLoading}
        brokerages={brokerages}
        segment={segment}
        setSegment={setSegment}
        pair={pair}
        setPair={setPair}
        title="Account Details"
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
                Strategy Name *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[200px] text-wrap">
                      <p>You can keep desired Strategy Name for reference and reports</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>  
              </Label>
              <Input 
                name="strategyName"
                value={formData.strategyName}
                onChange={handleInputChange}
                placeholder="Enter Name"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Select Type</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => handleTypeSelect('Neutral')}
                  className={`${formData.type === 'Neutral' ? 'bg-[#5A2525] text-white' : ''}`}
                >
                  Neutral
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => handleTypeSelect('Long')}
                  className={`${formData.type === 'Long' ? 'bg-[#5A2525] text-white' : ''}`}
                >
                  Long
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => handleTypeSelect('Short')}
                  className={`${formData.type === 'Short' ? 'bg-[#5A2525] text-white' : ''}`}
                >
                  Short
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Data Set
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[200px] text-wrap">
                      <p>Please Select the Timeframe of Historical data to determine the price range</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {(['3D', '7D', '30D', '180D', '365D'] as const).map((period) => (
                  <Button 
                    key={period}
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDataSetSelect(period)}
                    className={`${formData.dataSet === period ? 'bg-[#5A2525] text-white' : ''}`}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Lower Limit *
                  <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[200px] text-wrap">
                      <p>Set the Lowest/Starting Price range</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    name="lowerLimit"
                    type="number"
                    value={formData.lowerLimit}
                    onChange={handleInputChange}
                    placeholder="Value"
                    required 
                  />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Upper Limit *
                   <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[200px] text-wrap">
                      <p>Set the Maximum/Ending Price range</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                </Label>
                <div className="flex gap-2">
                  <Input 
                    name="upperLimit"
                    type="number"
                    value={formData.upperLimit}
                    onChange={handleInputChange}
                    placeholder="Value"
                    required 
                  />
                  <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Levels *</Label>
              <Input 
                name="levels"
                type="number"
                value={formData.levels}
                onChange={handleInputChange}
                placeholder="Value"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Profit per Level
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[200px] text-wrap">
                      <p>Estimate Net Profit Per Grid Level Trade</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input 
                    name="profitPerLevelMin"
                    type="number"
                    value={formData.profitPerLevelMin}
                    onChange={handleInputChange}
                    placeholder="Min Value" 
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                </div>
                <div className="relative">
                  <Input 
                    name="profitPerLevelMax"
                    type="number"
                    value={formData.profitPerLevelMax}
                    onChange={handleInputChange}
                    placeholder="Max Value" 
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Investment *
               <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-muted-foreground">ⓘ</span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#ECE7E7] text-gray-900 p-2 rounded-md shadow-2xl max-w-[200px] text-wrap">
                      <p>Invest Per trade</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex gap-2">
                <Input 
                  name="investment"
                  type="number"
                  value={formData.investment}
                  onChange={handleInputChange}
                  placeholder="Value"
                  required 
                />
                <div className="w-[100px] rounded-md border px-3 py-2">USTD</div>
              </div>
              <p className="text-sm text-orange-500">Avbl: 389 USTD</p>
            </div>

            <div className="space-y-2">
              <Label>Minimum Investment</Label>
              <Input 
                name="minimumInvestment"
                type="number"
                value={formData.minimumInvestment}
                onChange={handleInputChange}
                placeholder="Value" 
              />
            </div>

            <p className="text-sm text-green-500">Estimated Net PnL of trade: + 88 Value</p>
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
                  type="number"
                  value={formData.stopGridLoss}
                  onChange={handleInputChange}
                  placeholder="Numeric Value" 
                />
                <Select 
                  value={formData.stopGridPoint}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, stopGridPoint: value }))}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
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

        {/* ✅ Error display */}
        {apiError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {apiError}
          </div>
        )}

        <div className="flex gap-4">
          <Button 
            type="submit" 
            className="flex-1 bg-[#4A1515] hover:bg-[#5A2525]"
            disabled={loading || !selectedApi}
          >
            {loading ? "Processing..." : "Proceed"}
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

      {/* ✅ Updated: Pass the captured strategy ID */}
      <TradeConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        selectedApi={selectedApi}
        selectedBot={null}
        strategyType={StrategyType.SMART_GRID}
        strategyId={strategyId || undefined}
      />
    </div>
  )
}