import type { FC } from 'react';
import type { LeaderboardEntry } from '../utils/dataFetcher';

interface NormalRowProps {
  entry: LeaderboardEntry;
}

const NormalRow: FC<NormalRowProps> = ({ entry }) => {
  return (
    <div className="group flex items-center gap-4 px-4 py-3 md:px-5 md:py-4 rounded-lg transition-all duration-200 hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06]">
      {/* Rank number */}
      <div className="flex-shrink-0 w-8 text-right">
        <span className="text-sm font-semibold text-white/25 group-hover:text-white/40 transition-colors">
          {entry.rank}
        </span>
      </div>

      {/* Vertical divider */}
      <div className="flex-shrink-0 w-px h-8 bg-white/10" />

      {/* Name info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white/70 group-hover:text-white/90 truncate transition-colors">
          {entry.associate}
        </h4>
        <p className="text-xs text-white/25 group-hover:text-white/35 font-light italic truncate transition-colors">
          {entry.manager}
        </p>
      </div>

      {/* Count */}
      <div className="flex-shrink-0">
        <span className="text-xs font-medium text-white/30 group-hover:text-white/50 transition-colors">
          {entry.count} {entry.count === 1 ? 'sale' : 'sales'}
        </span>
      </div>
    </div>
  );
};

export default NormalRow;
