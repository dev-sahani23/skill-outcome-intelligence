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
        default: "bg-primary text-white hover:bg-secondary",
        outline:
          "border-4 border-primary text-primary bg-transparent hover:bg-accent hover:border-accent hover:text-black",
        secondary:
          "bg-muted text-foreground hover:bg-accent hover:text-black",
        ghost:
          "hover:bg-accent hover:text-black",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-red-500",
        link: "text-primary underline-offset-4 hover:underline hover:text-secondary",
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
