import type { FC } from 'react';

interface HeaderProps {
  lastUpdated: Date | null;
  isLive: boolean;
  onRefresh: () => void;
  loading: boolean;
}

const Header: FC<HeaderProps> = ({ lastUpdated, isLive, onRefresh, loading }) => {
  return (
    <header className="relative pt-8 pb-6 px-4 text-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-1/4 w-32 h-32 bg-gold-400/5 rounded-full blur-3xl float-particle" />
        <div className="absolute top-8 right-1/4 w-24 h-24 bg-blue-400/5 rounded-full blur-2xl float-particle" style={{ animationDelay: '2s' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-gold-400/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Trophy icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-4 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-600/10 border border-gold-400/20 shadow-lg shadow-gold-400/5">
          <span className="text-3xl md:text-4xl">🏆</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3"
          style={{ fontFamily: '"Playfair Display", serif' }}>
          <span className="bg-gradient-to-r from-gold-400 via-amber-200 to-gold-400 bg-clip-text text-transparent">
            PERFORMANCE
          </span>
          <br />
          <span className="text-white/95">LEADERBOARD</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm md:text-base text-white/40 tracking-widest uppercase font-light mb-5">
          Celebrating Excellence • Recognizing Performance • Inspiring Greatness
        </p>

        {/* Status bar */}
        <div className="flex items-center justify-center gap-4 flex-wrap text-xs md:text-sm">
          {/* Live indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className={`inline-block w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 pulse-soft' : 'bg-red-400'}`} />
            <span className={`font-medium ${isLive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isLive ? 'LIVE DATA' : 'OFFLINE'}
            </span>
          </div>

          {/* Last updated */}
          {lastUpdated && (
            <div className="text-white/30">
              Last Updated: {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-white/50 font-medium">Refresh</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
