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
  trainee: "bg-blue-100 text-primary",
  provider: "bg-purple-100 text-purple-600",
  organization: "bg-emerald-100 text-secondary",
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
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary text-sm font-bold uppercase tracking-wider mb-6 sm:mb-8">
        <span className="w-2 h-2 rounded-full bg-primary animate-[pulse_2s_ease-in-out_infinite]"></span>
        Create your access
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-6">
        Join the
        <br />
        <span className="text-white underline decoration-4 decoration-accent underline-offset-8">
          SkillTrack
        </span>
        <br />
        ecosystem.
      </h1>

      <p className="text-base sm:text-lg text-white font-medium leading-relaxed max-w-xl">
        Choose the account type that matches your role and start managing
        outcomes, performance and impact from one platform.
      </p>
    </div>
  );

  return (
    <AuthLayout heroContent={heroContent}>
      <div className="mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Create account
        </h2>
        <p className="text-muted-foreground text-base">
          Select your role to get started.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        {registerOptions.map((option, index) => (
          <button
            key={option.key}
            type="button"
            className="group flex items-center text-left gap-4 p-4 rounded-md border-4 border-border bg-white hover:border-primary hover:scale-[1.02] transition-all duration-200 animate-fade-in-up"
            style={{ animationDelay: `${0.15 + index * 0.08}s` }}
            onClick={() => onSelectRole(option.key)}
          >
            <span
              className={`w-14 h-14 shrink-0 rounded-md flex items-center justify-center ${iconColorMap[option.key]} transition-colors duration-200`}
            >
              <RoleIcon role={option.key} />
            </span>
            <span className="flex-1 min-w-0">
              <strong className="block text-foreground font-bold text-lg mb-1">
                {option.title}
              </strong>
              <small className="block text-muted-foreground font-bold text-sm">
                {option.description}
              </small>
            </span>
            <span className="w-10 h-10 flex items-center justify-center border-4 border-border bg-white text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200 shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        ))}
      </div>

      <div className="animate-fade-in mt-6" style={{ animationDelay: "0.45s" }}>
        <button
          type="button"
          className="w-full text-center text-sm font-bold text-muted-foreground hover:text-primary transition-colors duration-200 py-2"
          onClick={onNavigateToLogin}
        >
          Already have an account?{" "}
          <span className="text-primary font-bold">Sign in</span>
        </button>
      </div>
    </AuthLayout>
  );
};

export default RegisterOptionsPage;
