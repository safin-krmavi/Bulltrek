import { useState, useEffect } from 'react';
import apiClient from '@/api/apiClient';

interface Invoice {
  id: number;
  plan_name: string;
  date: string;
  amount: string;
  download_url: string;
  invoice_number: string;
  status: string;
}

interface InvoiceResponse {
  status: string;
  message: string;
  data: {
    invoices: Invoice[];
    total_count: number;
    total_amount: string;
  };
  code: number;
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiClient.get<InvoiceResponse>('/invoices', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInvoices(response.data.data.invoices);
        setTotalAmount(response.data.data.total_amount);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch invoices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleDownload = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get(`/api/v1/invoices/${id}/download`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
    //   toast.error('Failed to download invoice');
    }
  };

  return { invoices, isLoading, error, totalAmount, handleDownload };
}