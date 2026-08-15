import type { FC } from 'react';

interface ErrorStateProps {
  onRetry: () => void;
}

const ErrorState: FC<ErrorStateProps> = ({ onRetry }) => {
  return (
    <div className="px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        {/* Error icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-3xl bg-red-500/10 border border-red-500/20">
          <svg className="w-12 h-12 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-white/60 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
          Unable to Load Performance Data
        </h3>

        <p className="text-sm text-white/30 font-light leading-relaxed mb-8">
          Please check the data connection and try again.
          <br />
          The spreadsheet may require authentication or the connection may be temporarily unavailable.
        </p>

        {/* Retry button */}
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
