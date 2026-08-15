const LoadingSkeleton = () => {
  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Loading message */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-6 h-6 border-2 border-gold-400/40 border-t-gold-400 rounded-full animate-spin" />
            <span className="text-lg font-semibold text-white/60">
              🏆 Loading Performance Data...
            </span>
          </div>
        </div>

        {/* Skeleton podium */}
        <div className="hidden md:flex items-end justify-center gap-6 mb-10">
          <div className="flex-1 max-w-xs h-48 rounded-2xl shimmer bg-white/[0.03] border border-white/[0.05]" />
          <div className="flex-1 max-w-sm h-64 rounded-2xl shimmer bg-white/[0.03] border border-white/[0.05]" />
          <div className="flex-1 max-w-xs h-40 rounded-2xl shimmer bg-white/[0.03] border border-white/[0.05]" />
        </div>

        {/* Skeleton cards */}
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl shimmer bg-white/[0.03] border border-white/[0.05]"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.05]" />
              <div className="flex-1">
                <div className="h-4 w-48 rounded bg-white/[0.05] mb-2" />
                <div className="h-3 w-32 rounded bg-white/[0.03]" />
              </div>
              <div className="h-6 w-16 rounded-lg bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
