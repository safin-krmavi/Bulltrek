import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { brokerageService } from "@/api/brokerage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { ChevronDown, Plus } from "lucide-react";

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
  const [isExpanded] = useState(true);

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

  // Add broker function with refresh
  const handleAddBroker = async () => {
    try {
      await brokerageService.linkBrokerage({
        brokerage_name: platform as "zerodha" | "binance",
        brokerage_api_key: apiKey,
        brokerage_api_secret: apiSecret,
      });
      
      // Reset form
      setPlatform("");
      setApiKey("");
      setApiSecret("");
      setShowModal(false);
      
      // Refresh the connections list
      const response = await brokerageService.getAllApiConnections();
      setData(response.data.data);
    } catch (error) {
      setError("Failed to add broker");
    }
  };

  return (
    <>
      {/* ✅ Updated: Match dashboard card design */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

        {/* Content */}
        {isExpanded && (
          <div className="bg-gray-50">
            {/* Table Header */}
            <div className="grid grid-cols-2 bg-gray-100 border-b border-gray-200 text-sm font-semibold text-gray-700">
              <div className="px-4 py-3">Platform</div>
              <div className="px-4 py-3 text-center">Status</div>
            </div>

            {/* Table Content */}
            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="px-4 py-8 text-center">
                  <div className="inline-flex items-center text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                    Loading...
                  </div>
                </div>
              ) : error ? (
                <div className="px-4 py-6 text-center">
                  <div className="inline-flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-md text-sm">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              ) : allApis.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <div className="inline-flex flex-col items-center">
                    <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-sm">No API connections found</p>
                  </div>
                </div>
              ) : (
                allApis.map((api, index) => (
                  <div 
                    key={api.id} 
                    className={`grid grid-cols-2 border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <div className="px-4 py-3 text-gray-900 font-medium text-sm">
                      {api.display_name || api.name}
                    </div>
                    <div className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        api.is_connected 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                          api.is_connected ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        {api.is_connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal for adding brokers */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">Add New Broker</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  Platform *
                </label>
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
                <label className="text-sm font-medium mb-2 block text-gray-700">
                  API Key *
                </label>
                <Input 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API Key"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block text-gray-700">
                API Secret *
              </label>
              <Input 
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Enter API Secret"
                className="font-mono text-sm"
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={handleAddBroker}
                disabled={!platform || !apiKey || !apiSecret}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white"
              >
                Add Broker
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setError("");
                  setPlatform("");
                  setApiKey("");
                  setApiSecret("");
                }}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApiConnect;

