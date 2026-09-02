import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "link";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25",
  ghost:
    "bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl py-3.5 flex items-center px-4 gap-3 transition-all",
  link: "text-indigo-400 font-medium hover:text-indigo-300 transition-colors",
};

const Button = ({
  variant = "primary",
  fullWidth = false,
  children,
  className = "",
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
