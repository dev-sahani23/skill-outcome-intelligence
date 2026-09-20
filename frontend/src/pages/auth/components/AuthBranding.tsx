const AuthBranding = () => {
  return (
    <div className="flex items-center gap-4 group">
      {/* Logo housing — elevated neumorphic circle */}
      <div
        className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden"
        style={{
          background: "#ff4757",
          boxShadow: "var(--shadow-floating), 0 0 0 3px rgba(255,71,87,0.15)",
        }}
      >
        {/* Logo icon — layers SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.8"
          className="w-7 h-7 relative z-10"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        {/* Top-left highlight rim — reinforces 45° lighting */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)",
          }}
        />
      </div>

      <div>
        <h2
          className="text-xl font-bold text-[#2d3436] tracking-tight"
          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}
        >
          SkillTrack
        </h2>
        {/* Monospace subtitle with LED status */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="indus-led-green" aria-label="System online" />
          <p className="indus-label text-[#4a5568]">
            Skill Track Intelligence Layer
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthBranding;
