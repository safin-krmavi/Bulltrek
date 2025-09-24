import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProceedPopupProps {
  variant?: 'default' | 'extended'
  className?: string
  strategyData?: {
    accountDetails?: Record<string, any>
    botDetails?: Record<string, any>
    advancedSettings?: Record<string, any>
  }
}

export function ProceedPopup({ variant = 'default', className, strategyData }: ProceedPopupProps) {
  // Paper Trade handler
  const handlePaperTrade = async () => {
    if (!strategyData?.botDetails?.id) {
      alert('Bot ID is missing.');
      return;
    }
    const botId = strategyData.botDetails.id;
    // Collect required fields from strategyData
    const payload: Record<string, any> = {
      symbol: strategyData?.botDetails?.symbol || '',
      side: strategyData?.botDetails?.side || '',
      quantity: Number(strategyData?.botDetails?.quantity) || 0,
      order_type: strategyData?.botDetails?.order_type || undefined,
      price: strategyData?.botDetails?.price || undefined
    };
    // Remove undefined keys for optional fields
    Object.keys(payload).forEach((key: string) => {
      if (payload[key] === undefined) delete payload[key];
    });
    try {
      const accessToken = localStorage.getItem('AUTH_TOKEN') || localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!accessToken) {
        alert('You are not logged in.');
        return;
      }
      const baseUrl = import.meta.env.VITE_API_URL || '';
      if (!baseUrl) {
        alert('API base URL is not set.');
        return;
      }
      const res = await fetch(`${baseUrl}/api/v1/bots/${botId}/paper/trade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Paper trade failed.');
        return;
      }
      alert('Paper trade executed successfully!');
    } catch (err: any) {
      alert(err.message || 'Something went wrong.');
    }
  };

  // Go Live handler
  const handleGoLive = async () => {
    // Try to get the id from botDetails or accountDetails
    const id = strategyData?.botDetails?.id || strategyData?.accountDetails?.id;
    if (!id) {
      alert('Strategy ID is missing.');
      return;
    }
    try {
      const accessToken = localStorage.getItem('AUTH_TOKEN') || localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!accessToken) {
        alert('You are not logged in.');
        return;
      }
      const baseUrl = import.meta.env.VITE_API_URL || '';
      if (!baseUrl) {
        alert('API base URL is not set.');
        return;
      }
      const res = await fetch(`${baseUrl}/api/v1/growth-dca/${id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.message || 'Failed to start Growth DCA strategy.');
        return;
      }
      alert(result.message || 'Growth DCA strategy started successfully!');
    } catch (err: any) {
      alert(err.message || 'Something went wrong.');
    }
  };
  // Map strategyData to sections
  const sections = [
    {
      title: 'Account Details',
      fields: Object.entries((strategyData?.accountDetails || {})).map(([label, value]) => ({ label, value }))
    },
    {
      title: 'Bot Details',
      fields: Object.entries((strategyData?.botDetails || {})).map(([label, value]) => ({ label, value }))
    },
    {
      title: 'Advanced Settings',
      fields: Object.entries((strategyData?.advancedSettings || {})).map(([label, value]) => ({ label, value }))
    }
  ];

  return (
  <Card className={`w-[600px] h-auto rounded-xl shadow-xl border border-gray-200 bg-white ${variant === 'default' ? 'ring-2 ring-blue-500' : ''} ${className}`}>
    <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] rounded-t-xl">
      <h2 className="text-2xl font-bold text-[#5D1D21]">Strategy Summary</h2>
      <Button variant="ghost" size="icon">
        <X className="h-5 w-5" />
      </Button>
    </CardHeader>
    <CardContent className="px-6 py-4">
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg text-[#B45309]">{section.title}</h3>
              {index < sections.length - 1 && <div className="flex-1 border-b border-dashed border-gray-300 mx-4" />}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="flex items-center gap-2">
                  <Label className="w-32 text-right text-sm text-gray-700 font-medium">{field.label}:</Label>
                  <Input value={String(field.value)} readOnly className="bg-gray-50 text-gray-900 px-2 py-1 h-8 rounded-lg border border-gray-300 text-sm" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2 mt-2">
          <Checkbox id="terms" />
          <span className="text-sm text-muted-foreground">*I Agree Bulltrek's Terms & Conditions, Privacy policy and disclaimers</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button className="bg-green-500 hover:bg-green-600 w-full font-semibold py-2 rounded-lg" onClick={handleGoLive}>
            Go Live
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 w-full font-semibold py-2 rounded-lg">
            Edit
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 w-full font-semibold py-2 rounded-lg">
            Backtest
          </Button>
          {variant === 'extended' && (
            <Button className="bg-orange-500 hover:bg-orange-600 w-full font-semibold py-2 rounded-lg" onClick={handlePaperTrade}>
              Paper Trade
            </Button>
          )}
          <Button className="bg-[#5D1D21] hover:bg-[#4D1921] w-full font-semibold py-2 rounded-lg col-span-2">
            Publish
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
  )
}

