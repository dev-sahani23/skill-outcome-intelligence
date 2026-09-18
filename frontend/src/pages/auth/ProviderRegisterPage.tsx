import type { RegistrationFormProps } from "../../types/auth.types";
import AuthLayout from "./components/AuthLayout";
import { Input } from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/auth";

const ProviderRegisterPage = ({ onBack }: RegistrationFormProps) => {
  const [instituteName, setInstituteName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [programs, setPrograms] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await auth.register({
        role: "PROVIDER",
        instituteName,
        fullName: contactPerson, // maps to fullName in schema
        phone,
        email,
        programs,
        password,
      });
      navigate("/dashboard/provider");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const heroContent = (
    <div className="mb-8 lg:mb-12">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary text-sm font-bold uppercase tracking-wider mb-6 sm:mb-8">
        <span className="w-2 h-2 rounded-full bg-primary animate-[pulse_2s_ease-in-out_infinite]"></span>
        Personalized onboarding
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-4 sm:mb-6">
        Set up your
        <br />
        <span className="text-white underline decoration-4 decoration-accent underline-offset-8">
          Provider
        </span>
        <br />
        profile.
      </h1>

      <p className="text-base sm:text-lg text-white font-medium leading-relaxed max-w-xl">
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
        <span className="inline-flex items-center px-3 py-1 rounded-sm bg-purple-100 text-purple-600 text-xs font-bold uppercase tracking-wider mb-4">
          Provider
        </span>

        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Create provider account
        </h2>
        <p className="text-muted-foreground font-medium text-base mb-6 sm:mb-8">
          Manage training programs and learner outcomes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
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
              value={instituteName}
              onChange={(e: any) => setInstituteName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Contact person" htmlFor="provider-contact">
            <Input
              id="provider-contact"
              type="text"
              placeholder="Name of contact person"
              value={contactPerson}
              onChange={(e: any) => setContactPerson(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Phone number" htmlFor="provider-phone">
            <Input
              id="provider-phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e: any) => setPhone(e.target.value)}
              required
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
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
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
              value={programs}
              onChange={(e: any) => setPrograms(e.target.value)}
            />
          </FormField>

          <FormField label="Password" htmlFor="provider-password">
            <Input
              id="provider-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
              minLength={6}
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
              value={confirmPassword}
              onChange={(e: any) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </FormField>
        </div>

        <Button type="submit" fullWidth disabled={isLoading}>
          <span>{isLoading ? "Creating account..." : "Create provider account"}</span>
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ProviderRegisterPage;
