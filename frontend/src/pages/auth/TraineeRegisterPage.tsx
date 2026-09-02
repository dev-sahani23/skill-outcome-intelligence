import type { RegistrationFormProps } from "../../types/auth.types";
import AuthLayout from "./components/AuthLayout";
import Input from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";

const TraineeRegisterPage = ({ onBack }: RegistrationFormProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Trainee registration submitted");
  };

  const heroContent = (
    <div className="mb-12">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        Personalized onboarding
      </div>

      <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
        Set up your
        <br />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-blue-400">
          Trainee
        </span>
        <br />
        profile.
      </h1>

      <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
        Fill in your details to create the right account and start using the
        platform for tracking outcomes and impact.
      </p>
    </div>
  );

  return (
    <AuthLayout
      heroContent={heroContent}
      hideHeroOnMobile
      formMaxWidth="xl"
    >
      <button
        type="button"
        className="text-sm text-slate-400 hover:text-white transition-colors mb-6 flex items-center gap-1"
        onClick={onBack}
      >
        ← Back
      </button>

      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
        Trainee
      </span>

      <h2 className="text-2xl font-semibold text-white mb-2">
        Create trainee account
      </h2>
      <p className="text-slate-400 text-sm mb-8">
        Build your learning profile and track your outcomes.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <FormField label="Full name" htmlFor="trainee-name">
            <Input
              id="trainee-name"
              type="text"
              placeholder="Enter your full name"
            />
          </FormField>

          <FormField label="Phone number" htmlFor="trainee-phone">
            <Input
              id="trainee-phone"
              type="tel"
              placeholder="+91 98765 43210"
            />
          </FormField>

          <FormField
            label="Email address"
            htmlFor="trainee-email"
            fullWidth
          >
            <Input
              id="trainee-email"
              type="email"
              placeholder="name@example.com"
            />
          </FormField>

          <FormField
            label="Current qualification / course"
            htmlFor="trainee-qualification"
            fullWidth
          >
            <Input
              id="trainee-qualification"
              type="text"
              placeholder="e.g. Diploma in Computer Science"
            />
          </FormField>

          <FormField label="Password" htmlFor="trainee-password">
            <Input
              id="trainee-password"
              type="password"
              placeholder="Create a password"
            />
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="trainee-confirm-password"
          >
            <Input
              id="trainee-confirm-password"
              type="password"
              placeholder="Repeat your password"
            />
          </FormField>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
        >
          <span>Create trainee account</span>
        </button>
      </form>
    </AuthLayout>
  );
};

export default TraineeRegisterPage;
