import { useState, useEffect } from 'react';
import apiClient from '@/api/apiClient';

interface ReferralStats {
  verified_referrals: number;
  pending_referrals: number;
  total_earnings: number;
  this_month_earnings: number;
}

interface PayoutSettings {
  payment_method: string;
  payout_email: string;
  minimum_payout: number;
}

interface Referral {
  id: number;
  joined_date: string;
  referral_name: string;
  account_id: string;
  status: string;
  earnings: number;
}

interface ReferralData {
  referral_id: string;
  referral_link: string;
  statistics: ReferralStats;
  payout_settings: PayoutSettings;
}

interface ReferralHistory {
  referrals: Referral[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}

export function useReferrals() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referralHistory, setReferralHistory] = useState<ReferralHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get('/api/v1/referrals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferralData(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch referral data');
    }
  };

  const fetchReferralHistory = async (page: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get(`/api/v1/referrals/history?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReferralHistory(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch referral history');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchReferralData(),
        fetchReferralHistory(currentPage)
      ]);
      setIsLoading(false);
    };

    fetchData();
  }, [currentPage]);

  return {
    referralData,
    referralHistory,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    refetchData: () => {
      fetchReferralData();
      fetchReferralHistory(currentPage);
    }
  };
}