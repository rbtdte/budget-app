'use client';

import { formatDistanceToNow, parseISO } from 'date-fns';

interface Props {
  lastSync: string | null;
  syncing: boolean;
}

export default function SyncStatus({ lastSync, syncing }: Props) {
  if (syncing) {
    return (
      <p className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse-ring" />
        Syncing…
      </p>
    );
  }

  if (!lastSync) {
    return <p className="text-xs text-slate-600 font-semibold">Not yet synced</p>;
  }

  return (
    <p className="text-xs text-slate-500 font-semibold">
      Updated {formatDistanceToNow(parseISO(lastSync), { addSuffix: true })}
    </p>
  );
}
