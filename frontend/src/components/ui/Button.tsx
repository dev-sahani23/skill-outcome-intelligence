import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

const MotionButton = motion.create ? motion.create(ButtonPrimitive) : (motion as any)(ButtonPrimitive);

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border-transparent text-sm font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-200 ease-out outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "glass-button-primary",
        outline:
          "border border-black/10 text-slate-700 bg-white/40 hover:bg-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.05)]",
        secondary:
          "glass-panel-hover text-slate-800",
        ghost:
          "hover:bg-black/5 text-slate-600 hover:text-slate-900",
        destructive:
          "bg-red-500/90 text-white hover:bg-red-500 border border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] backdrop-blur-md",
        link: "text-[#3A86FF] underline-offset-4 hover:underline hover:text-blue-800",
      },
      size: {
        default: "h-14 px-6 gap-2",
        sm: "h-10 px-4 text-xs gap-1.5 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-16 px-8 text-base gap-2.5",
        icon: "size-14",
        "icon-sm": "size-10 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps extends React.ComponentPropsWithoutRef<typeof ButtonPrimitive>, VariantProps<typeof buttonVariants> {
  fullWidth?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <MotionButton
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      {...props as any}
    />
  )
}

export { Button, buttonVariants }
