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
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-text-muted [&>svg]:size-4 z-10">
          {icon}
        </div>
      )}
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          // Industrial recessed slot — inset shadow, no border, monospace font
          "indus-input h-14 w-full min-w-0 px-5 py-2 text-sm",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
          icon && "pl-12",
          trailing && "pr-12",
          className
        )}
        {...props}
      />
      {trailing && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 z-10">
          {trailing}
        </div>
      )}
    </div>
  )
}

export { Input }
