import { useState, type FormEvent } from "react";
import AuthLayout from "./components/AuthLayout";
import AuthBranding from "./components/AuthBranding";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

type LoginPageProps = {
  onNavigateToRegister: () => void;
};

/* ─── Inline SVG Icons ─── */
const MailIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const LockIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 018 0v3" />
  </svg>
);

const EyeOpenIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="w-5 h-5"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosedIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="w-5 h-5"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ArrowRightIcon = (
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
);

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
    <div className="mb-8 lg:mb-12">
      <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-6">
        Measure skills.
        <br />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-blue-400">
          Track outcomes.
        </span>
        <br />
        Build India's future.
      </h1>

      <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mb-8 sm:mb-12">
        A unified platform for tracking the complete skilling journey — from
        training and certification to employment, income and long-term career
        outcomes.
      </p>

      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-sm w-full sm:w-max sm:max-w-full">
        <div className="flex flex-col gap-1">
          <strong className="text-xl sm:text-2xl font-bold text-white">360°</strong>
          <span className="text-xs sm:text-sm text-slate-400 font-medium">
            Outcome Tracking
          </span>
        </div>

        <div className="hidden sm:block w-px h-12 bg-white/10"></div>
        <div className="sm:hidden w-full h-px bg-white/10"></div>

        <div className="flex flex-col gap-1">
          <strong className="text-xl sm:text-2xl font-bold text-white">AI</strong>
          <span className="text-xs sm:text-sm text-slate-400 font-medium">
            Powered Insights
          </span>
        </div>

        <div className="hidden sm:block w-px h-12 bg-white/10"></div>
        <div className="sm:hidden w-full h-px bg-white/10"></div>

        <div className="flex flex-col gap-1">
          <strong className="text-xl sm:text-2xl font-bold text-white">100%</strong>
          <span className="text-xs sm:text-sm text-slate-400 font-medium">
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

  const passwordToggle = (
    <button
      type="button"
      className="text-slate-400 hover:text-white transition-colors duration-200 focus:outline-none"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      tabIndex={-1}
    >
      {showPassword ? EyeOpenIcon : EyeClosedIcon}
    </button>
  );

  return (
    <AuthLayout heroContent={heroContent} heroFooter={heroFooter}>
      {/* Mobile-only branding */}
      <div className="lg:hidden mb-6 sm:mb-8 flex justify-center animate-fade-in">
        <AuthBranding />
      </div>

      <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
          Welcome back
        </h2>
        <p className="text-slate-400 text-sm">
          Sign in to continue to your
          <span className="text-indigo-400 font-medium"> SkillTrack </span>
          dashboard.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Email address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@organization.gov.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={MailIcon}
          />
        </div>

        <div className="mb-5 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300"
            >
              Password
            </label>

            <button
              type="button"
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-200"
              onClick={() => console.log("Forgot password")}
            >
              Forgot password?
            </button>
          </div>

          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={LockIcon}
            trailing={passwordToggle}
          />
        </div>

        <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
          <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-300 group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 rounded border border-white/20 bg-slate-950 flex items-center justify-center transition-all duration-200 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 group-hover:border-white/30">
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

        <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <Button type="submit" fullWidth>
            <span>Sign in to dashboard</span>
            {ArrowRightIcon}
          </Button>
        </div>
      </form>

      <div className="relative flex items-center justify-center my-6 sm:my-8 animate-fade-in" style={{ animationDelay: "0.35s" }}>
        <div className="flex-1 h-px bg-white/10"></div>
        <span className="px-4 text-sm text-slate-500 font-medium">
          or continue with
        </span>
        <div className="flex-1 h-px bg-white/10"></div>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <Button type="button" variant="ghost" fullWidth>
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
        </Button>
      </div>

      <div className="mt-6 sm:mt-8 text-center text-sm text-slate-400 animate-fade-in" style={{ animationDelay: "0.45s" }}>
        <span>Don't have an account?</span>
        <button
          type="button"
          className="ml-2 text-indigo-400 font-medium hover:text-indigo-300 transition-colors duration-200"
          onClick={onNavigateToRegister}
        >
          Create account
        </button>
      </div>

      <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 animate-fade-in" style={{ animationDelay: "0.5s" }}>
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

      <footer className="mt-6 sm:mt-8 flex items-center justify-center gap-3 text-sm text-slate-500">
        <span>© 2026 SkillTrack</span>
        <span className="text-slate-700">•</span>
        <button type="button" className="hover:text-slate-300 transition-colors duration-200">
          Privacy
        </button>
        <span className="text-slate-700">•</span>
        <button type="button" className="hover:text-slate-300 transition-colors duration-200">
          Terms
        </button>
      </footer>
    </AuthLayout>
  );
};

export default LoginPage;
