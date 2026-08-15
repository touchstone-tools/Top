import type { FC } from 'react';

interface ManagerFilterProps {
  managers: string[];
  selectedManager: string;
  onManagerChange: (manager: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ManagerFilter: FC<ManagerFilterProps> = ({
  managers,
  selectedManager,
  onManagerChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="px-4 mb-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search Associate..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-300"
            />
          </div>

          {/* Manager filter dropdown */}
          {managers.length > 1 && (
            <div className="relative">
              <select
                value={selectedManager}
                onChange={(e) => onManagerChange(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-4 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-300 cursor-pointer"
              >
                <option value="">All Managers</option>
                {managers.map((m) => (
                  <option key={m} value={m} className="bg-navy-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerFilter;
