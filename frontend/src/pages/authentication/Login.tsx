import { useState, type FormEvent } from "react";
import "./Login.css";
import TraineeRegister from "./TraineeRegister";
import ProviderRegister from "./ProviderRegister";
import OrganizationRegister from "./OrganizationRegister";

type RegistrationRole = "trainee" | "provider" | "organization";
type AuthView = "login" | "register-options" | "register-form";

const registerOptions = [
  {
    key: "trainee" as const,
    title: "Trainees",
    description: "For learners, students and job seekers",
    icon: "T",
  },
  {
    key: "provider" as const,
    title: "Provider",
    description: "For training institutes and skill providers",
    icon: "P",
  },
  {
    key: "organization" as const,
    title: "Organization / Admin",
    description: "For departments, administrators and partners",
    icon: "O",
  },
];

const Login = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [authView, setAuthView] = useState<AuthView>("login");
  const [selectedRole, setSelectedRole] = useState<RegistrationRole | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log({
      email,
      password,
      rememberMe,
    });
  };

  const renderRegistrationForm = () => {
    if (!selectedRole) {
      return null;
    }

    switch (selectedRole) {
      case "trainee":
        return <TraineeRegister onBack={() => {
          setSelectedRole(null);
          setAuthView("register-options");
        }} />;
      case "provider":
        return <ProviderRegister onBack={() => {
          setSelectedRole(null);
          setAuthView("register-options");
        }} />;
      case "organization":
        return <OrganizationRegister onBack={() => {
          setSelectedRole(null);
          setAuthView("register-options");
        }} />;
      default:
        return null;
    }
  };

  return (
    <div className="login-page">
      <div className="background">
        <div className="gradient-orb orb-one"></div>
        <div className="gradient-orb orb-two"></div>
        <div className="gradient-orb orb-three"></div>
        <div className="grid-pattern"></div>
      </div>

      {authView === "login" && (
        <main className="login-container">
          <section className="login-intro">
            <div className="brand">
              <div className="brand-logo">
                <span>LAKSHYA</span>
              </div>

              <div>
                <h2>SkillTrack</h2>
                <p>Outcome & Impact Measurement</p>
              </div>
            </div>

            <div className="intro-content">

              <h1>
                Measure skills.
                <br />
                <span>Track outcomes.</span>
                <br />
                Build India's future.
              </h1>

              <p className="intro-description">
                A unified platform for tracking the complete skilling journey —
                from training and certification to employment, income and
                long-term career outcomes.
              </p>

              <div className="stats">
                <div className="stat">
                  <strong>360°</strong>
                  <span>Outcome Tracking</span>
                </div>

                <div className="stat-divider"></div>

                <div className="stat">
                  <strong>AI</strong>
                  <span>Powered Insights</span>
                </div>

                <div className="stat-divider"></div>

                <div className="stat">
                  <strong>100%</strong>
                  <span>Data Driven</span>
                </div>
              </div>
            </div>

            <div className="intro-footer">
              <span>🇮🇳</span>
              <p>
                Empowering India's workforce through
                <strong> measurable impact</strong>
              </p>
            </div>
          </section>

          <section className="login-section">
            <div className="login-card">
              <div className="mobile-brand">
                <div className="brand-logo">
                  <span>LAKSHYA</span>
                </div>
              </div>

              <div className="login-header">
                <h2>Welcome back</h2>
                <p>
                  Sign in to continue to your
                  <span> SkillTrack </span>
                  dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email address</label>

                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
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
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label htmlFor="password">Password</label>

                    <button
                      type="button"
                      className="forgot-password"
                      onClick={() => console.log("Forgot password")}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="input-wrapper">
                    <svg
                      className="input-icon"
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
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "◉" : "◌"}
                    </button>
                  </div>
                </div>

                <div className="login-options">
                  <label className="remember">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="custom-checkbox"></span>
                    <span>Remember me</span>
                  </label>
                </div>

                <button type="submit" className="login-button">
                  <span>Sign in to dashboard</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </button>
              </form>

              <div className="divider">
                <span>or continue with</span>
              </div>

              <button className="organization-login" type="button">
                <div className="organization-icon">
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

                <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </button>

              <div className="register">
                <span>Don't have an account?</span>
                <button type="button" onClick={() => setAuthView("register-options")}>
                  Create account
                </button>
              </div>

              <div className="security-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>Secure & encrypted connection</span>
              </div>
            </div>

            <footer className="login-footer">
              <span>© 2026 SkillTrack</span>
              <span className="footer-dot">•</span>
              <button type="button">Privacy</button>
              <span className="footer-dot">•</span>
              <button type="button">Terms</button>
            </footer>
          </section>
        </main>
      )}

      {authView === "register-options" && (
        <main className="login-container register-flow">
          <section className="login-intro">
            <div className="brand">
              <div className="brand-logo">
               <span>LAKSHYA</span>
              </div>
              <div>
                <h2>SkillTrack</h2>
                <p>Outcome & Impact Measurement</p>
              </div>
            </div>

            <div className="intro-content">
              <div className="badge">
                <span className="badge-dot"></span>
                Create your access
              </div>

              <h1>
                Join the
                <br />
                <span>SkillTrack</span>
                <br />
                ecosystem.
              </h1>

              <p className="intro-description">
                Choose the account type that matches your role and start managing
                outcomes, performance and impact from one platform.
              </p>
            </div>
          </section>

          <section className="login-section">
            <div className="login-card auth-choice-card">
              <div className="login-header choice-header">
                <h2>Create account</h2>
                <p>Select your role to get started.</p>
              </div>

              <div className="choice-list">
                {registerOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className="role-option"
                    onClick={() => {
                      setSelectedRole(option.key);
                      setAuthView("register-form");
                    }}
                  >
                    <span className={`role-icon ${option.key}`}>{option.icon}</span>
                    <span className="role-copy">
                      <strong>{option.title}</strong>
                      <small>{option.description}</small>
                    </span>
                    <span className="role-arrow">→</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="secondary-link"
                onClick={() => setAuthView("login")}
              >
                Already have an account? Sign in
              </button>
            </div>
          </section>
        </main>
      )}

      {authView === "register-form" && (
        <main className="login-container register-flow">
          <section className="login-intro">
            <div className="brand">
              <div className="brand-logo">
                <span>LAKSHYA</span>
              </div>
              <div>
                <h2>SkillTrack</h2>
                <p>Outcome & Impact Measurement</p>
              </div>
            </div>

            <div className="intro-content">
              <div className="badge">
                <span className="badge-dot"></span>
                Personalized onboarding
              </div>

              <h1>
                Set up your
                <br />
                <span>{selectedRole === "trainee" ? "Trainee" : selectedRole === "provider" ? "Provider" : "Organization"}</span>
                <br />
                profile.
              </h1>

              <p className="intro-description">
                Fill in your details to create the right account and start using the
                platform for tracking outcomes and impact.
              </p>
            </div>
          </section>

          <section className="login-section">
            {renderRegistrationForm()}
          </section>
        </main>
      )}
    </div>
  );
};

export default Login;