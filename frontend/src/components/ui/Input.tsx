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
          "h-14 w-full min-w-0 rounded-md border-0 bg-muted px-4 py-2 text-base font-medium text-foreground placeholder:text-muted-foreground transition-all duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-accent/10 focus:bg-background focus:ring-0 focus:border-2 focus:border-accent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500",
          icon && "pl-12",
          trailing && "pr-12",
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
