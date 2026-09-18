import type { RegistrationFormProps } from "../../types/auth.types";
import AuthLayout from "./components/AuthLayout";
import { Input } from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/auth";

const TraineeRegisterPage = ({ onBack }: RegistrationFormProps) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [qualification, setQualification] = useState("");
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
        role: "TRAINEE",
        fullName,
        phone,
        email,
        qualification,
        password,
      });
      navigate("/dashboard/trainee");
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
          Trainee
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
        <span className="inline-flex items-center px-3 py-1 rounded-sm bg-blue-100 text-primary text-xs font-bold uppercase tracking-wider mb-4">
          Trainee
        </span>

        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Create trainee account
        </h2>
        <p className="text-muted-foreground text-base mb-6 sm:mb-8 font-medium">
          Build your learning profile and track your outcomes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <FormField label="Full name" htmlFor="trainee-name">
            <Input
              id="trainee-name"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e: any) => setFullName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Phone number" htmlFor="trainee-phone">
            <Input
              id="trainee-phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e: any) => setPhone(e.target.value)}
              required
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
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
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
              value={qualification}
              onChange={(e: any) => setQualification(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Password" htmlFor="trainee-password">
            <Input
              id="trainee-password"
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
            htmlFor="trainee-confirm-password"
          >
            <Input
              id="trainee-confirm-password"
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
          <span>{isLoading ? "Creating account..." : "Create trainee account"}</span>
        </Button>
      </form>
    </AuthLayout>
  );
};

export default TraineeRegisterPage;
