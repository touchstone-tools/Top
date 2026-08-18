import { useState, useEffect, useRef } from 'react';
import type { PerformanceRecord } from '../utils/dataFetcher';
import { cleanName } from '../utils/dataFetcher';
import { isDateInRange, getToday } from '../utils/dateUtils';

interface RecentActivityProps {
  allRecords: PerformanceRecord[];
  lastUpdated: Date | null;
}

interface ActivityItem {
  name: string;
  key: string;       // unique row key
  seenAt: number;    // timestamp when first observed
}

const RecentActivity = ({ allRecords, lastUpdated }: RecentActivityProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const seenMapRef = useRef(new Map<string, number>());
  const [, setTick] = useState(0);

  // Force re-render every 30s to keep relative times fresh
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(iv);
  }, []);

  // Build / update activity feed whenever records change
  useEffect(() => {
    const todayRange = getToday();
    const todayRecords = allRecords.filter((r) => isDateInRange(r.date, todayRange));

    // Sort by row index descending (last rows = most recent sales)
    const sorted = [...todayRecords].sort((a, b) => b.rowIndex - a.rowIndex);

    const now = Date.now();
    const seenMap = seenMapRef.current;

    // For each record, assign a "first seen" timestamp.
    // New records that weren't seen before get "now".
    // Records already seen keep their original timestamp.
    const newItems: ActivityItem[] = [];
    const usedNames = new Set<string>();

    for (const rec of sorted) {
      const name = cleanName(rec.associate);
      // Unique key per row so the same person can appear multiple times
      const key = `${rec.associate}__${rec.rowIndex}`;

      // Skip duplicate names — only show the most recent sale per person
      if (usedNames.has(name.toLowerCase())) continue;
      usedNames.add(name.toLowerCase());

      if (!seenMap.has(key)) {
        seenMap.set(key, now);
      }

      newItems.push({
        name,
        key,
        seenAt: seenMap.get(key)!,
      });

      if (newItems.length >= 5) break;
    }

    setItems(newItems);
  }, [allRecords, lastUpdated]);

  if (items.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 max-w-[17rem] sm:max-w-xs">
      {/* Toggle button when collapsed */}
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-800/90 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/30 cursor-pointer hover:bg-navy-700/90 transition-all"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-white/70">Recent Activity</span>
          <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div className="rounded-xl bg-navy-800/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden animate-in">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400" />

          {/* Header */}
          <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-emerald-400/90 uppercase tracking-wider">
                Recent Activity
              </span>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer group"
              aria-label="Collapse"
            >
              <svg className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          {/* Activity list */}
          <div className="px-3.5 pb-3 space-y-1.5">
            {items.map((item, i) => (
              <ActivityRow key={item.key} item={item} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function ActivityRow({ item, index }: { item: ActivityItem; index: number }) {
  const ago = getRelativeTime(item.seenAt);

  return (
    <div
      className="flex items-start gap-2 py-1.5 fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Sale icon */}
      <span className="text-xs mt-0.5 flex-shrink-0">🛒</span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] sm:text-xs leading-snug text-white/70">
          <span className="font-semibold text-white/90">{item.name}</span>
          {' '}got a sale
        </p>
        <p className="text-[9px] sm:text-[10px] text-white/30 mt-0.5">{ago}</p>
      </div>
    </div>
  );
}

function getRelativeTime(timestamp: number): string {
  const diff = Math.max(0, Date.now() - timestamp);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return 'Just now';
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  return 'Today';
}

export default RecentActivity;
