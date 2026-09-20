import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base: uppercase, tracked, 48px min height, hardware-feel
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-bold uppercase tracking-[0.05em] whitespace-nowrap transition-all duration-150 ease-out outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        /* Primary — Safety-Orange accent, neumorphic red-tinted shadow */
        default: "bg-[#ff4757] text-white border-t border-white/20 shadow-(--shadow-btn-accent) hover:brightness-110 active:translate-y-[2px] active:shadow-(--shadow-pressed)",
        /* Secondary — chassis-colored neumorphic lift */
        secondary: "bg-chassis text-text shadow-(--shadow-card) hover:text-[#ff4757] hover:shadow-(--shadow-floating) active:translate-y-[2px] active:shadow-(--shadow-pressed)",
        /* Outline — slight border, lifts on hover */
        outline: "bg-transparent border-2 border-shadow-dark text-text-muted shadow-sm hover:text-[#ff4757] hover:border-[#ff4757] hover:bg-white/40 active:translate-y-[2px]",
        /* Ghost — flat until hovered */
        ghost: "bg-transparent text-text-muted hover:bg-recessed hover:text-text active:translate-y-[1px]",
        /* Destructive — same red as accent */
        destructive: "bg-[#ff4757] text-white shadow-(--shadow-btn-accent) hover:brightness-110 active:translate-y-[2px]",
        /* Link */
        link: "text-[#ff4757] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 min-h-[48px] px-6 gap-2",
        sm: "h-10 min-h-[40px] px-4 text-xs gap-1.5 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-16 min-h-[56px] px-8 text-base gap-2.5",
        icon: "size-14 min-h-[48px]",
        "icon-sm": "size-10 min-h-[40px] [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-16 min-h-[56px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps extends React.ComponentPropsWithoutRef<"button">, VariantProps<typeof buttonVariants> {
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
    <motion.button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}
      /* Mechanical spring physics — slight bounce on release */
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      {...props as any}
    />
  )
}

export { Button, buttonVariants }
