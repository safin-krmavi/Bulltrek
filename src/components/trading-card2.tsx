import { Card } from "@/components/ui/card"
import { BadgeCustom } from "@/components/ui/badge-custom"
import { Button } from "@/components/ui/button"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { Users } from 'lucide-react'
import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface TradingCardProps {
  pair: string
  apy: number
  investment: number
  duration: string
  followers: number
  chartData: { value: number }[]
  type: "Forward" | "Spot grid"
  aiStatus: string
}

export function TradingCard({
  pair,
  apy,
  investment,
  duration,
  followers,
  chartData,
  type,
  aiStatus,
}: TradingCardProps) {
  return (
    <Card className="w-[280px] flex-shrink-0 border border-border dark:border-gray-700 rounded-xl bg-card dark:bg-[#232326] shadow-lg text-foreground dark:text-white transition-colors duration-300">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex flex-col gap-2 mb-2">
              <h3 className="font-semibold text-sm dark:text-white">{pair}</h3>
              <BadgeCustom variant="green">
                {type}
              </BadgeCustom>
            </div>
            <div className="text-2xl font-bold text-green-500 mb-1">
              {apy.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-300 mb-2">
              30-day APY
            </div>
            <div className="font-medium text-sm dark:text-white">
              {investment.toFixed(2)} USDT
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-300">
              Min Investment
            </div>
          </div>
          <div className="flex items-end flex-col">
            <div className="text-xs text-gray-500 dark:text-gray-300 mb-1">
              {aiStatus}
            </div>
            <div className="w-24 h-16 bg-white dark:bg-[#232326] rounded-md">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    fill="#22c55e20"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs font-medium mt-1 dark:text-white">
              {duration}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-300">
              Recommended Duration
            </div>
          </div>
        </div>
      </div>
      <div className="flex px-4 pb-4 w-full justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-300">
          <Users className="h-3 w-3" />
          <span>{followers}</span>
        </div>
        <Button 
          className="w-fit bg-[#581C3D] hover:bg-[#581C3D]/90 text-white h-8 rounded-md"
        >
          Use
        </Button>
      </div>
    </Card>
  )
}

export default function BinanceCardsList() {
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPrices() {
      const res = await fetch(`${BASE_URL}/api/v1/marketplace/prices`);
      const json = await res.json();
      // Map API data to card props
      const binanceData = json.data?.binance || [];
      const mappedCards = binanceData.map((item: any) => ({
        pair: item.symbol,
        apy: parseFloat(item.priceChangePercent), // Example: use priceChangePercent as APY
        investment: parseFloat(item.lastPrice),   // Example: use lastPrice as investment
        duration: "7-30 Days",                    // Static or derived
        followers: Math.floor(Math.random() * 10000), // Dummy followers
        chartData: Array.from({ length: 20 }, (_, i) => ({
          value: parseFloat(item.lastPrice) + i * 10 // Dummy chart data
        })),
        type: "Forward",                          // Static or derived
        aiStatus: "AI: Balanced"                  // Static or derived
      }));
      setCards(mappedCards);
    }
    fetchPrices();
  }, []);

  return (
    <div className="flex gap-4">
      {cards.map((card, i) => (
        <TradingCard key={i} {...card} />
      ))}
    </div>
  );
}

