import { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import PeriodNav from './components/PeriodNav';
import type { Period } from './components/PeriodNav';
import Podium from './components/Podium';
import Top10Card from './components/Top10Card';
import NormalRow from './components/NormalRow';
import LoadingSkeleton from './components/LoadingSkeleton';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';
import ManagerFilter from './components/ManagerFilter';
import Disclaimer from './components/Disclaimer';
import {
  fetchSpreadsheetData,
  calculateLeaderboard,
} from './utils/dataFetcher';
import type { PerformanceRecord, LeaderboardEntry } from './utils/dataFetcher';
import {
  getToday,
  getCurrentWeek,
  getLastWeek,
  getCurrentBusinessMonth,
  getCurrentBusinessQuarter,
  getCurrentBusinessYear,
  isDateInRange,
} from './utils/dateUtils';
import type { DateRange } from './utils/dateUtils';

type AppState = 'loading' | 'ready' | 'error';

function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [allRecords, setAllRecords] = useState<PerformanceRecord[]>([]);
  const [activePeriod, setActivePeriod] = useState<Period>('thisMonth');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedManager, setSelectedManager] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const records = await fetchSpreadsheetData();
      setAllRecords(records);
      setLastUpdated(new Date());
      setAppState('ready');
    } catch {
      // If fetch fails, use empty data with error state
      setAppState('error');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate date range for active period
  const dateRange: DateRange = useMemo(() => {
    switch (activePeriod) {
      case 'today':
        return getToday();
      case 'thisWeek':
        return getCurrentWeek();
      case 'lastWeek':
        return getLastWeek();
      case 'thisMonth':
        return getCurrentBusinessMonth();
      case 'quarter':
        return getCurrentBusinessQuarter();
      case 'year':
        return getCurrentBusinessYear();
      default:
        return getToday();
    }
  }, [activePeriod]);

  // Period title mapping
  const periodTitle = useMemo(() => {
    switch (activePeriod) {
      case 'today': return "Today's Top Performers";
      case 'thisWeek': return 'Current Week Top Performers';
      case 'lastWeek': return 'Last Week Top Performers';
      case 'thisMonth': return 'Business Month Top Performers';
      case 'quarter': return 'Quarterly Top Performers';
      case 'year': return 'Annual Top Performers';
      default: return 'Top Performers';
    }
  }, [activePeriod]);

  // Filter records by date range
  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => isDateInRange(r.date, dateRange));
  }, [allRecords, dateRange]);

  // Get unique managers
  const allManagers = useMemo(() => {
    const managers = new Set<string>();
    filteredRecords.forEach((r) => {
      if (r.manager) managers.add(r.manager);
    });
    return Array.from(managers).sort();
  }, [filteredRecords]);

  // Apply manager filter
  const managerFilteredRecords = useMemo(() => {
    if (!selectedManager) return filteredRecords;
    return filteredRecords.filter((r) => r.manager === selectedManager);
  }, [filteredRecords, selectedManager]);

  // Calculate leaderboard
  const leaderboard: LeaderboardEntry[] = useMemo(() => {
    return calculateLeaderboard(managerFilteredRecords);
  }, [managerFilteredRecords]);

  // Apply search filter
  const displayLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return leaderboard;
    const query = searchQuery.toLowerCase();
    return leaderboard.filter(
      (e) =>
        e.associate.toLowerCase().includes(query) ||
        e.manager.toLowerCase().includes(query)
    );
  }, [leaderboard, searchQuery]);

  // Split into top 3, top 4-10, and rest
  const top3 = displayLeaderboard.slice(0, 3);
  const top4to10 = displayLeaderboard.slice(3, 10);
  const rest = displayLeaderboard.slice(10);

  const handleRefresh = () => {
    loadData();
  };

  const handlePeriodChange = (period: Period) => {
    setActivePeriod(period);
    setSearchQuery('');
    setSelectedManager('');
  };

  return (
    <div className="min-h-screen relative">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[10%] left-[10%] w-80 h-80 bg-blue-500/3 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] right-[10%] w-96 h-96 bg-purple-500/3 rounded-full blur-[140px]" />
          <div className="absolute bottom-[10%] left-[30%] w-72 h-72 bg-gold-400/3 rounded-full blur-[100px]" />
        </div>
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <Header
          lastUpdated={lastUpdated}
          isLive={appState === 'ready'}
          onRefresh={handleRefresh}
          loading={refreshing}
        />

        {/* Period Navigation */}
        <PeriodNav
          activePeriod={activePeriod}
          onPeriodChange={handlePeriodChange}
          dateLabel={dateRange.label}
        />

        {/* Main Content */}
        {appState === 'loading' && <LoadingSkeleton />}

        {appState === 'error' && <ErrorState onRetry={handleRefresh} />}

        {appState === 'ready' && (
          <>
            {/* Filters */}
            <ManagerFilter
              managers={allManagers}
              selectedManager={selectedManager}
              onManagerChange={setSelectedManager}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {/* Period Title */}
            <div className="px-4 mb-6">
              <div className="max-w-4xl mx-auto text-center">
                <h2
                  className="text-xl md:text-2xl font-bold text-white/80 mb-1"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  {periodTitle}
                </h2>
                <p className="text-xs text-white/30">
                  {displayLeaderboard.length} performer{displayLeaderboard.length !== 1 ? 's' : ''} •{' '}
                  {filteredRecords.length} total sale{filteredRecords.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {displayLeaderboard.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Podium - Top 3 */}
                <Podium top3={top3} />

                {/* Top 4-10 Premium Cards */}
                {top4to10.length > 0 && (
                  <div className="px-4 mb-8">
                    <div className="max-w-3xl mx-auto">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                        <span className="text-xs font-semibold text-white/30 tracking-widest uppercase">
                          Top 10
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                      </div>
                      <div className="space-y-3">
                        {top4to10.map((entry, i) => (
                          <Top10Card key={entry.associate} entry={entry} index={i + 3} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Ranks 11+ */}
                {rest.length > 0 && (
                  <div className="px-4 mb-12">
                    <div className="max-w-3xl mx-auto">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                        <span className="text-xs font-semibold text-white/30 tracking-widest uppercase">
                          All Performers
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                      </div>
                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.04] overflow-hidden divide-y divide-white/[0.04]">
                        {rest.map((entry) => (
                          <NormalRow key={entry.associate} entry={entry} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="py-8 text-center">
          <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
          <p className="text-xs text-white/15 font-light tracking-wider">
            Performance Leaderboard Dashboard • Data-Driven Excellence
          </p>
        </footer>
      </div>

      {/* Disclaimer push notification */}
      <Disclaimer />
    </div>
  );
}

export default App;
