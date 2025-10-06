// src/components/common/AccountDetailsCard.tsx
import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AccountDetailsCardProps {
  selectedApi: string;
  setSelectedApi: (api: string) => void;
  isBrokeragesLoading: boolean; 
  brokerages: any[];
  segment?: string;
  setSegment?: (segment: string) => void;
  pair?: string;
  setPair?: (pair: string) => void;
  title?: string;
}

export const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({
  selectedApi,
  setSelectedApi,
  isBrokeragesLoading,
  brokerages,
  segment,
  setSegment,
  pair,
  setPair,
  title = "Account Details",
}) => {
  const [open, setOpen] = useState(true);

  // Example symbols based on API (replace with dynamic API response if available)
  const apiSymbols: Record<string, string[]> = {
    "1": ["BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT"],
    "2": ["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL"],
  };

  // Filter symbols based on API selection
  const availableSymbols = apiSymbols[selectedApi] || [];

  // Filter suggestions based on typed pair
  const filteredSymbols = useMemo(() => {
    if (!pair) return availableSymbols;
    return availableSymbols.filter((s) =>
      s.toLowerCase().includes(pair.toLowerCase())
    );
  }, [pair, availableSymbols]);

  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <Card className="bg-card dark:bg-[#232326] border border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white rounded-lg transition-colors duration-300">
      {/* Card Header */}
      <CardHeader
        className="bg-[#4A1C24] dark:bg-[#232326] dark:border-gray-700 text-white cursor-pointer flex flex-row items-center justify-between p-4 rounded-t-lg"
        onClick={() => setOpen((prev) => !prev)}
      >
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {open ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </CardHeader>

      {/* Card Content */}
      <div className={cn("transition-all duration-200", open ? "block" : "hidden")}>
        <CardContent className="p-4 pt-0 space-y-6">
          <div className="space-y-2 mt-2">
            <label className="text-sm font-medium">API Key</label>
            <Select value={selectedApi} onValueChange={setSelectedApi}>
              <SelectTrigger className="w-full bg-background border border-border rounded">
                <SelectValue placeholder="Select API connection" />
              </SelectTrigger>
              <SelectContent>
                {isBrokeragesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : brokerages.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No brokerages found
                  </SelectItem>
                ) : (
                  brokerages.map((b: any) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.brokerage_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Segment input below API Key */}
          {typeof segment !== "undefined" && typeof setSegment === "function" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Segment</label>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger className="w-full bg-background border border-border rounded">
                  <SelectValue placeholder="Select Segment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delivery/Spot/Cash">
                    Delivery/Spot/Cash
                  </SelectItem>
                  <SelectItem value="Futures">Futures</SelectItem>
                  <SelectItem value="Options">Options</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Pair input with autocomplete dropdown */}
          {typeof pair !== "undefined" && typeof setPair === "function" && (
            <div className="space-y-2 relative">
              <label className="text-sm font-medium">Pair</label>
              <input
                type="text"
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm"
                placeholder="e.g. BTCUSDT"
                value={pair}
                onChange={(e) => {
                  setPair(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // hide after selection
              />

              {/* Dropdown Suggestions */}
              {showDropdown && filteredSymbols.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-[#2a2a2a] border border-border rounded mt-1 max-h-40 overflow-y-auto shadow-md">
                  {filteredSymbols.map((symbol) => (
                    <li
                      key={symbol}
                      onMouseDown={() => { // ✅ use onMouseDown instead of onClick
                        setPair(symbol);
                        setShowDropdown(false);
                      }}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {symbol}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};