import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

function Input({ className, type, icon, trailing, ...props }: InputProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground [&>svg]:size-4">
          {icon}
        </div>
      )}
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          "h-10 w-full min-w-0 rounded-xl border border-slate-700/50 bg-slate-800/50 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-300 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-indigo-500/50 hover:bg-slate-800/80 focus:border-indigo-500 focus:bg-slate-900 focus:ring-4 focus:ring-indigo-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
          icon && "pl-10",
          trailing && "pr-10",
          className
        )}
        {...props}
      />
      {trailing && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {trailing}
        </div>
      )}
    </div>
  )
}

export { Input }
