import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useAgentStatus() {
  const { data, error, mutate } = useSWR('/api/agent/status', fetcher, { refreshInterval: 2000 });
  
  const triggerCycle = async () => {
    // Hardcoding a mock user id for the demo purpose since auth flow isn't fully robust here
    await fetch('/api/agent/cycle', { 
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: 'demo-user' }) 
    });
    mutate();
  };

  return { status: data, error, isLoading: !error && !data, triggerCycle, isRunning: data?.isRunning };
}
