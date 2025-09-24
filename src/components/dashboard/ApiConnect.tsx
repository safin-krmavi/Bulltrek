
import { useBrokerageManagement } from "@/hooks/useBrokerages";

const ApiConnect = () => {
  const { getApiConnections } = useBrokerageManagement();
  const { data, isLoading, error } = getApiConnections;

  const connected = data?.data?.connected_apis || [];
  const available = data?.data?.available_apis || [];
  // Show all brokerages, connected first, then available (avoiding duplicates)
  const allApis = [
    ...connected,
    ...available.filter((a: any) => !connected.some((c: any) => c.id === a.id))
  ];

  if (isLoading) {
    return <div className="py-6 text-center">Loading brokerages...</div>;
  }
  if (error) {
    return <div className="py-6 text-center text-red-600">Failed to load brokerages.</div>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="overflow-x-auto w-full">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1">Platform</th>
              <th className="px-2 py-1">Type</th>
              <th className="px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {allApis.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6">No brokerages found.</td>
              </tr>
            ) : (
              allApis.map((api: any) => (
                <tr key={api.id}>
                  <td className="px-2 py-1">{api.display_name || api.name}</td>
                  <td className="px-2 py-1">{api.brokerage_type || "-"}</td>
                  <td className="px-2 py-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${api.is_connected ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`ml-2 font-medium ${api.is_connected ? "text-green-600" : "text-red-600"}`}>{api.is_connected ? "Connected" : "Disconnected"}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApiConnect;