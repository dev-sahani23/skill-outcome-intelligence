import { useState, type FormEvent } from "react";
import AuthLayout from "./components/AuthLayout";
import AuthBranding from "./components/AuthBranding";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/auth";

type LoginPageProps = {
  onNavigateToRegister: () => void;
};

/* ─── Inline SVG Icons ─── */
const XIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

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

const DEMO_ACCOUNTS = [
  {
    roleName: "Government Admin",
    shortRole: "Admin",
    email: "admin@maharashtra.gov.in",
    password: "password123",
    badge: "Govt Admin",
    portal: "State Oversight Portal",
    borderColor: "border-amber-500/40 hover:border-amber-400",
    bgColor: "from-amber-500/15 via-slate-900/90 to-slate-900/90",
    badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    icon: (
      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4z" />
      </svg>
    ),
  },
  {
    roleName: "Training Provider",
    shortRole: "Provider",
    email: "provider@example.com",
    password: "password123",
    badge: "Institute",
    portal: "Provider & Course Portal",
    borderColor: "border-blue-500/40 hover:border-blue-400",
    bgColor: "from-blue-500/15 via-slate-900/90 to-slate-900/90",
    badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    icon: (
      <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    roleName: "Candidate / Trainee",
    shortRole: "Trainee",
    email: "trainee@example.com",
    password: "password123",
    badge: "Student",
    portal: "Trainee Dashboard",
    borderColor: "border-emerald-500/40 hover:border-emerald-400",
    bgColor: "from-emerald-500/15 via-slate-900/90 to-slate-900/90",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    icon: (
      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const LoginPage = ({ onNavigateToRegister }: LoginPageProps) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("admin@maharashtra.gov.in");
  const [password, setPassword] = useState<string>("password123");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [forgotPasswordOpen, setForgotPasswordOpen] = useState<boolean>(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"phone" | "otp" | "success">("phone");
  const [forgotPasswordPhone, setForgotPasswordPhone] = useState<string>("");
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState<string>("");
  const [forgotPasswordError, setForgotPasswordError] = useState<string>("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleLoginWithCredentials = async (loginEmail: string, loginPass: string) => {
    setError("");
    setIsLoading(true);
    try {
      const res = await auth.login({ email: loginEmail, password: loginPass });
      const role = res.user?.role;
      if (role === "TRAINEE") navigate("/dashboard/trainee");
      else if (role === "PROVIDER") navigate("/dashboard/provider");
      else if (role === "GOVERNMENT_ADMIN") navigate("/dashboard/admin");
      else navigate("/dashboard/trainee");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleLoginWithCredentials(email, password);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError("");
    if (!forgotPasswordPhone) {
      setForgotPasswordError("Please enter your phone number");
      return;
    }
    setForgotPasswordLoading(true);
    setTimeout(() => {
      setForgotPasswordLoading(false);
      setForgotPasswordStep("otp");
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError("");
    if (!forgotPasswordOtp) {
      setForgotPasswordError("Please enter the OTP");
      return;
    }
    setForgotPasswordLoading(true);
    setTimeout(() => {
      setForgotPasswordLoading(false);
      setForgotPasswordStep("success");
    }, 1000);
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setTimeout(() => {
      setForgotPasswordStep("phone");
      setForgotPasswordPhone("");
      setForgotPasswordOtp("");
      setForgotPasswordError("");
    }, 300);
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

  const forgotPasswordModal = forgotPasswordOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md relative animate-fade-in-up">
        <button
          type="button"
          onClick={handleCloseForgotPassword}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          {XIcon}
        </button>
        <h3 className="text-xl font-semibold text-white mb-2">
          {forgotPasswordStep === "phone" && "Forgot Password"}
          {forgotPasswordStep === "otp" && "Verify OTP"}
          {forgotPasswordStep === "success" && "Success!"}
        </h3>
        {forgotPasswordError && (
          <div className="mb-4 text-sm text-red-400 p-3 bg-red-500/10 rounded border border-red-500/20">
            {forgotPasswordError}
          </div>
        )}

        {forgotPasswordStep === "phone" && (
          <form onSubmit={handleSendOtp}>
            <p className="text-slate-400 text-sm mb-5">
              Enter your phone number to receive a temporary OTP to reset your password.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
              <Input
                type="tel"
                placeholder="e.g. 9876543210"
                value={forgotPasswordPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForgotPasswordPhone(e.target.value)}
              />
            </div>
            <Button type="submit" fullWidth disabled={forgotPasswordLoading}>
              {forgotPasswordLoading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        )}

        {forgotPasswordStep === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-slate-400 text-sm mb-5">
              We have sent an OTP to <strong className="text-white">{forgotPasswordPhone}</strong>. Enter it below.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">OTP Code</label>
              <Input
                type="text"
                placeholder="Enter OTP"
                value={forgotPasswordOtp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForgotPasswordOtp(e.target.value)}
              />
            </div>
            <Button type="submit" fullWidth disabled={forgotPasswordLoading}>
              {forgotPasswordLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        )}

        {forgotPasswordStep === "success" && (
          <div className="animate-fade-in">
            <p className="text-emerald-400 text-sm mb-6 bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
              OTP Verified Successfully. You can now use your temporary credentials or follow the link sent to your phone to finish resetting your password.
            </p>
            <Button type="button" fullWidth onClick={handleCloseForgotPassword}>
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
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

        {/* Quick Test / Demo Accounts */}
        <div
          className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-slate-700/70 shadow-lg backdrop-blur-md animate-fade-in-up"
          style={{ animationDelay: "0.12s" }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Demo Test Accounts
              </span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded font-mono border border-slate-700/50">
              pwd: password123
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Click any role below to autofill and test its role-specific dashboard:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = email === acc.email;
              return (
                <button
                  key={acc.shortRole}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.password);
                    setError("");
                  }}
                  className={`relative flex flex-col items-start p-2.5 rounded-lg border transition-all duration-200 text-left bg-gradient-to-b ${acc.bgColor} ${acc.borderColor} ${isSelected
                      ? "ring-2 ring-indigo-400/80 shadow-md shadow-indigo-500/10 border-indigo-400"
                      : "opacity-85 hover:opacity-100 hover:scale-[1.02]"
                    }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {acc.icon}
                      <span className="text-xs font-semibold text-white">
                        {acc.shortRole}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] text-indigo-400 font-bold">
                        ✓ Active
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-300 font-mono truncate w-full mb-1">
                    {acc.email}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${acc.badgeColor}`}>
                    {acc.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="mb-5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 [&>svg]:w-5 [&>svg]:h-5">
                {MailIcon}
              </div>
              <Input
                id="email"
                type="email"
                placeholder="name@organization.gov.in"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
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
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot password?
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 [&>svg]:w-5 [&>svg]:h-5">
                {LockIcon}
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {passwordToggle}
              </div>
            </div>
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
            <Button type="submit" fullWidth disabled={isLoading}>
              <span>{isLoading ? "Signing in..." : "Sign in to dashboard"}</span>
              {!isLoading && ArrowRightIcon}
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
      {forgotPasswordModal}
    </>
  );
};

export default LoginPage;
