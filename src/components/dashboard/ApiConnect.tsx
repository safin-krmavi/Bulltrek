import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { brokerageService } from "@/api/brokerage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface ApiConnectProps {
  userId?: string;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

interface ApiConnection {
  id: string | number;
  name: string;
  display_name: string | null;
  is_connected: boolean;
  brokerage_type: string | null;
  status: string;
}

const ApiConnect = ({ userId, showModal, setShowModal }: ApiConnectProps) => {
  const [data, setData] = useState<{
    connected_apis: ApiConnection[];
    available_apis: ApiConnection[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [platform, setPlatform] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

useEffect(() => {
  async function fetchConnections() {
    setIsLoading(true);
    try {
      const response = await brokerageService.getAllApiConnections();
      setData(response.data.data);
    } catch (err) {
      setError("Failed to load API connections");
    } finally {
      setIsLoading(false);
    }
  }
  fetchConnections();
}, [userId]);

  // Combine both connected and available APIs
  const allApis = [
    ...(data?.connected_apis || []),
    ...(data?.available_apis || []).filter(api => api.name) // Filter out empty names
  ];

  // Get only disconnected platforms
  const disconnectedPlatforms = (data?.available_apis || [])
    .filter(api => !api.is_connected && api.name)
    .map(api => ({
      value: api.name.toLowerCase(),
      label: api.display_name || api.name
    }));

  // Add broker function
  const handleAddBroker = async () => {
    try {
      await brokerageService.linkBrokerage({
        brokerage_name: platform as "zerodha" | "binance",
        brokerage_api_key: apiKey,
        brokerage_api_secret: apiSecret,
      });
      setShowModal(false);
      // Refresh the list
      // fetchConnections();
    } catch (error) {
      setError("Failed to add broker");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className="w-full bg-white rounded-lg shadow-sm">


        <div className="max-h-[200px] overflow-y-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b">
                <th className="text-left px-3 py-2 font-semibold text-gray-900">Platform</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-900">API Key</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-900">API Secret</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 noscrollbar">
              {allApis.map((api) => (
                <tr key={api.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {api.display_name || api.name}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">
                    ****{String(api.id).slice(-4)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-mono text-xs">
                    ****{String(api.id).slice(-4)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                      api.is_connected 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                        api.is_connected ? 'bg-green-600' : 'bg-red-600'
                      }`}></span>
                      {api.is_connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading && (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        )}
        {error && (
          <div className="p-4 text-center text-red-500">{error}</div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[525px] bg-white">
          <DialogHeader>
            <DialogTitle>Add New Broker</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {disconnectedPlatforms.map(platform => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">API Key</label>
                <Input 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API Key"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium mb-1.5 block">API Secret</label>
              <Input 
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter API Secret"
              />
            </div>
            <Button 
              onClick={handleAddBroker}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              Add Broker
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiConnect;

