import type { FC } from 'react';
import type { LeaderboardEntry } from '../utils/dataFetcher';

interface PodiumProps {
  top3: LeaderboardEntry[];
}

const Podium: FC<PodiumProps> = ({ top3 }) => {
  if (top3.length === 0) return null;

  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <div className="px-2 sm:px-4 mb-8 sm:mb-10">
      <div className="max-w-4xl mx-auto">
        {/* Desktop Podium Layout — items-end keeps the podium stagger */}
        <div className="hidden md:flex items-end justify-center gap-3 lg:gap-6">
          {/* 2nd Place */}
          {second && (
            <div className="fade-in-up stagger-2 flex-1 max-w-xs">
              <PodiumCard entry={second} rank={2} pad="py-6" />
            </div>
          )}

          {/* 1st Place — tallest */}
          {first && (
            <div className="fade-in-up stagger-1 flex-1 max-w-sm">
              <PodiumCard entry={first} rank={1} pad="py-8" isHero />
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="fade-in-up stagger-3 flex-1 max-w-xs">
              <PodiumCard entry={third} rank={3} pad="py-5" />
            </div>
          )}
        </div>

        {/* Mobile Stacked Layout */}
        <div className="md:hidden space-y-3 sm:space-y-4">
          {first && (
            <div className="fade-in-up stagger-1">
              <PodiumCard entry={first} rank={1} isHero isMobile />
            </div>
          )}
          {second && (
            <div className="fade-in-up stagger-2">
              <PodiumCard entry={second} rank={2} isMobile />
            </div>
          )}
          {third && (
            <div className="fade-in-up stagger-3">
              <PodiumCard entry={third} rank={3} isMobile />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  pad?: string;
  isHero?: boolean;
  isMobile?: boolean;
}

const PodiumCard: FC<PodiumCardProps> = ({ entry, rank, pad, isHero, isMobile }) => {
  const configs = {
    1: {
      medal: '🥇',
      crown: '👑',
      bg: 'from-yellow-900/40 via-amber-800/30 to-yellow-900/40',
      border: 'border-gold-400/40',
      glow: 'gold-glow',
      text: 'text-gold-400',
      badge: 'from-gold-400 to-amber-500',
      rankBg: 'from-gold-400 to-amber-600',
      shadow: 'shadow-gold-400/20',
    },
    2: {
      medal: '🥈',
      crown: '',
      bg: 'from-gray-700/40 via-gray-600/30 to-gray-700/40',
      border: 'border-silver-400/30',
      glow: '',
      text: 'text-silver-300',
      badge: 'from-gray-300 to-gray-400',
      rankBg: 'from-gray-300 to-gray-500',
      shadow: 'shadow-gray-400/10',
    },
    3: {
      medal: '🥉',
      crown: '',
      bg: 'from-orange-900/30 via-amber-900/20 to-orange-900/30',
      border: 'border-bronze-400/30',
      glow: '',
      text: 'text-bronze-400',
      badge: 'from-bronze-400 to-orange-600',
      rankBg: 'from-orange-400 to-orange-700',
      shadow: 'shadow-orange-400/10',
    },
  };

  const config = configs[rank];

  return (
    <div
      className={`
        relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]
        bg-gradient-to-b ${config.bg} backdrop-blur-xl
        border ${config.border}
        ${config.glow}
        ${isHero ? 'shine-effect' : ''}
        ${config.shadow} shadow-xl
        flex flex-col items-center justify-center px-3 sm:px-5 md:px-6
        ${!isMobile && pad ? pad : 'py-4 sm:py-6'}
      `}
    >
      {/* Decorative top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.rankBg}`} />

      {/* Crown for #1 */}
      {isHero && (
        <div className="text-2xl sm:text-3xl md:text-4xl mb-1 medal-bounce">
          {config.crown}
        </div>
      )}

      {/* Rank badge */}
      <div className={`inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-full bg-gradient-to-br ${config.rankBg} shadow-lg mb-2 sm:mb-3`}>
        <span className="text-navy-950 font-black text-sm sm:text-base md:text-xl">#{rank}</span>
      </div>

      {/* Medal */}
      <div className={`text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 ${isHero ? 'medal-bounce' : ''}`}>
        {config.medal}
      </div>

      {/* Associate name — responsive, wraps naturally */}
      <h3 className={`text-center font-bold mb-0.5 sm:mb-1 leading-snug break-words w-full ${
        isHero
          ? 'text-sm sm:text-base md:text-xl lg:text-2xl'
          : 'text-xs sm:text-sm md:text-base lg:text-lg'
      } text-white`}>
        {entry.associate}
      </h3>

      {/* Manager subtitle */}
      <p className={`text-center text-[11px] sm:text-xs md:text-sm ${config.text} opacity-70 font-light italic break-words w-full`}>
        {entry.manager}
      </p>

      {/* Sales count */}
      <div className="mt-2 sm:mt-3 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10">
        <span className="text-[10px] sm:text-xs font-semibold text-white/60 tracking-wider">
          {entry.count} {entry.count === 1 ? 'Sale' : 'Sales'}
        </span>
      </div>

      {/* TOP PERFORMER badge for #1 */}
      {isHero && (
        <div className={`mt-2 sm:mt-3 px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-gradient-to-r ${config.badge} shadow-lg`}>
          <span className="text-[8px] sm:text-[10px] md:text-xs font-black tracking-[0.15em] sm:tracking-[0.2em] text-navy-950 uppercase">
            Top Performer
          </span>
        </div>
      )}
    </div>
  );
};

export default Podium;
