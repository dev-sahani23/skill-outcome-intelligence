import type { RegistrationFormProps } from "../../types/auth.types";
import AuthLayout from "./components/AuthLayout";
import Input from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

const ProviderRegisterPage = ({ onBack }: RegistrationFormProps) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Provider registration submitted");
  };

  const heroContent = (
    <div className="mb-8 lg:mb-12">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6 sm:mb-8">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
        Personalized onboarding
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-6">
        Set up your
        <br />
        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-blue-400">
          Provider
        </span>
        <br />
        profile.
      </h1>

      <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
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
      <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <Button
          type="button"
          variant="secondary"
          className="mb-6 text-sm"
          onClick={onBack}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M19 12H5" />
            <path d="M11 18l-6-6 6-6" />
          </svg>
          Back
        </Button>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
          Provider
        </span>

        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
          Create provider account
        </h2>
        <p className="text-slate-400 text-sm mb-6 sm:mb-8">
          Manage training programs and learner outcomes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
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

        <Button type="submit" fullWidth>
          <span>Create provider account</span>
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ProviderRegisterPage;
