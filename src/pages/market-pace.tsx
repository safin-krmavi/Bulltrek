import { TradingCard } from "@/components/trading-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { BadgeCustom } from "@/components/ui/badge-custom"
import { Search } from 'lucide-react'


// Generate dummy chart data
const generateChartData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    value: 50 + Math.random() * 20 + i
  }))
}

// Generate dummy trading cards data
const tradingCards = Array.from({ length: 8 }, (_, i) => ({
  pair: "BTC/USDT",
  apy: 89.43,
  investment: 14.722,
  duration: "7-30 Days",
  followers: 8652,
  chartData: generateChartData(),
  type: i % 2 === 0 ? "Forward" : "Spot grid" as "Forward" | "Spot grid",
  aiStatus: "AI: Balanced"
}))
const tradingCards2 = Array.from({ length: 8 }, (_, i) => ({
  pair: "ETH/USDT",
  apy: 88.43,
  investment: 14.722,
  duration: "9-30 Days",
  followers: 852,
  chartData: generateChartData(),
  type: i % 2 === 0 ? "Forward" : "Spot grid" as "Forward" | "Spot grid",
  aiStatus: "AI: Balanced"
}))


export default function MarketPlacePage() {
  return (
    <div className="p-6 max-w-7xl mx-auto dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 border-2  px-[16px] py-[10px] rounded-md border-[#581C3D]">
            <span className="text-sm font-medium">Copy Trading Assets:</span>
            <BadgeCustom>2</BadgeCustom>
          </button>
          <button className="flex items-center gap-2 border-2 px-[16px] py-[10px] rounded-md border-[#581C3D]">
            <span className="text-sm font-medium">Profit:</span>
            <BadgeCustom>2</BadgeCustom>
          </button>
          <button className="flex items-center gap-2 border-2 px-[16px] py-[10px] rounded-md border-[#581C3D]">
            <span className="text-sm font-medium">Net Profit:</span>
            <BadgeCustom>2</BadgeCustom>
          </button>
          <button className="flex items-center gap-2 border-2 px-[16px] py-[10px] rounded-md border-[#581C3D]">
            <span className="text-sm font-medium">Unrealized PnL:</span>
            <BadgeCustom>2</BadgeCustom>
          </button>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search Seller/Strategy Name"
            className="pl-8 border-gray-200"
          />
        </div>
      </div>

      <Tabs defaultValue="high-yields" className="space-y-4">
        <div className="border-b border-gray-200 ">
          <TabsList className="bg-transparent w-full justify-start rounded-none p-0 h-auto">
            <TabsTrigger 
              value="high-roi" 
              className="px-4 py-2 rounded-t-md data-[state=active]:bg-[#581C3D] data-[state=active]:text-white"
            >
              High ROI
            </TabsTrigger>
            <TabsTrigger 
              value="high-yields" 
              className="px-4 py-2 rounded-t-md data-[state=active]:bg-[#581C3D] data-[state=active]:text-white"
            >
              High Yields
            </TabsTrigger>
            <TabsTrigger 
              value="top-seller" 
              className="px-4 py-2 rounded-t-md data-[state=active]:bg-[#581C3D] data-[state=active]:text-white"
            >
              Top Seller
            </TabsTrigger>
            <TabsTrigger 
              value="rent-buy" 
              className="px-4 py-2 rounded-t-md data-[state=active]:bg-[#581C3D] data-[state=active]:text-white"
            >
              Rent / Buy
            </TabsTrigger>
            <TabsTrigger 
              value="broker-exchange" 
              className="px-4 py-2 rounded-t-md data-[state=active]:bg-[#581C3D] data-[state=active]:text-white"
            >
              Broker / Exchange
            </TabsTrigger>
            <TabsTrigger 
              value="seller-reputation" 
              className="px-4 py-2 rounded-t-md data-[state=active]:bg-[#581C3D] data-[state=active]:text-white"
            >
              Seller Reputation
            </TabsTrigger> 
           <TabsTrigger value="binance" className="px-4 py-2 rounded-t-md data-[state=active]:bg-[#581C3D] data-[state=active]:text-white">
  Binance
</TabsTrigger>
          </TabsList>
        </div>

        {["high-roi", "high-yields", "most-followed"].map((section) => (
          <TabsContent key={section} value={section} className="space-y-4 mt-4">
            <div className="text-sm text-gray-500 capitalize">
              {section.replace("-", " ")}
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
              {tradingCards.map((card, i) => (
                <TradingCard key={i} {...card} />
              ))}
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
              {tradingCards.map((card, i) => (
                <TradingCard key={i} {...card} />
              ))}
            </div>
            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
              {tradingCards.map((card, i) => (
                <TradingCard key={i} {...card} />
              ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="binance" className="space-y-4 mt-4">
          <div className="text-sm text-gray-500 capitalize">Binance</div>
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {Array.from({ length: Math.max(tradingCards.length, tradingCards2.length) }).flatMap((_, i) => [
              tradingCards[i] && <TradingCard key={`tc1-${i}`} {...tradingCards[i]} />,
              tradingCards2[i] && <TradingCard key={`tc2-${i}`} {...tradingCards2[i]} />
            ]).filter(Boolean)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

