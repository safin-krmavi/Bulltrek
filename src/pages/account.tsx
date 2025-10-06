'use client'

import { CollapsibleCard } from "@/components/collapsible-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { formatCurrency } from '@/lib/utils'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useUpdatePassword } from '@/hooks/useUpdatePassword'
import { useBrokerageDetails } from '@/hooks/useBrokerageDetails'
// import { useBotManagement } from '@/hooks/useBotManagement'
import { Clock, Download, Edit, Plus, RefreshCw } from 'lucide-react'
import { useResendInvite } from '@/hooks/sendinvite';
import { useState} from 'react'
import { toast } from 'sonner'
// import { format } from 'date-fns'
import { useDirections } from '@/hooks/useDirection'
import { useQuantities } from '@/hooks/useQuantity'
import { useAssets } from '@/hooks/useAsset'
import { useIndicators } from '@/hooks/useIndicator'
import { PlatformDetails } from '../components/account/platformDetails';
import { useIndicatorActions } from '@/hooks/useIndicatorAction'
import { useIndicatorValues } from '@/hooks/useValue'
// import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import  ApiConnect  from "../components/dashboard/ApiConnect";
import { Eye, EyeOff } from 'lucide-react';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';
// import { PaperTradingTables } from "../components/paperTrading/papertrading";

// interface ApiResponse<T> {  
//   status: string;
//   message: string;
//   data: T;
//   code: number;
// }

// interface Transaction {
//   id: string;
//   symbol: string;
//   orderId: string;
//   price: string;
//   qty: string;
//   quoteQty: string;
//   commission: string;
//   commissionAsset: string;
//   time: number;
//   isBuyer: boolean;
// }

// interface BinanceConnectionResponse {
//   status: string;
//   message: string;
//   data: {
//     user_id: number;
//     brokerage_name: string;
//     brokerage_id: number;
//     brokerage_api_key: string;
//     brokerage_api_secret: string;
//     updated_at: string;
//     created_at: string;
//     id: number;
//   };
//   code: number;
// }

// function useBinanceConnection() {
//   return useMutation<BinanceConnectionResponse, Error, string>({
//     mutationFn: async (userId: string) => {
//       const response = await apiClient.put<BinanceConnectionResponse>(`/api/v1/users/${userId}/brokerages/details/link`, {
//         brokerage_name: "binance",
//         brokerage_api_key: import.meta.env.VITE_BINANCE_API_KEY || "jcramxjcrjejdr80",
//         brokerage_api_secret: import.meta.env.VITE_BINANCE_API_SECRET || "x5bkuvcvbaqgh3yke4qzl1teuhxqna66"
//       });
//       return response.data;
//     },
//     onSuccess: (data) => {
//       toast.success(data.message || "Binance connected successfully");
//     },
//     onError: (error: Error) => {
//       console.error("Binance connection error:", error);
//       toast.error(error.message || "Failed to connect Binance");
//     }
//   });
// }

import { useInvoices } from '@/hooks/useInvoices';
import { useReferrals } from '@/hooks/useReferrals';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';

