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
    icon: "T",
  },
  {
    key: "provider",
    title: "Provider",
    description: "For training institutes and skill providers",
    icon: "P",
  },
  {
    key: "organization",
    title: "Organization / Admin",
    description: "For departments, administrators and partners",
    icon: "O",
  },
];

const iconColorMap: Record<RegistrationRole, string> = {
  trainee: "bg-blue-500/20 text-blue-400",
  provider: "bg-purple-500/20 text-purple-400",
  organization: "bg-indigo-500/20 text-indigo-400",
};

const RegisterOptionsPage = ({
  onSelectRole,
  onNavigateToLogin,
}: RegisterOptionsPageProps) => {
  const heroContent = (
    <div className="mb-12">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        Create your access
      </div>

      <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
        Join the
        <br />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-blue-400">
          SkillTrack
        </span>
        <br />
        ecosystem.
      </h1>

      <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
        Choose the account type that matches your role and start managing
        outcomes, performance and impact from one platform.
      </p>
    </div>
  );

  return (
    <AuthLayout heroContent={heroContent}>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Create account
        </h2>
        <p className="text-slate-400 text-sm">
          Select your role to get started.
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        {registerOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className="group flex items-center text-left gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all"
            onClick={() => onSelectRole(option.key)}
          >
            <span
              className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center font-bold text-lg ${iconColorMap[option.key]}`}
            >
              {option.icon}
            </span>
            <span className="flex-1">
              <strong className="block text-white font-semibold mb-1">
                {option.title}
              </strong>
              <small className="block text-slate-400 text-xs">
                {option.description}
              </small>
            </span>
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
              →
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors"
        onClick={onNavigateToLogin}
      >
        Already have an account?{" "}
        <span className="text-indigo-400">Sign in</span>
      </button>
    </AuthLayout>
  );
};

export default RegisterOptionsPage;
