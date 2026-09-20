import AuthLayout from "./components/AuthLayout";
import type { RegistrationRole, RegisterOption } from "../../types/auth.types";

type RegisterOptionsPageProps = {
  onSelectRole: (role: RegistrationRole) => void;
  onNavigateToLogin: () => void;
};

const registerOptions: RegisterOption[] = [
  {
    key: "trainee",
    title: "Trainees",
    description: "For learners, students and job seekers",
    icon: "trainee",
  },
  {
    key: "provider",
    title: "Provider",
    description: "For training institutes and skill providers",
    icon: "provider",
  },
  {
    key: "organization",
    title: "Organization / Admin",
    description: "For departments, administrators and partners",
    icon: "organization",
  },
];

const roleConfig: Record<RegistrationRole, { accentColor: string; badge: string }> = {
  trainee:      { accentColor: "#3b82f6", badge: "TRN" },
  provider:     { accentColor: "#a855f7", badge: "EDU" },
  organization: { accentColor: "#22c55e", badge: "GOV" },
};

const RoleIcon = ({ role }: { role: RegistrationRole }) => {
  switch (role) {
    case "trainee":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "provider":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      );
    case "organization":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
          <path d="M3 21h18" />
          <path d="M5 21V5l7-3 7 3v16" />
          <path d="M9 9h1" />
          <path d="M14 9h1" />
          <path d="M9 13h1" />
          <path d="M14 13h1" />
          <path d="M10 21v-4h4v4" />
        </svg>
      );
  }
};

const RegisterOptionsPage = ({
  onSelectRole,
  onNavigateToLogin,
}: RegisterOptionsPageProps) => {
  const heroContent = (
    <div className="mb-8 lg:mb-12">
      {/* LED badge */}
      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6 sm:mb-8"
        style={{ background: "#2d3436", boxShadow: "var(--shadow-card)" }}
      >
        <span className="indus-led-red" aria-label="Active" />
        <span className="indus-label text-[#e0e5ec]">Create your access</span>
      </div>

      <h1
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2d3436] leading-tight tracking-tight mb-4 sm:mb-6"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.9)" }}
      >
        Join the
        <br />
        <span className="text-[#ff4757]">SkillTrack</span>
        <br />
        ecosystem.
      </h1>

      <p className="text-base sm:text-lg text-[#4a5568] font-medium leading-relaxed max-w-sm">
        Choose the account type that matches your role and start managing outcomes, performance and impact from one platform.
      </p>
    </div>
  );

  return (
    <AuthLayout heroContent={heroContent}>
      <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h2
          className="text-2xl sm:text-3xl font-bold text-[#2d3436] mb-1"
          style={{ textShadow: "0 1px 0 rgba(255,255,255,0.8)" }}
        >
          Create account
        </h2>
        <p className="text-[#4a5568] text-sm font-medium">
          Select your role to get started.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        {registerOptions.map((option, index) => {
          const config = roleConfig[option.key];
          return (
            <button
              key={option.key}
              type="button"
              className="group flex items-center text-left gap-4 p-4 rounded-xl transition-all duration-200 animate-fade-in-up"
              style={{
                animationDelay: `${0.15 + index * 0.08}s`,
                background: "#e0e5ec",
                boxShadow: "var(--shadow-card)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `var(--shadow-floating), 0 0 0 2px ${config.accentColor}`;
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-card)";
                (e.currentTarget as HTMLButtonElement).style.transform = "none";
              }}
              onClick={() => onSelectRole(option.key)}
            >
              {/* Icon housing — recessed circular well */}
              <span
                className="w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: "#e0e5ec",
                  boxShadow: "var(--shadow-floating)",
                  color: config.accentColor,
                }}
              >
                <RoleIcon role={option.key} />
              </span>

              <span className="flex-1 min-w-0">
                <strong className="block text-[#2d3436] font-bold text-base mb-0.5">
                  {option.title}
                </strong>
                <small className="block text-[#4a5568] font-medium text-sm">
                  {option.description}
                </small>
              </span>

              {/* Badge + arrow */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="indus-label text-white px-2 py-0.5 rounded"
                  style={{ background: config.accentColor }}
                >
                  {config.badge}
                </span>
                <span
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200"
                  style={{
                    background: "#e0e5ec",
                    boxShadow: "var(--shadow-card)",
                    color: "#4a5568",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M5 12h14" />
                    <path d="M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "0.45s" }}>
        <button
          type="button"
          className="w-full text-center text-sm font-medium text-[#4a5568] hover:text-[#ff4757] transition-colors duration-200 py-2"
          onClick={onNavigateToLogin}
        >
          Already have an account?{" "}
          <span className="text-[#ff4757] font-bold">Sign in</span>
        </button>
      </div>
    </AuthLayout>
  );
};

export default RegisterOptionsPage;
