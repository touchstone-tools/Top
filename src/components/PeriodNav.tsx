import type { FC } from 'react';

export type Period = 'today' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'quarter' | 'year';

interface PeriodNavProps {
  activePeriod: Period;
  onPeriodChange: (period: Period) => void;
  dateLabel: string;
}

const periods: { key: Period; label: string; icon: string; color: string }[] = [
  { key: 'today', label: 'TODAY', icon: '🟢', color: 'from-emerald-400 to-emerald-600' },
  { key: 'thisWeek', label: 'THIS WEEK', icon: '🔵', color: 'from-blue-400 to-blue-600' },
  { key: 'lastWeek', label: 'LAST WEEK', icon: '🔵', color: 'from-indigo-400 to-indigo-600' },
  { key: 'thisMonth', label: 'THIS MONTH', icon: '🟣', color: 'from-purple-400 to-purple-600' },
  { key: 'quarter', label: 'QUARTER', icon: '🟠', color: 'from-orange-400 to-orange-600' },
  { key: 'year', label: 'YEAR', icon: '🟡', color: 'from-yellow-400 to-yellow-600' },
];

const PeriodNav: FC<PeriodNavProps> = ({ activePeriod, onPeriodChange, dateLabel }) => {
  const activeConfig = periods.find(p => p.key === activePeriod);

  return (
    <div className="px-4 mb-8">
      <div className="max-w-5xl mx-auto">
        {/* Tab navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {periods.map((period) => {
            const isActive = activePeriod === period.key;
            return (
              <button
                key={period.key}
                onClick={() => onPeriodChange(period.key)}
                className={`relative px-4 py-2.5 md:px-5 md:py-3 rounded-xl text-xs md:text-sm font-semibold tracking-wider transition-all duration-300 cursor-pointer
                  ${isActive
                    ? `bg-gradient-to-r ${period.color} text-white shadow-lg shadow-white/5 scale-105`
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/5 hover:border-white/15'
                  }`}
              >
                <span className="mr-1.5 text-xs">{period.icon}</span>
                {period.label}
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white/80 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Date range display */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r ${activeConfig?.color || ''} bg-opacity-10 border border-white/10`}
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-white/60 font-medium">{dateLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodNav;
