import type { FC } from 'react';
import type { LeaderboardEntry } from '../utils/dataFetcher';

interface Top10CardProps {
  entry: LeaderboardEntry;
  index: number;
}

const Top10Card: FC<Top10CardProps> = ({ entry, index }) => {
  const rank = entry.rank;

  // Gradient borders and styles for ranks 4-10
  const gradients = [
    'from-purple-400/30 to-blue-400/30',
    'from-blue-400/30 to-cyan-400/30',
    'from-cyan-400/30 to-teal-400/30',
    'from-teal-400/30 to-emerald-400/30',
    'from-emerald-400/30 to-green-400/30',
    'from-green-400/30 to-lime-400/30',
    'from-lime-400/30 to-yellow-400/30',
  ];

  const gradientIdx = (rank - 4) % gradients.length;
  const gradient = gradients[gradientIdx >= 0 ? gradientIdx : 0];

  const medals = ['', '', '', '🏅', '🏅', '🏅', '⭐', '⭐', '⭐', '⭐'];
  const medal = medals[rank - 1] || '⭐';

  return (
    <div
      className={`fade-in-up stagger-${Math.min(index + 1, 10)} group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] hover:border-white/15 p-4 md:p-5`}
    >
      {/* Gradient top accent */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-center gap-4">
        {/* Rank circle */}
        <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-inner`}>
          <span className="text-white/90 font-bold text-sm md:text-base">#{rank}</span>
        </div>

        {/* Medal */}
        <div className="text-xl md:text-2xl flex-shrink-0">
          {medal}
        </div>

        {/* Name info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm md:text-base font-bold text-white truncate">
            {entry.associate}
          </h4>
          <p className="text-xs md:text-sm text-white/35 font-light italic truncate">
            {entry.manager}
          </p>
        </div>

        {/* Count */}
        <div className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <span className="text-xs font-semibold text-white/50">
            {entry.count}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Top10Card;
