import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  trailing?: ReactNode;
};

const Input = ({ icon, trailing, className = "", ...props }: InputProps) => {
  return (
    <div className="relative flex items-center group">
      {icon && (
        <span className="absolute left-4 w-5 h-5 text-slate-400 transition-colors duration-200 group-focus-within:text-indigo-400">
          {icon}
        </span>
      )}

      <input
        className={`w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 ${
          icon ? "pl-11" : "pl-4"
        } ${
          trailing ? "pr-12" : "pr-4"
        } text-white placeholder-slate-500 hover:border-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 focus:bg-slate-900/60 transition-all duration-200 ${className}`}
        {...props}
      />

      {trailing && (
        <span className="absolute right-4">{trailing}</span>
      )}
    </div>
  );
};

export default Input;
