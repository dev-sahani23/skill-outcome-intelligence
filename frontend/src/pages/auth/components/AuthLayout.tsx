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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#e0e5ec] font-sans relative overflow-hidden">

      {/* ─── Left Panel: Chassis base with schematic grid ─── */}
      <motion.section
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.175, 0.885, 0.32, 1.275] }}
        className={`flex-1 relative flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden z-10 ${
          hideHeroOnMobile ? "hidden lg:flex" : "flex"
        }`}
        style={{ background: "#d8dde8" }}
      >
        {/* Schematic grid blueprint overlay */}
        <div
          className="absolute inset-0 pointer-events-none indus-schematic-bg opacity-60"
          aria-hidden
        />

        {/* Radial lighting hotspot — top-left, reinforces 45° light source */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        {/* Neumorphic border-right divider — edge between panels */}
        <div
          className="hidden lg:block absolute right-0 top-12 bottom-12 w-px"
          style={{
            background: "linear-gradient(to bottom, transparent, #babecc 20%, #babecc 80%, transparent)",
          }}
          aria-hidden
        />

        {/* Branding */}
        <div className="relative z-10 mb-12">
          <AuthBranding />
        </div>

        {/* Hero content */}
        <div className="relative z-10 my-auto">
          {heroContent}
        </div>

        {/* Hero footer */}
        {heroFooter && (
          <div className="relative z-10 mt-12 hidden lg:flex items-center gap-3 indus-label text-[#4a5568]">
            {heroFooter}
          </div>
        )}
      </motion.section>

      {/* ─── Right Panel: Raised form panel ─── */}
      <motion.section
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.175, 0.885, 0.32, 1.275] }}
        className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-12 z-20 bg-[#e0e5ec]"
      >
        {/* Form card — raised neumorphic panel with corner screws */}
        <div
          className={`w-full ${formWidthClass} relative rounded-2xl p-8 sm:p-10`}
          style={{
            background: "#f0f2f5",
            boxShadow: "var(--shadow-floating)",
          }}
        >
          {/* Corner screws */}
          {(["tl", "tr", "bl", "br"] as const).map((pos) => {
            const cls =
              pos === "tl" ? "top-3 left-3" :
              pos === "tr" ? "top-3 right-3" :
              pos === "bl" ? "bottom-3 left-3" :
              "bottom-3 right-3";
            return (
              <div
                key={pos}
                className={`absolute ${cls} w-3 h-3 rounded-full`}
                style={{
                  background: "radial-gradient(circle at 35% 35%, #d0d5de 0%, #c5cad4 40%, #b8bdc8 60%, #a8adb8 100%)",
                  boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.5), inset -1px -1px 1px rgba(0,0,0,0.2)",
                }}
                aria-hidden
              />
            );
          })}

          {children}
        </div>
      </motion.section>
    </div>
  );
};

export default AuthLayout;
