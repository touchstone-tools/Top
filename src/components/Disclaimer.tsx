import { useState, useEffect } from 'react';

const Disclaimer = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Slide in after a short delay
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed) return null;

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50
        max-w-xs sm:max-w-sm
        transition-all duration-500 ease-out
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
      `}
    >
      <div className="relative rounded-xl bg-navy-800/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

        <div className="p-3.5 sm:p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">⚠️</span>
              <span className="text-[11px] sm:text-xs font-bold text-amber-400/90 uppercase tracking-wider">
                Disclaimer
              </span>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors cursor-pointer group"
              aria-label="Dismiss"
            >
              <svg className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <p className="text-[10px] sm:text-[11px] leading-relaxed text-white/45 font-light">
            Sales count is subject to change. These are provisional figures based on submitted data and will be revised for non-billable items. Final stats depend on client approval.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
