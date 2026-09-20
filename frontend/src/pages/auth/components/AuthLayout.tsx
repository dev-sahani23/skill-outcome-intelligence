import type { ReactNode } from "react";
import AuthBranding from "./AuthBranding";
import { motion } from "framer-motion";

type AuthLayoutProps = {
  heroContent: ReactNode;
  children: ReactNode;
  heroFooter?: ReactNode;
  formMaxWidth?: "md" | "xl";
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-transparent font-sans relative overflow-hidden">
      {/* Left panel - Transparent to show global mesh gradient */}
      <motion.section
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`flex-1 relative bg-transparent text-slate-900 flex flex-col justify-between p-8 sm:p-12 lg:p-24 overflow-hidden z-10 ${hideHeroOnMobile ? "hidden lg:flex" : "flex"
          }`}
      >
        {/* Subtle glass glowing orbs (bright pastel palette) */}
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-[#3A86FF]/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] bg-[#BDB2FF]/20 blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 mb-12">
          <AuthBranding />
        </div>

        <div className="relative z-10 my-auto drop-shadow-[0_4px_12px_rgba(58,134,255,0.1)]">
          {heroContent}
        </div>

        {heroFooter && (
          <div className="relative z-10 mt-12 flex items-center gap-3 font-semibold text-lg hidden lg:flex text-slate-600">
            {heroFooter}
          </div>
        )}
      </motion.section>

      {/* Right form panel - Centering Content */}
      <motion.section
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 z-20"
      >
        {/* Glassmorphism Inner Card */}
        <div className={`w-full ${formWidthClass} glass-panel p-8 sm:p-10 relative`}>
          {children}
        </div>
      </motion.section>
    </div>
  );
};

export default AuthLayout;
