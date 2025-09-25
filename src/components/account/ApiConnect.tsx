import { useEffect, useState } from "react";
import { brokerageService } from "@/api/brokerage";

interface ApiConnection {
  id: string | number;
  name: string;
  display_name: string | null;
  is_connected: boolean;
  brokerage_type: string | null;
  status: string;
}

export const ApiConnect = () => {
  const [data, setData] = useState<{
    connected_apis: ApiConnection[];
    available_apis: ApiConnection[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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
  }, []);

  // Combine both connected and available APIs
  const allApis = [
    ...(data?.connected_apis || []),
    ...(data?.available_apis || []).filter(api => api.name) // Filter out empty names
  ];

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="w-full">
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Platform</th>
            <th>API Key</th>
            <th>API Secret</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {allApis.map((api) => (
            <tr key={api.id}>
              <td>{api.display_name || api.name}</td>
              <td>****{String(api.id).slice(-4)}</td>
              <td>****{String(api.id).slice(-4)}</td>
              <td>
                <span className={`inline-flex items-center ${
                  api.is_connected ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className={`w-2 h-2 mr-2 rounded-full ${
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
  );
};