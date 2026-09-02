const AuthBranding = () => {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-xs tracking-wider shadow-lg shadow-indigo-600/30">
        <span>LAKSHYA</span>
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
