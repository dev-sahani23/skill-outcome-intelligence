import type { RegistrationFormProps } from "../../types/auth.types";
import AuthLayout from "./components/AuthLayout";
import { Input } from "../../components/ui/Input";
import FormField from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../lib/auth";
import { ArrowLeft } from "lucide-react";

const TraineeRegisterPage = ({ onBack }: RegistrationFormProps) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [qualification, setQualification] = useState("");
  const [gender, setGender] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/public/districts")
      .then((res) => res.json())
      .then((data) => setDistricts(data.districts || []))
      .catch(console.error);
  }, []);

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
        gender: gender || undefined,
        districtId: districtId || undefined,
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
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm mb-6 sm:mb-8 border-2 border-border">
        <span className="indus-led-blue"></span>
        <span className="indus-label text-primary">Personalized Onboarding</span>
      </div>

      <h1
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text leading-tight tracking-tight mb-4 sm:mb-6"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.9)" }}
      >
        Set up your
        <br />
        <span className="text-[#ff4757]">Trainee</span>
        <br />
        profile.
      </h1>

      <p className="text-base sm:text-lg text-text-muted font-medium leading-relaxed max-w-xl">
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
          className="flex items-center gap-1 text-text-muted hover:text-[#ff4757] transition-colors indus-label mb-6"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-2">
          Create trainee account
        </h2>
        <p className="text-text-muted indus-label mb-6 sm:mb-8">
          Build your learning profile and track your outcomes.
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

          <FormField label="Email address" htmlFor="trainee-email" fullWidth>
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

          <FormField label="Gender" htmlFor="trainee-gender">
            <div className="relative">
              <select
                id="trainee-gender"
                className="indus-input h-14 w-full px-5 py-2 appearance-none cursor-pointer"
                style={{ color: gender ? "#2d3436" : "#94a3b8" }}
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </FormField>

          <FormField label="District" htmlFor="trainee-district" fullWidth>
            <div className="relative">
              <input
                type="text"
                id="trainee-district-search"
                className="indus-input h-14 w-full px-5 py-2"
                onFocus={() => setShowDistrictDropdown(true)}
                onBlur={() => setTimeout(() => setShowDistrictDropdown(false), 200)}
                placeholder="Search district (e.g. Mumbai, Pune)..."
                value={districtSearch}
                onChange={(e: any) => {
                  setDistrictSearch(e.target.value);
                  setDistrictId("");
                  setShowDistrictDropdown(true);
                }}
                autoComplete="off"
                required={!districtId}
              />
              {districtId && (
                <span
                  className="absolute right-3 top-4 text-[#22c55e] text-xs font-bold"
                >
                  ✓ Selected
                </span>
              )}
              {showDistrictDropdown && (
                <div
                  className="absolute z-20 w-full rounded-lg mt-2 overflow-y-auto max-h-56 p-2"
                  style={{
                    background: "#e0e5ec",
                    boxShadow: "var(--shadow-floating)",
                    border: "1px solid #babecc",
                  }}
                >
                  {districts
                    .filter(
                      (d: any) =>
                        districtSearch.length === 0 ||
                        d.name
                          .toLowerCase()
                          .includes(districtSearch.toLowerCase()) ||
                        d.state
                          .toLowerCase()
                          .includes(districtSearch.toLowerCase())
                    )
                    .slice(0, 30)
                    .map((d: any) => (
                      <div
                        key={d.id}
                        className="px-3 py-2 rounded-md hover:bg-white cursor-pointer transition-colors"
                        onMouseDown={() => {
                          setDistrictId(d.id);
                          setDistrictSearch(`${d.name}, ${d.state}`);
                          setShowDistrictDropdown(false);
                        }}
                      >
                        <span className="font-bold text-sm text-text">
                          {d.name}
                        </span>
                        <span className="text-xs text-text-muted ml-2 font-mono">
                          {d.state}
                        </span>
                      </div>
                    ))}
                  {districtSearch.length > 0 &&
                    districts.filter(
                      (d: any) =>
                        d.name
                          .toLowerCase()
                          .includes(districtSearch.toLowerCase()) ||
                        d.state
                          .toLowerCase()
                          .includes(districtSearch.toLowerCase())
                    ).length === 0 && (
                      <div className="px-3 py-2 text-sm font-bold text-[#ff4757]">
                        No districts found
                      </div>
                    )}
                </div>
              )}
              <input type="hidden" value={districtId} required />
            </div>
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

          <FormField label="Confirm password" htmlFor="trainee-confirm-password">
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
          {isLoading ? "Creating account..." : "Create trainee account"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default TraineeRegisterPage;
