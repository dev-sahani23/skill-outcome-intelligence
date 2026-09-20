import type { RegistrationFormProps } from "../../types/auth.types";
import AuthLayout from "./components/AuthLayout";
import { Input } from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/auth";
import { ArrowLeft } from "lucide-react";

const ProviderRegisterPage = ({ onBack }: RegistrationFormProps) => {
  const [instituteName, setInstituteName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
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
        registrationNo,
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
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm mb-6 sm:mb-8 border-2 border-border">
        <span className="indus-led-blue"></span>
        <span className="indus-label text-primary">Personalized Onboarding</span>
      </div>

      <h1
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2d3436] leading-tight tracking-tight mb-4 sm:mb-6"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.9)" }}
      >
        Set up your
        <br />
        <span className="text-[#ff4757]">Provider</span>
        <br />
        profile.
      </h1>

      <p className="text-base sm:text-lg text-[#4a5568] font-medium leading-relaxed max-w-xl">
        Fill in your details to create the right account and start using the
        platform for tracking outcomes and impact.
      </p>
    </div>
  );

  return (
    <AuthLayout heroContent={heroContent} hideHeroOnMobile formMaxWidth="xl">
      <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
        <button
          type="button"
          className="flex items-center gap-1 text-[#4a5568] hover:text-[#ff4757] transition-colors indus-label mb-6"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2d3436] tracking-tight mb-2">
          Create provider account
        </h2>
        <p className="text-[#4a5568] indus-label mb-6 sm:mb-8">
          Manage training programs and learner outcomes.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="animate-fade-in-up"
        style={{ animationDelay: "0.2s" }}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#ff4757]/10 border border-[#ff4757]/20 text-[#ff4757] text-sm font-bold">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
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

          <FormField label="Registration Number" htmlFor="provider-registration">
            <Input
              id="provider-registration"
              type="text"
              placeholder="e.g. PRV-2023-XYZ"
              value={registrationNo}
              onChange={(e: any) => setRegistrationNo(e.target.value)}
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

          <FormField label="Official email" htmlFor="provider-email" fullWidth>
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
          {isLoading ? "Creating account..." : "Create provider account"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ProviderRegisterPage;
