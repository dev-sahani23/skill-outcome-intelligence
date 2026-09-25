import { useState, useEffect, type FormEvent } from "react";
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosedIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const ArrowRightIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const DEMO_ACCOUNTS = [
  {
    roleName: "Government Admin",
    shortRole: "Admin",
    email: "admin@skillportal.gov.in",
    password: "Demo@1234",
    badge: "GOV",
    portal: "State Oversight Portal",
    accentColor: "#f59e0b",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4z" />
      </svg>
    ),
  },
  {
    roleName: "Training Provider",
    shortRole: "Provider",
    email: "providerA@skillcorp.in",
    password: "Demo@1234",
    badge: "EDU",
    portal: "Provider & Course Portal",
    accentColor: "#3b82f6",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    roleName: "Candidate / Trainee",
    shortRole: "Trainee",
    email: "trainee1@skillportal.com",
    password: "Demo@1234",
    badge: "TRN",
    portal: "Trainee Dashboard",
    accentColor: "#22c55e",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"email" | "otp" | "reset" | "success">("email");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState<string>("");
  const [otpTargetEmail, setOtpTargetEmail] = useState<string>("");
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState<string>("");
  const [forgotPasswordError, setForgotPasswordError] = useState<string>("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resetToken, setResetToken] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

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

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotPasswordError("");
    const targetEmail = forgotPasswordStep === "otp" && otpTargetEmail ? otpTargetEmail : forgotPasswordEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setForgotPasswordError("Please enter a valid email address");
      return;
    }
    setForgotPasswordLoading(true);
    try {
      await auth.sendOtp({ email: targetEmail });
      setOtpTargetEmail(targetEmail);
      setForgotPasswordStep("otp");
      setResendCooldown(30);
    } catch (err: any) {
      if (!err.status && err.message === "Failed to fetch") {
        setForgotPasswordError("Couldn't reach the server, check your connection");
      } else if (err.status === 429) {
        if (err.message.includes("15 minutes")) {
          setForgotPasswordError("Too many OTP requests from this email address, please try again after 15 minutes");
        } else {
          setForgotPasswordError(err.message || "Please wait before requesting another OTP");
        }
      } else {
        setForgotPasswordError(err.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError("");
    const cleanOtp = forgotPasswordOtp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setForgotPasswordError("OTP must be exactly 6 digits");
      return;
    }
    setForgotPasswordLoading(true);
    try {
      const result = await auth.verifyOtp({ email: otpTargetEmail, otp: cleanOtp });
      setResetToken(result.resetToken);
      setForgotPasswordStep("reset");
    } catch (err: any) {
      if (!err.status && err.message === "Failed to fetch") {
        setForgotPasswordError("Couldn't reach the server, check your connection");
      } else if (err.code === "OTP_ATTEMPTS_EXCEEDED") {
        setForgotPasswordStep("email");
        setForgotPasswordOtp("");
        setForgotPasswordError("Too many failed attempts. Please request a new OTP.");
      } else {
        setForgotPasswordError(err.message || "Invalid OTP. Please try again.");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError("");
    if (newPassword.length < 6) {
      setForgotPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotPasswordError("Passwords do not match");
      return;
    }
    setForgotPasswordLoading(true);
    try {
      await auth.resetPassword({ resetToken, newPassword });
      setForgotPasswordStep("success");
    } catch (err: any) {
      setForgotPasswordError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setTimeout(() => {
      setForgotPasswordStep("email");
      setForgotPasswordEmail("");
      setOtpTargetEmail("");
      setForgotPasswordOtp("");
      setForgotPasswordError("");
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
    }, 300);
  };

  /* ─── Hero content ─── */
  const heroContent = (
    <div className="mb-8 lg:mb-12">
      {/* Overarching heading */}
      <h1
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text leading-tight tracking-tight mb-4 sm:mb-6"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.9)" }}
      >
        Measure skills.
        <br />
        <span className="text-[#ff4757]">Track outcomes.</span>
        <br />
        Build India's future.
      </h1>

      <p className="text-base sm:text-lg text-text-muted font-medium leading-relaxed max-w-sm mb-8 sm:mb-10">
        A unified platform for tracking the complete skilling journey — from training and certification to employment and career outcomes.
      </p>

      {/* Stats strip — dark charcoal panel */}
      <div
        className="rounded-xl p-5 flex flex-col sm:flex-row gap-5 sm:gap-0"
        style={{
          background: "#2d3436",
          boxShadow: "8px 8px 20px rgba(0,0,0,0.3), -2px -2px 6px rgba(255,255,255,0.05)",
        }}
      >
        {[
          { value: "360°", label: "Outcome Tracking" },
          { value: "AI", label: "Powered Insights" },
          { value: "100%", label: "Data Driven" },
        ].map((stat, i) => (
          <div key={stat.value} className="flex-1 flex flex-col items-start sm:items-center">
            <strong
              className="text-2xl sm:text-3xl font-bold text-[#ff4757]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {stat.value}
            </strong>
            <span className="indus-label text-[#a8b2d1] mt-1">{stat.label}</span>
            {i < 2 && (
              <div
                className="hidden sm:block absolute"
                style={{
                  width: "1px",
                  height: "40px",
                  background: "rgba(255,255,255,0.1)",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const heroFooter = (
    <>
      <span className="text-xl">🇮🇳</span>
      <p>
        Empowering India's workforce through
        <strong className="text-text font-medium"> measurable impact</strong>
      </p>
    </>
  );

  const passwordToggle = (
    <button
      type="button"
      className="text-text-muted hover:text-[#ff4757] transition-colors duration-200 focus:outline-none"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      tabIndex={-1}
    >
      {showPassword ? EyeOpenIcon : EyeClosedIcon}
    </button>
  );

  /* ─── Forgot Password Modal ─── */
  const forgotPasswordModal = forgotPasswordOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-fade-in">
      <div
        className="relative w-full max-w-md mx-4 rounded-2xl p-6 sm:p-8 animate-fade-in-up"
        style={{
          background: "#f0f2f5",
          boxShadow: "var(--shadow-floating)",
        }}
      >
        {/* Corner screws */}
        {(["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"] as const).map((pos) => (
          <div
            key={pos}
            className={`absolute ${pos} w-3 h-3 rounded-full`}
            style={{
              background: "radial-gradient(circle at 35% 35%, #d0d5de 0%, #c5cad4 40%, #b8bdc8 60%, #a8adb8 100%)",
              boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.5), inset -1px -1px 1px rgba(0,0,0,0.2)",
            }}
            aria-hidden
          />
        ))}

        <button
          type="button"
          onClick={handleCloseForgotPassword}
          className="absolute top-4 right-4 text-text-muted hover:text-[#ff4757] transition-colors p-1 rounded-lg hover:bg-recessed"
          aria-label="Close"
        >
          {XIcon}
        </button>

        <h3 className="text-lg font-bold uppercase tracking-wider text-text mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
          {forgotPasswordStep === "email" && "Forgot Password"}
          {forgotPasswordStep === "otp" && "Verify OTP"}
          {forgotPasswordStep === "reset" && "Set New Password"}
          {forgotPasswordStep === "success" && "Password Reset!"}
        </h3>

        {forgotPasswordError && (
          <div
            className="mb-4 text-sm font-bold text-[#ff4757] p-3 rounded-lg"
            style={{ background: "rgba(255,71,87,0.08)", boxShadow: "var(--shadow-recessed)" }}
          >
            {forgotPasswordError}
          </div>
        )}

        {forgotPasswordStep === "email" && (
          <form onSubmit={handleSendOtp}>
            <p className="text-text-muted text-sm font-medium mb-5">
              Enter your email address to receive a temporary OTP to reset your password.
            </p>
            <div className="mb-6">
              <label className="block indus-label text-text mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="e.g. name@example.com"
                value={forgotPasswordEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForgotPasswordEmail(e.target.value)}
              />
            </div>
            <Button type="submit" fullWidth disabled={forgotPasswordLoading}>
              {forgotPasswordLoading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>
        )}

        {forgotPasswordStep === "otp" && (
          <form onSubmit={handleVerifyOtp}>
            <p className="text-text-muted text-sm font-medium mb-5">
              We have sent an OTP to <strong className="text-text">{otpTargetEmail}</strong>. Enter it below.
            </p>
            <div className="mb-6">
              <label className="block indus-label text-text mb-2">OTP Code</label>
              <Input
                type="text"
                maxLength={6}
                placeholder="6-digit code"
                value={forgotPasswordOtp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForgotPasswordOtp(e.target.value)}
              />
            </div>
            <Button type="submit" fullWidth disabled={forgotPasswordLoading}>
              {forgotPasswordLoading ? "Verifying..." : "Verify OTP"}
            </Button>
            <div className="mt-4 text-center">
              <button
                type="button"
                disabled={resendCooldown > 0 || forgotPasswordLoading}
                onClick={() => handleSendOtp()}
                className={`indus-label transition-colors ${
                  resendCooldown > 0 ? "text-text-muted cursor-not-allowed" : "text-[#ff4757] hover:text-[#d63847]"
                }`}
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {forgotPasswordStep === "reset" && (
          <form onSubmit={handleResetPassword} className="animate-fade-in">
            <p className="text-text-muted text-sm font-medium mb-5">
              OTP verified! Choose a strong new password for <strong className="text-text">{otpTargetEmail}</strong>.
            </p>
            <div className="mb-4">
              <label className="block indus-label text-text mb-2">New Password</label>
              <Input
                type="password"
                placeholder="Min. 6 characters"
                value={newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block indus-label text-text mb-2">Confirm New Password</label>
              <Input
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" fullWidth disabled={forgotPasswordLoading}>
              {forgotPasswordLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}

        {forgotPasswordStep === "success" && (
          <div className="animate-fade-in">
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "#e0e5ec",
                  boxShadow: "var(--shadow-card), 0 0 12px rgba(34,197,94,0.3)",
                }}
              >
                <svg className="w-8 h-8 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-text-muted font-medium text-sm mb-6 text-center">
              Your password has been reset successfully! You can now log in with your new password.
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

        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-1" style={{ textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}>
            Welcome back
          </h2>
          <p className="text-text-muted text-sm font-medium">
            Sign in to continue to your{" "}
            <span className="text-[#ff4757] font-bold">SkillTrack</span> dashboard.
          </p>
        </div>

        {/* ─── Demo Accounts Panel ─── */}
        <div
          className="mb-6 p-5 rounded-xl animate-fade-in-up"
          style={{ animationDelay: "0.12s", background: "#e0e5ec", boxShadow: "var(--shadow-recessed)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="indus-led-red" aria-label="Demo mode active" />
              <span className="indus-label text-text">Demo Accounts</span>
            </div>
            <span
              className="indus-label text-text-muted px-2.5 py-1 rounded-lg"
              style={{ background: "#d1d9e6", boxShadow: "var(--shadow-recessed)" }}
            >
              pwd: password123
            </span>
          </div>

          <p className="text-xs font-medium text-text-muted mb-3">
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
                  className="relative flex flex-col items-start p-3 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: isSelected ? "#f0f2f5" : "#e0e5ec",
                    boxShadow: isSelected
                      ? `var(--shadow-floating), 0 0 0 2px ${acc.accentColor}`
                      : "var(--shadow-card)",
                    transform: isSelected ? "translateY(-2px)" : "none",
                  }}
                >
                  <div className="flex items-center justify-between w-full mb-1.5 relative">
                    <div className="flex items-center gap-1.5" style={{ color: acc.accentColor }}>
                      {acc.icon}
                      <span className="text-sm font-bold text-text">{acc.shortRole}</span>
                    </div>
                    {isSelected && (
                      <div 
                        className="w-2 h-2 rounded-full absolute -top-1 -right-1" 
                        style={{ backgroundColor: acc.accentColor, boxShadow: `0 0 8px ${acc.accentColor}` }} 
                      />
                    )}
                  </div>
                  <span className="text-xs text-text-muted font-medium truncate w-full mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {acc.email}
                  </span>
                  <span
                    className="indus-label px-2 py-0.5 rounded text-white"
                    style={{ background: acc.accentColor, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {acc.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Login Form ─── */}
        <form onSubmit={handleSubmit}>
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm font-bold text-[#ff4757]"
              style={{ background: "rgba(255,71,87,0.08)", boxShadow: "var(--shadow-recessed)" }}
            >
              {error}
            </div>
          )}

          <div className="mb-5 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            <label htmlFor="email" className="block indus-label text-text mb-2">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@organization.gov.in"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              icon={MailIcon}
            />
          </div>

          <div className="mb-5 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block indus-label text-text">
                Password
              </label>
              <button
                type="button"
                className="indus-label text-[#ff4757] hover:text-[#d63847] transition-colors duration-200"
                onClick={() => setForgotPasswordOpen(true)}
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              icon={LockIcon}
              trailing={passwordToggle}
            />
          </div>

          {/* Remember me — mechanical toggle */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer sr-only"
              />
              <div
                className="w-5 h-5 rounded flex items-center justify-center transition-all duration-200"
                style={{
                  boxShadow: rememberMe ? "var(--shadow-pressed)" : "var(--shadow-recessed)",
                  background: rememberMe ? "#ff4757" : "#e0e5ec",
                }}
              >
                {rememberMe && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-text-muted">Remember me</span>
            </label>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Button type="submit" fullWidth disabled={isLoading}>
              <span>{isLoading ? "Signing in..." : "Sign in to dashboard"}</span>
              {!isLoading && ArrowRightIcon}
            </Button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6 sm:my-8 animate-fade-in" style={{ animationDelay: "0.35s" }}>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, #babecc, transparent)" }} />
          <span className="px-4 indus-label text-text-muted">or continue with</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, #babecc, transparent)" }} />
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button type="button" variant="secondary" fullWidth>
            <div className="w-5 h-5 text-text-muted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
          </Button>
        </div>

        <div className="mt-6 sm:mt-8 text-center text-sm font-medium text-text-muted animate-fade-in" style={{ animationDelay: "0.45s" }}>
          <span>Don't have an account?</span>
          <button
            type="button"
            className="ml-2 text-[#ff4757] hover:text-[#d63847] font-bold transition-colors duration-200"
            onClick={onNavigateToRegister}
          >
            Create account
          </button>
        </div>

        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 text-[#22c55e]">
            <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span className="indus-label text-text-muted">Secure &amp; encrypted connection</span>
        </div>

        <footer className="mt-6 sm:mt-8 flex items-center justify-center gap-3 indus-label text-text-muted">
          <span>© 2026 SkillTrack</span>
          <span className="text-[#babecc]">•</span>
          <button type="button" className="hover:text-text transition-colors duration-200">Privacy</button>
          <span className="text-[#babecc]">•</span>
          <button type="button" className="hover:text-text transition-colors duration-200">Terms</button>
        </footer>
      </AuthLayout>
      {forgotPasswordModal}
    </>
  );
};

export default LoginPage;
