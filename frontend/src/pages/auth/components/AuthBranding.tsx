const AuthBranding = () => {
  return (
    <div className="flex items-center gap-4 group">
      <div className="relative w-12 h-12 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 text-white font-bold flex items-center justify-center shadow-lg shadow-indigo-600/30 overflow-hidden">
        {/* Logo icon */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-6 h-6 relative z-10"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>

        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s linear infinite",
          }}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white tracking-tight">
          SkillTrack
        </h2>
        <p className="text-sm text-slate-400">
          Outcome &amp; Impact Measurement
        </p>
      </div>
    </div>
  );
};

export default AuthBranding;
