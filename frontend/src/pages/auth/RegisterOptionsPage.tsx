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

const iconColorMap: Record<RegistrationRole, string> = {
  trainee: "bg-blue-500/20 text-blue-400",
  provider: "bg-purple-500/20 text-purple-400",
  organization: "bg-indigo-500/20 text-indigo-400",
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
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6 sm:mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
        Create your access
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-6">
        Join the
        <br />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-blue-400">
          SkillTrack
        </span>
        <br />
        ecosystem.
      </h1>

      <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
        Choose the account type that matches your role and start managing
        outcomes, performance and impact from one platform.
      </p>
    </div>
  );

  return (
    <AuthLayout heroContent={heroContent}>
      <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
          Create account
        </h2>
        <p className="text-slate-400 text-sm">
          Select your role to get started.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        {registerOptions.map((option, index) => (
          <button
            key={option.key}
            type="button"
            className="group flex items-center text-left gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
            style={{ animationDelay: `${0.15 + index * 0.08}s` }}
            onClick={() => onSelectRole(option.key)}
          >
            <span
              className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center ${iconColorMap[option.key]} transition-colors duration-200`}
            >
              <RoleIcon role={option.key} />
            </span>
            <span className="flex-1 min-w-0">
              <strong className="block text-white font-semibold mb-1">
                {option.title}
              </strong>
              <small className="block text-slate-400 text-xs">
                {option.description}
              </small>
            </span>
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-white/5 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-200 shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "0.45s" }}>
        <button
          type="button"
          className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors duration-200 py-2"
          onClick={onNavigateToLogin}
        >
          Already have an account?{" "}
          <span className="text-indigo-400 font-medium">Sign in</span>
        </button>
      </div>
    </AuthLayout>
  );
};

export default RegisterOptionsPage;
