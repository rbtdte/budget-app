'use client';

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    Plaid: {
      create: (config: any) => { open: () => void };
    };
  }
}

interface Props {
  onLinked: () => void;
}

export default function ConnectBankBanner({ onLinked }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plaidReady, setPlaidReady] = useState(false);

  useEffect(() => {
    // Load Plaid Link script
    const script = document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.onload = () => setPlaidReady(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  const handleConnect = async () => {
    if (!plaidReady) return;
    setLoading(true);
    setError(null);

    try {
      // Get link token from our backend
      const res = await fetch('/api/plaid/link-token', { method: 'POST' });
      const { link_token, error: apiError } = await res.json();

      if (apiError || !link_token) {
        setError('Could not connect to bank service. Check your Plaid setup.');
        setLoading(false);
        return;
      }

      // Open Plaid Link
      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (public_token: string, metadata: any) => {
          try {
            await fetch('/api/plaid/exchange', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                public_token,
                institution_name: metadata?.institution?.name || 'Chase',
              }),
            });
            onLinked();
          } catch {
            setError('Failed to link account. Please try again.');
          } finally {
            setLoading(false);
          }
        },
        onExit: () => setLoading(false),
        onLoad: () => {},
        onEvent: () => {},
      });

      handler.open();
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4 animate-fade-up">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🏦</span>
        <div className="flex-1">
          <p className="font-black text-white text-sm">Demo Mode</p>
          <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
            Connect your Chase account to see real spending data. 
            Your info is kept private and never shared.
          </p>
          {error && (
            <p className="text-red-400 text-xs mt-2 font-semibold">{error}</p>
          )}
          <button
            onClick={handleConnect}
            disabled={loading || !plaidReady}
            className="mt-3 w-full py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? 'Connecting…' : '🔗 Connect Chase Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
