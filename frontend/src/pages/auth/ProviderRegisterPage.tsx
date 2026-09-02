import type { RegistrationFormProps } from "../../types/auth.types";
import AuthLayout from "./components/AuthLayout";
import Input from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";

const ProviderRegisterPage = ({ onBack }: RegistrationFormProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Provider registration submitted");
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
          Provider
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

      <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
        Provider
      </span>

      <h2 className="text-2xl font-semibold text-white mb-2">
        Create provider account
      </h2>
      <p className="text-slate-400 text-sm mb-8">
        Manage training programs and learner outcomes.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <FormField
            label="Provider / institute name"
            htmlFor="provider-name"
            fullWidth
          >
            <Input
              id="provider-name"
              type="text"
              placeholder="Enter your institute name"
            />
          </FormField>

          <FormField label="Contact person" htmlFor="provider-contact">
            <Input
              id="provider-contact"
              type="text"
              placeholder="Name of contact person"
            />
          </FormField>

          <FormField label="Phone number" htmlFor="provider-phone">
            <Input
              id="provider-phone"
              type="tel"
              placeholder="+91 98765 43210"
            />
          </FormField>

          <FormField
            label="Official email"
            htmlFor="provider-email"
            fullWidth
          >
            <Input
              id="provider-email"
              type="email"
              placeholder="provider@institute.org"
            />
          </FormField>

          <FormField
            label="Programs offered"
            htmlFor="provider-programs"
            fullWidth
          >
            <Input
              id="provider-programs"
              type="text"
              placeholder="e.g. Digital Skills, Placement Program"
            />
          </FormField>

          <FormField label="Password" htmlFor="provider-password">
            <Input
              id="provider-password"
              type="password"
              placeholder="Create a password"
            />
          </FormField>

          <FormField
            label="Confirm password"
            htmlFor="provider-confirm-password"
          >
            <Input
              id="provider-confirm-password"
              type="password"
              placeholder="Repeat your password"
            />
          </FormField>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25"
        >
          <span>Create provider account</span>
        </button>
      </form>
    </AuthLayout>
  );
};

export default ProviderRegisterPage;
