// import { create } from "zustand";
// import { brokerageService } from "@/api/brokerage";

// interface ApiConnection {
//   id: string | number;
//   name: string;
//   display_name: string | null;
//   is_connected: boolean;
//   brokerage_type: string | null;
//   status: string;
// }

// interface ApiConnectionStore {
//   connections: ApiConnection[];
//   loading: boolean;
//   error: string | null;
//   fetchConnections: () => Promise<void>;
//   addConnection: (params: {
//     brokerage_name: string;
//     brokerage_api_key: string;
//     brokerage_api_secret: string;
//     passPhrase?: string;
//   }) => Promise<void>;
//   reset: () => void;
// }

// export const useApiConnectionStore = create<ApiConnectionStore>((set, get) => ({
//   connections: [],
//   loading: false,
//   error: null,

//   fetchConnections: async () => {
//     set({ loading: true, error: null });
//     try {
//       const res = await brokerageService.getAllApiConnections();
//       const data = res.data.data;
//       // Combine connected and available APIs, avoiding duplicates
//       const connected = data.connected_apis || [];
//       const available = (data.available_apis || []).filter(
//         (a: ApiConnection) => !connected.some((c: ApiConnection) => c.id === a.id)
//       );
//       set({ connections: [...connected, ...available], loading: false });
//     } catch (err: any) {
//       set({ error: err.message || "Failed to fetch connections", loading: false });
//     }
//   },

//   addConnection: async ({ brokerage_name, brokerage_api_key, brokerage_api_secret, passPhrase }) => {
//     set({ loading: true, error: null });
//     try {
//       await brokerageService.linkBrokerage({
//         brokerage_name,
//         brokerage_api_key,
//         brokerage_api_secret,
//         ...(passPhrase ? { passPhrase } : {}),
//       });
//       // Refresh the list after adding
//       await get().fetchConnections();
//     } catch (err: any) {
//       set({ error: err.message || "Failed to add connection", loading: false });
//     } finally {
//       set({ loading: false });
//     }
//   },

//   reset: () => set({ connections: [], loading: false, error: null }),
// }));