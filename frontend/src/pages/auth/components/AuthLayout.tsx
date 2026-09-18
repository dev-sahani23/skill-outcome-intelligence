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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background font-sans relative overflow-hidden">
      {/* Left panel - Bold Primary Color Block */}
      <motion.section
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`flex-1 relative bg-primary text-white flex flex-col justify-between p-8 sm:p-12 lg:p-24 overflow-hidden z-10 ${
          hideHeroOnMobile ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Geometric Decorative Shapes (Flat Design) */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-white/5 rotate-45 pointer-events-none"></div>
        <div className="absolute top-[20%] right-[10%] w-24 h-24 bg-secondary/80 pointer-events-none"></div>

        <div className="relative z-10 mb-12">
          <AuthBranding />
        </div>

        <div className="relative z-10 my-auto">
          {heroContent}
        </div>

        {heroFooter && (
          <div className="relative z-10 mt-12 flex items-center gap-3 font-semibold text-lg hidden lg:flex">
            {heroFooter}
          </div>
        )}
      </motion.section>

      {/* Right form panel - White Background */}
      <motion.section 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="flex-1 flex flex-col justify-center items-center bg-white p-6 sm:p-8 lg:p-12 z-20"
      >
        <div className={`w-full ${formWidthClass} relative`}>
          {children}
        </div>
      </motion.section>
    </div>
  );
};

export default AuthLayout;
