const EmptyState = () => {
  return (
    <div className="px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        {/* Trophy illustration */}
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-3xl bg-white/5 border border-white/10">
          <span className="text-5xl opacity-30">🏆</span>
        </div>

        <h3 className="text-xl font-bold text-white/50 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
          No Performance Data Yet
        </h3>

        <p className="text-sm text-white/30 font-light leading-relaxed">
          There are no qualifying sales for this period.
          <br />
          Data will appear once sales are recorded.
        </p>

        {/* Decorative stats placeholder */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {['📊', '📈', '🎯'].map((icon, i) => (
            <div key={i} className="w-16 h-16 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center opacity-30">
              <span className="text-2xl">{icon}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
