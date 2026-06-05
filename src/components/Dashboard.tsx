'use client';

import { useEffect, useState, useCallback } from 'react';
import type { DashboardData } from '@/types';
import SpendingOverview from './SpendingOverview';
import CategoryBreakdown from './CategoryBreakdown';
import SpendingChart from './SpendingChart';
import RecentTransactions from './RecentTransactions';
import UpcomingBills from './UpcomingBills';
import ConnectBankBanner from './ConnectBankBanner';
import SyncStatus from './SyncStatus';

const SYNC_INTERVAL_MS = 8 * 60 * 60 * 1000; // 8 hours

export default function Dashboard() {
  const [data, setData] = useState<(DashboardData & { isDemo: boolean; lastSync: string | null }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    setSyncing(true);
    try {
      await fetch('/api/sync', { method: 'POST' });
      await fetchDashboard();
    } finally {
      setSyncing(false);
    }
  }, [fetchDashboard]);

  useEffect(() => {
    // On mount: fetch data then sync
    fetchDashboard().then(() => {
      triggerSync();
    });

    // Auto-sync every 8 hours
    const interval = setInterval(triggerSync, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchDashboard, triggerSync]);

  // PWA push notification setup
  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-lg font-semibold">Loading your budget…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4 px-6">
        <div className="text-5xl">😕</div>
        <p className="text-slate-300 text-lg font-bold text-center">Something went wrong</p>
        <button
          onClick={() => { setError(null); setLoading(true); fetchDashboard(); }}
          className="mt-2 px-6 py-3 bg-indigo-600 rounded-xl text-white font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 scroll-smooth-ios">
      {/* Header */}
      <div className="bg-slate-950/95 backdrop-blur-md sticky top-0 z-20 pt-safe border-b border-slate-800">
        <div className="px-4 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">My Budget</h1>
            <SyncStatus lastSync={data.lastSync} syncing={syncing} />
          </div>
          <button
            onClick={triggerSync}
            disabled={syncing || data.isDemo}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 disabled:opacity-40 active:scale-95 transition-transform"
            title="Refresh"
          >
            <svg className={`w-5 h-5 text-slate-300 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 pb-safe space-y-4 pt-4">
        {/* Demo banner */}
        {data.isDemo && <ConnectBankBanner onLinked={triggerSync} />}

        {/* Big spending number */}
        <SpendingOverview
          spent={data.totalSpentThisMonth}
          budget={data.totalBudget}
        />

        {/* Upcoming bills */}
        {data.upcomingBills.length > 0 && (
          <UpcomingBills bills={data.upcomingBills} />
        )}

        {/* Category breakdown */}
        <CategoryBreakdown categories={data.categoryBreakdown} />

        {/* Charts */}
        <SpendingChart
          categoryBreakdown={data.categoryBreakdown}
          monthlyTrend={data.monthlyTrend}
        />

        {/* Recent transactions */}
        <RecentTransactions transactions={data.recentTransactions} />

        <div className="h-4" />
      </div>
    </div>
  );
}
