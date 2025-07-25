"use client"

import { useState } from 'react'
import { ChevronDown, Edit2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { InvestmentForm } from '@/components/diverse-flow/investment-form'
import { AssetAllocationChart } from '@/components/diverse-flow/asset-allocation-chart'
import { CopyTradeModal } from '@/components/ui/copy-trade-modal'


const assetAllocationData = [
  { name: "USTD", value: 53.46, color: "#F97316" },
  { name: "Active 1", value: 10.2, color: "#E2E8F0" },
  { name: "Active 2", value: 10.2, color: "#E2E8F0" },
  { name: "Active 3", value: 10.2, color: "#E2E8F0" },
  { name: "Active 4", value: 10.2, color: "#E2E8F0" },
]

export default function SmartCopyPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopyClick = () => {
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    // Handle the copy trade confirmation here
    console.log('Copy trade confirmed');
    // Add your copy trade logic here
  };

  return (
    <div className="mx-auto max-w-7xl p-6 w-full dark:text-white">
      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Smart Copy</h1>

          <div className="rounded-lg border bg-card dark:bg-[#232326] border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white transition-colors duration-300 p-6">
            <div className="space-y-6">
              <InvestmentForm onSubmit={console.log} />

              <Button
                variant="outline"
                className="w-full justify-between"
              >
                More Settings
                <ChevronDown className="h-4 w-4" />
              </Button>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Auto Copy</h4>
                    <p className="text-sm text-muted-foreground">
                      Lorem ipsum dolor sit amet, consectetur adipisci sed do eiusmod tempor inci
                    </p>
                  </div>
                  <Switch className='' />
                </div>

                {[
                  "Copy Trading Pairs",
                  "Risk Management",
                  "Margin Mode & Leverage Adjustment"
                ].map((title) => (
                  <div key={title} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Lorem ipsum dolor sit amet, consectetur adipisci sed do eiusmod tempor inci
                      </p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full text-white bg-[#4A1D2F] hover:bg-[#3A1525]"
                onClick={handleCopyClick}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card dark:bg-[#232326] border-border dark:border-gray-700 shadow-lg text-foreground dark:text-white transition-colors duration-300 p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src="/placeholder.svg"
                alt="Profile"
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h2 className="font-semibold">Lorem Name</h2>
                <p className="text-sm text-muted-foreground">@subname</p>
                <p className="text-sm text-muted-foreground">
                  Lorem ipsum this is status line
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Asset Allocation</h3>
              <AssetAllocationChart data={assetAllocationData} />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {assetAllocationData.slice(1).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#F97316]" />
                    <span className="text-sm">Active</span>
                    <span className="text-sm text-muted-foreground">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">ROI</span>
                <span className="text-sm font-medium text-red-500">-90.87%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Maximum drawdown</span>
                <span className="text-sm font-medium">34.67%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Followers</span>
                <span className="text-sm font-medium">200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Follower's PnL</span>
                <span className="text-sm font-medium">₹2345.89</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Trade Agreement Modal */}
      <CopyTradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
      />
    </div>
  )
}

