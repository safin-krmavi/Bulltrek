
import { useBrokerageManagement } from "@/hooks/useBrokerages";
import { Card, CardContent } from "../ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ApiFormProps {
  withPassphrase?: boolean;
}

export function ApiForm({ withPassphrase = false }: ApiFormProps) {
  const { getApiConnections } = useBrokerageManagement();
  const { data, isLoading, error } = getApiConnections;

  const connected = data?.data?.connected_apis || [];
  const available = data?.data?.available_apis || [];
  // Show all brokerages, connected first, then available (avoiding duplicates)
  const allApis = [
    ...connected,
    ...available.filter((a: any) => !connected.some((c: any) => c.id === a.id))
  ];

  return (
    <Card className="w-[500px]">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-medium">Add API</h3>
          {/* If Button is a custom component, keep variant/size. If not, remove them. Assuming custom Button: */}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Platform</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading..." : error ? "Failed to load" : "Select Platform"} />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : error ? (
                  <SelectItem value="error" disabled>Failed to load</SelectItem>
                ) : allApis.length === 0 ? (
                  <SelectItem value="none" disabled>No brokerages found</SelectItem>
                ) : (
                  allApis.map((api: any) => (
                    <SelectItem key={api.id} value={api.name}>{api.display_name || api.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">API Key</label>
              <Input placeholder="Enter API Key" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">API Secret</label>
              <Input placeholder="Enter API Secret" />
            </div>
          </div>
          {withPassphrase && (
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Pass Phrase</label>
              <Input placeholder="Enter Pass Phrase" />
            </div>
          )}
        </div>
        <Button className="w-full bg-[#5D1D21] hover:bg-[#4D1921]">
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}