export default function AccountPage() {
  const navigate = useNavigate();
  // State declarations - move selectedSymbol here
  // const [selectedSymbol] = useState<string>("BTCUSDT");

  // Hooks that depend on selectedSymbol
  // const { 
  //   data: transactionData,
  //   isLoading: isTransactionLoading,
  //   error: transactionError
  // } = useTransactionHistory(selectedSymbol);

  // Other hooks
  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useUserProfile();
  const { isLoading: isBrokerageLoading } = useBrokerageDetails();
  // const { createBot, updateBot } = useBotManagement();
  const updatePassword = useUpdatePassword();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isLoading: isDirectionsLoading } = useDirections();
  const { isLoading: isQuantitiesLoading } = useQuantities();
  const { isLoading: isAssetsLoading } = useAssets();
  const { isLoading: isIndicatorsLoading } = useIndicators();
  const { isLoading: isActionsLoading } = useIndicatorActions();
  const { isLoading: isValuesLoading } = useIndicatorValues();
  const { invoices, isLoading: isInvoicesLoading, error: invoicesError, totalAmount, handleDownload } = useInvoices();
  const { 
    referralData, 
    referralHistory, 
    isLoading: isReferralsLoading, 
    error: referralsError,
    currentPage,
    setCurrentPage
  } = useReferrals();

  // State declarations
  const [showApiModal, setShowApiModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [timeZone, setTimeZone] = useState("GMT, India");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCreateBotModal, setShowCreateBotModal] = useState(false);
  // const [showEditBotModal, setShowEditBotModal] = useState(false);
  // const [selectedBot, setSelectedBot] = useState<any>(null);
  // const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newBotData, setNewBotData] = useState<{
    name: string;
    strategy_id: number;
    mode: 'paper' | 'live';
    execution_type: 'manual' | 'scheduled';
  }>({
    name: '',
    strategy_id: 1,
    mode: 'paper',
    execution_type: 'manual',
  });

  // Loading state
  const isLoading = isProfileLoading || isBrokerageLoading || isDirectionsLoading || isQuantitiesLoading || isAssetsLoading || 
                   isIndicatorsLoading || isActionsLoading || isValuesLoading;

  // Handler functions
  const handleEmailEdit = () => {
    if (isEditing) {
      // Save email logic here
    }
    setIsEditing(!isEditing);
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match", {
        description: "Please make sure both new passwords are identical",
        duration: 5000,
      });
      return;
    }

    try {
      await updatePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword
      });
      
      toast.success("Password Updated Successfully", {
        description: "Your password has been changed. Please use your new password for your next login.",
        duration: 5000,
      });
      
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error("Failed to Update Password", {
        description: error.response?.data?.message || "Please check your current password and try again",
        duration: 5000,
      });
    }
  };

  // Add missing handler functions
  const handleDeletePlatform = (platformId: number) => {
    // Delete logic here
    console.log(`Deleting platform ${platformId}`);
  };

  // const handleCreateBot = async () => {
  //   try {
  //     await createBot.mutateAsync(newBotData);
  //     toast.success("Bot created successfully");
  //     setShowCreateBotModal(false);
  //     setNewBotData({
  //       name: '',
  //       strategy_id: 1,
  //       mode: 'paper',
  //       execution_type: 'manual',
  //     });
  //   } catch (error: any) {
  //     toast.error("Failed to create bot", {
  //       description: error.response?.data?.message || "Please try again",
  //     });
  //   }
  // };
  const resendInvite = useResendInvite();

  // const handleUpdateBot = async (id: number, data: any) => {
  //   try {
  //     await updateBot.mutateAsync({ id, data });
  //     toast.success("Bot updated successfully");
  //     setShowEditBotModal(false);
  //     setSelectedBot(null);
  //   } catch (error: any) {
  //     toast.error("Failed to update bot", {
  //       description: error.response?.data?.message || "Please try again",
  //     });
  //   }
  // };
  // Show loading state if any of the data is loading
  if (isLoading) {
    return (
      <div className="px-4 flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-gray-600 mt-2">Please wait while we fetch your account details</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error with profile data
  if (profileError || !profileData) {
    return (
      <div className="px-4 flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error Loading Profile</h2>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const userData = profileData.data;

  // const transactions = Array.isArray(transactionData?.data) 
  //   ? transactionData?.data 
  //   : [];

  return (
    <div className="px-4 flex flex-col gap-4 mt-2">
      <div className="grid grid-cols-5 w-full gap-4">
        <CollapsibleCard title="Account Details" className='col-span-3'>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {/* Existing account details content */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Name</div>
                            <div className="font-medium">{userData.name}</div>
                            </div>
                            <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Account ID</div>
                            <div className="font-medium">{userData.id}</div>
                            </div>
                            <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Email</div>
                            <div className="flex items-center gap-2 max-w-[200px]">
                                {isEditing ? (
                                <Input 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-8"
                                />
                                ) : (
                                <div className="font-medium truncate">{userData.email}</div>
                                )}
                                <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleEmailEdit}
                                className="h-8 w-8 flex-shrink-0"
                                >
                                <Edit className="h-4 w-4" />
                                </Button>
                            </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Plan Name</div>
                            <div className="font-medium">Premium</div>
                            </div>
                            <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Duration</div>
                            <div className="font-medium">24 Months</div>
                            </div>
                            <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">KYC</div>
                            <Badge variant="success">Verified</Badge>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">Time Zone</div>
                            <div className="flex items-center gap-2 max-w-[200px] bg-white dark:bg-[#232326]">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Select value={timeZone} onValueChange={setTimeZone}>
                                <SelectTrigger className="bg-white dark:bg-[#232326] text-black dark:text-white">
                                <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-[#232326] text-black dark:text-white">
                                <SelectItem value="GMT, India">GMT, India</SelectItem>
                                <SelectItem value="PST, USA">PST, USA</SelectItem>
                                <SelectItem value="EST, USA">EST, USA</SelectItem>
                                </SelectContent>
                            </Select>
                            </div>
                        </div>
                    </div>

                   <div className="flex flex-col flex-wrap gap-3">
                    <Button 
                      className="bg-[#4A1C24] text-white hover:bg-[#3A161C] w-fit flex items-center gap-2"
                      onClick={() => {
                        toast.success("Details updated successfully");
                      }}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Update Details
                    </Button>

                    <Button 
                      className="bg-[#4A1C24] text-white hover:bg-[#3A161C] w-fit"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Change Password
                    </Button>

                    <Button 
                      className="bg-[#4A1C24] text-white hover:bg-[#3A161C] w-fit" 
                      onClick={() => navigate('/pricing')}
                    >
                      Upgrade/Renew Plan
                    </Button>

                    {/* Group Wallet and Send Invite horizontally */}
                    <div className="flex gap-3">
                      <Button 
                        className="bg-orange-500 text-white hover:bg-orange-600 w-fit" 
                        onClick={() => navigate('/wallet')}
                      >
                        Wallet
                      </Button>

                      <Button
                        className="bg-[#4A1C24] text-white hover:bg-[#3A161C] w-fit"
                        onClick={() => resendInvite.mutate(userData.id)}
                        disabled={resendInvite.isPending}
                      >
                        {resendInvite.isPending ? "Sending..." : "Send Invite"}
                      </Button>
                    </div>
                  </div>
                </div>
            </div>
        </CollapsibleCard>
        {/* Api connect section */}
        <CollapsibleCard
            title="API Connect"
            className="col-span-2"
            action={
              <Button
                className="bg-[#FF8C00] text-white hover:bg-[#FFA500] rounded"
                onClick={e => {
                  e.stopPropagation(); // Prevents toggling the card when clicking the button
                  setShowApiModal(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Brokers
              </Button>
            }
          >
            <ApiConnect
              userId={userData?.id?.toString()}
              showModal={showApiModal}
              setShowModal={setShowApiModal}
            />
          </CollapsibleCard>
      </div>

      <div className="grid grid-cols-5 w-full gap-4 ">
        <CollapsibleCard title="Invoice Details" className='col-span-3'>
            {isInvoicesLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold">Loading invoices...</h2>
                </div>
              </div>
            ) : invoicesError ? (
              <div className="text-red-500 p-4">{invoicesError}</div>
            ) : (
              <>
                <div className="flex justify-end mb-4">
                  <div className="text-sm text-muted-foreground">
                    Total Amount: <span className="font-medium">{totalAmount}</span>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No.</TableHead>
                      <TableHead>Plan Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='w-fit'>Download</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-muted/50">
                        <TableCell>{invoice.invoice_number}</TableCell>
                        <TableCell>{invoice.plan_name}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className='w-fit'
                            onClick={() => handleDownload(invoice.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
        </CollapsibleCard>

        <CollapsibleCard title="Platform Details" className='col-span-2'>
          <PlatformDetails onDelete={handleDeletePlatform} />
        </CollapsibleCard>
      </div>

      
      <div className="grid grid-cols-5 w-full gap-4">

      <CollapsibleCard title="Referral Settings" className='col-span-3'>
        {isReferralsLoading ? (
          <div className="flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Loading referral data...</h2>
            </div>
          </div>
        ) : referralsError ? (
          <div className="text-red-500 p-4">{referralsError}</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Pending Referrals</div>
                <div className="font-medium">{referralData?.statistics.pending_referrals}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Active Referrals</div>
                <div className="font-medium">{referralData?.statistics.verified_referrals}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Earnings</div>
                <div className="font-medium">${referralData?.statistics.total_earnings}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">This Month</div>
                <div className="font-medium">${referralData?.statistics.this_month_earnings}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex-1 truncate">{referralData?.referral_link}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(referralData?.referral_link || '');
                  toast.success('Referral link copied to clipboard');
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Referral Name</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralHistory?.referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.id}</TableCell>
                    <TableCell>{referral.joined_date}</TableCell>
                    <TableCell>{referral.referral_name}</TableCell>
                    <TableCell>{referral.account_id}</TableCell>
                    <TableCell>
                      <Badge variant={referral.status === 'Verified' ? 'success' : 'warning'}>
                        {referral.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${referral.earnings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {referralHistory && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {referralHistory.pagination.total_pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(referralHistory.pagination.total_pages, prev + 1))}
                    disabled={currentPage === referralHistory.pagination.total_pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CollapsibleCard>

      <CollapsibleCard title="Other Settings" className='col-span-2 w-full'>
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="font-medium">2 Factor Authentication</div>
            <Switch 
              checked={is2FAEnabled}
              onCheckedChange={setIs2FAEnabled}
            />
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="font-medium">Having Trouble?</div>
            <Button className="bg-[#4A1C24] text-white hover:bg-[#3A161C]"
            onClick={() => navigate('/support')}>
              Support
            </Button>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="font-medium">Learn More</div>
            <Button className="bg-[#4A1C24] text-white hover:bg-[#3A161C]">
              Tutorials
            </Button>
          </div>
        </div>
      </CollapsibleCard>

      </div>



{showPasswordModal && (
  <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-[#232326] dark:text-white p-6 rounded-lg w-[400px] max-w-full shadow-2xl border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground">Current Password</label>
          <div className="relative">
            <Input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1 h-8"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">New Password</label>
          <div className="relative">
            <Input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1 h-8"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Confirm New Password</label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1 h-8"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setShowPasswordModal(false);
              setShowCurrentPassword(false);
              setShowNewPassword(false);
              setShowConfirmPassword(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="bg-[#4A1C24] text-white hover:bg-[#3A161C]"
            onClick={handlePasswordUpdate}
            disabled={updatePassword.isPending}
          >
            {updatePassword.isPending ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  </div>
)}  

      {/* Create Bot Modal */}
      {showCreateBotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="dark:bg-[#232326] p-6 rounded-lg w-[500px]">
            <h2 className="text-xl font-semibold mb-4">Create New Bot</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Bot Name</label>
                <Input
                  value={newBotData.name}
                  onChange={(e) => setNewBotData({ ...newBotData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Mode</label>
                <Select
                  value={newBotData.mode}
                  onValueChange={(value) => setNewBotData({ ...newBotData, mode: value as 'paper' | 'live' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paper">Paper Trading</SelectItem>
                    <SelectItem value="live">Live Trading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Execution Type</label>
                <Select
                  value={newBotData.execution_type}
                  onValueChange={(value) => setNewBotData({ ...newBotData, execution_type: value as 'manual' | 'scheduled' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateBotModal(false)}
                >
                  Cancel
                </Button>
                {/* <Button
                  className="bg-[#4A1C24] text-white hover:bg-[#3A161C]"
                  onClick={handleCreateBot}
                  disabled={createBot.isPending}
                >
                  {createBot.isPending ? "Creating..." : "Create Bot"}
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bot Modal */}
     
    </div>
  )
}
