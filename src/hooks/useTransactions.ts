import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTransactions() {
  const { data, error } = useSWR('/api/transactions', fetcher, { refreshInterval: 2000 });
  
  return { 
    transactions: data?.payments || [], 
    stats: {
        totalPaymentCount: data?.totalPaymentCount || 0,
        totalUsdcFlowed: data?.totalUsdcFlowed || 0,
        cycleCount: data?.cycleCount || 0,
        rebalanceCount: data?.rebalanceCount || 0
    },
    isLoading: !error && !data 
    };
}
