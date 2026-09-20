import type { RegistrationFormProps } from "../../types/auth.types";
import AuthLayout from "./components/AuthLayout";
import { Button } from "../../components/ui/Button";

const OrganizationRegisterPage = ({ onBack }: RegistrationFormProps) => {
  const heroContent = (
    <div className="mb-8 lg:mb-12">
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-lg shadow-sm mb-6 sm:mb-8 border-2 border-border">
        <span className="indus-led-green"></span>
        <span className="indus-label text-[#22c55e]">Government / Admin Access</span>
      </div>

      <h1
        className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text leading-tight tracking-tight mb-4 sm:mb-6"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.9)" }}
      >
        Set up your
        <br />
        <span className="text-[#22c55e]">Organization</span>
        <br />
        profile.
      </h1>

      <p className="text-base sm:text-lg text-text-muted font-medium leading-relaxed max-w-xl">
        Government admin accounts are provisioned internally by the platform administrators to ensure security and compliance.
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
        <div className="flex items-center gap-3 mb-4">
          <span className="indus-led-green"></span>
          <span className="indus-label text-[#22c55e]">Organization / Admin</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-text mb-2">
          Government Admin Access
        </h2>
        <p className="text-text-muted text-base mb-8 font-medium">
          Set up your organization dashboard and governance controls.
        </p>
      </div>

      {/* Provisioning Notice */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="p-8 rounded-xl bg-chassis shadow-(--shadow-recessed) space-y-4">
          {/* Shield icon */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-white shadow-sm border border-white/50">
              <svg className="w-8 h-8 text-[#22c55e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <p className="text-text font-bold text-xl">Secure Provisioning Required</p>
          </div>

          <p className="text-text text-base leading-relaxed font-medium">
            Government Admin accounts are <strong className="text-[#ff4757]">not self-registered</strong>. They are created and verified internally by platform administrators to maintain data integrity and prevent unauthorized access to sensitive skilling intelligence data.
          </p>

          <div className="space-y-2 text-base text-text-muted font-medium mt-4">
            <p className="font-bold text-text indus-label">To request access:</p>
            <ol className="list-decimal list-inside space-y-1 ml-1 text-sm">
              <li>Contact your departmental IT administrator</li>
              <li>Request onboarding to the SkillTrack platform</li>
              <li>Your credentials will be provisioned and shared securely</li>
            </ol>
          </div>

          <div className="pt-6">
            <a
              href="mailto:admin@skilltrack.gov.in"
              className="inline-flex items-center gap-2 text-sm text-[#3b82f6] hover:text-[#ff4757] transition-colors font-bold uppercase tracking-wider bg-white px-4 py-2 rounded-lg shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
              admin@skilltrack.gov.in
            </a>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          fullWidth
          className="mt-6 text-sm"
          onClick={onBack}
        >
          Back to login
        </Button>
      </div>
    </AuthLayout>
  );
};

export default OrganizationRegisterPage;
