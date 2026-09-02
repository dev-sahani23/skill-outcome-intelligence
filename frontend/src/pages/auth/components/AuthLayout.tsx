import type { ReactNode } from "react";
import AuthBranding from "./AuthBranding";

type AuthLayoutProps = {
  /** Content for the left hero/info panel */
  heroContent: ReactNode;
  /** Content for the right form panel */
  children: ReactNode;
  /** Optional footer below the hero panel (desktop only) */
  heroFooter?: ReactNode;
  /** Max width for the form card — wider for registration forms */
  formMaxWidth?: "md" | "xl";
  /** Whether to hide the hero panel on mobile */
  hideHeroOnMobile?: boolean;
};

const AuthLayout = ({
  heroContent,
  children,
  heroFooter,
  formMaxWidth = "md",
  hideHeroOnMobile = false,
}: AuthLayoutProps) => {
  const formWidthClass = formMaxWidth === "xl" ? "max-w-xl" : "max-w-md";

  return (
    <div className="h-screen relative overflow-hidden bg-slate-950 text-slate-50 font-sans">
      {/* Background with floating orbs and grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full blur-[100px] opacity-35 animate-[pulse_12s_ease-in-out_infinite] w-100 h-100 bg-indigo-600 -top-45 -left-37.5"></div>
        <div className="absolute rounded-full blur-[100px] opacity-35 animate-[pulse_12s_ease-in-out_infinite] w-87.5 h-87.5 bg-blue-600 -right-25 -bottom-30 [animation-delay:-4s]"></div>
        <div className="absolute rounded-full blur-[100px] opacity-15 animate-[pulse_12s_ease-in-out_infinite] w-55 h-55 bg-purple-600 left-[42%] top-[35%] [animation-delay:-8s]"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle at center, black, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle at center, black, transparent 80%)",
          }}
        ></div>
      </div>

      <main className="relative z-10 flex flex-col lg:flex-row h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left hero panel */}
        <section
          className={`flex-1 flex flex-col justify-center pt-8 sm:pt-12 pb-6 sm:pb-8 lg:py-24 pr-0 lg:pr-16 animate-slide-in-left ${
            hideHeroOnMobile ? "hidden lg:flex" : ""
          }`}
        >
          <div className="mb-8 lg:mb-12">
            <AuthBranding />
          </div>

          {heroContent}

          {heroFooter && (
            <div className="mt-auto pt-8 lg:pt-12 items-center gap-3 text-sm text-slate-400 hidden lg:flex">
              {heroFooter}
            </div>
          )}
        </section>

        {/* Right form panel */}
        <section
          className={`flex-1 flex flex-col justify-center items-center lg:items-end w-full ${formWidthClass} lg:max-w-none mx-auto lg:ml-auto pb-8 sm:pb-12 lg:pb-0 pt-4 sm:pt-8 lg:pt-0`}
        >
          <div
            className={`w-full ${formWidthClass} p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/80 ring-1 ring-white/5 animate-slide-in-right hover:border-indigo-500/30 hover:shadow-indigo-500/10 transition-all duration-700 overflow-y-auto max-h-[calc(100vh-2rem)] lg:max-h-[calc(100vh-4rem)] relative group/form-panel`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Subtle glow effect behind the form */}
            <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/5 via-transparent to-purple-500/5 opacity-0 group-hover/form-panel:opacity-100 transition-opacity duration-700 rounded-2xl sm:rounded-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AuthLayout;
