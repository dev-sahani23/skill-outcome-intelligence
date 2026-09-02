import { useState, type FormEvent } from "react";
import AuthLayout from "./components/AuthLayout";
import AuthBranding from "./components/AuthBranding";

type LoginPageProps = {
  onNavigateToRegister: () => void;
};

const LoginPage = ({ onNavigateToRegister }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
  };

  const heroContent = (
    <div className="mb-12">
      <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
        Measure skills.
        <br />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-blue-400">
          Track outcomes.
        </span>
        <br />
        Build India's future.
      </h1>

      <p className="text-lg text-slate-300 leading-relaxed max-w-xl mb-12">
        A unified platform for tracking the complete skilling journey — from
        training and certification to employment, income and long-term career
        outcomes.
      </p>

      <div className="flex flex-wrap items-center gap-6 p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm w-max max-w-full">
        <div className="flex flex-col gap-1">
          <strong className="text-2xl font-bold text-white">360°</strong>
          <span className="text-sm text-slate-400 font-medium">
            Outcome Tracking
          </span>
        </div>

        <div className="w-px h-12 bg-white/10"></div>

        <div className="flex flex-col gap-1">
          <strong className="text-2xl font-bold text-white">AI</strong>
          <span className="text-sm text-slate-400 font-medium">
            Powered Insights
          </span>
        </div>

        <div className="w-px h-12 bg-white/10"></div>

        <div className="flex flex-col gap-1">
          <strong className="text-2xl font-bold text-white">100%</strong>
          <span className="text-sm text-slate-400 font-medium">
            Data Driven
          </span>
        </div>
      </div>
    </div>
  );

  const heroFooter = (
    <>
      <span className="text-xl">🇮🇳</span>
      <p>
        Empowering India's workforce through
        <strong className="text-slate-300 font-medium">
          {" "}
          measurable impact
        </strong>
      </p>
    </>
  );

  return (
    <AuthLayout heroContent={heroContent} heroFooter={heroFooter}>
      {/* Mobile-only branding */}
      <div className="lg:hidden mb-8 flex justify-center">
        <AuthBranding />
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Welcome back
        </h2>
        <p className="text-slate-400 text-sm">
          Sign in to continue to your
          <span className="text-indigo-400 font-medium"> SkillTrack </span>
          dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Email address
          </label>

          <div className="relative flex items-center">
            <svg
              className="absolute left-4 w-5 h-5 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>

            <input
              id="email"
              type="email"
              placeholder="name@organization.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <button
              type="button"
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              onClick={() => console.log("Forgot password")}
            >
              Forgot password?
            </button>
          </div>

          <div className="relative flex items-center">
            <svg
              className="absolute left-4 w-5 h-5 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 018 0v3" />
            </svg>

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />

            <button
              type="button"
              className="absolute right-4 text-slate-400 hover:text-white transition-colors focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "◉" : "◌"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 rounded border border-white/20 bg-slate-950 flex items-center justify-center transition-colors peer-checked:bg-indigo-600 peer-checked:border-indigo-600">
              {rememberMe && (
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
            <span>Remember me</span>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
        >
          <span>Sign in to dashboard</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5"
          >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>

      <div className="relative flex items-center justify-center my-8">
        <div className="flex-1 h-px bg-white/10"></div>
        <span className="px-4 text-sm text-slate-500 font-medium">
          or continue with
        </span>
        <div className="flex-1 h-px bg-white/10"></div>
      </div>

      <button
        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl py-3.5 flex items-center px-4 gap-3 transition-all"
        type="button"
      >
        <div className="w-5 h-5 text-indigo-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3 21h18" />
            <path d="M5 21V5l7-3 7 3v16" />
            <path d="M9 9h1" />
            <path d="M14 9h1" />
            <path d="M9 13h1" />
            <path d="M14 13h1" />
            <path d="M10 21v-4h4v4" />
          </svg>
        </div>

        <span>Sign in with organization</span>

        <svg
          className="w-4 h-4 ml-auto text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      </button>

      <div className="mt-8 text-center text-sm text-slate-400">
        <span>Don't have an account?</span>
        <button
          type="button"
          className="ml-2 text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
          onClick={onNavigateToRegister}
        >
          Create account
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-4 h-4"
        >
          <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span>Secure &amp; encrypted connection</span>
      </div>

      <footer className="mt-8 flex items-center justify-center gap-3 text-sm text-slate-500">
        <span>© 2026 SkillTrack</span>
        <span className="text-slate-700">•</span>
        <button type="button" className="hover:text-slate-300">
          Privacy
        </button>
        <span className="text-slate-700">•</span>
        <button type="button" className="hover:text-slate-300">
          Terms
        </button>
      </footer>
    </AuthLayout>
  );
};

export default LoginPage;
