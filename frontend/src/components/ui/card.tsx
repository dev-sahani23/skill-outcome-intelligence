import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

export interface CardProps extends HTMLMotionProps<"div"> {
  size?: "default" | "sm";
  elevated?: boolean;
  showScrews?: boolean;
  showVents?: boolean;
}

/* Corner screw — rendered as a radial gradient indent */
function ScrewCorner({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const posClass =
    position === "tl" ? "top-3 left-3" :
    position === "tr" ? "top-3 right-3" :
    position === "bl" ? "bottom-3 left-3" :
    "bottom-3 right-3";

  return (
    <div
      className={`absolute ${posClass} w-2.5 h-2.5 rounded-full`}
      style={{
        background: "radial-gradient(circle at 35% 35%, #dde2eb 0%, #ced4de 45%, #bfc5d0 70%, #adb4c2 100%)",
        boxShadow: "inset 0.5px 0.5px 1.5px rgba(255,255,255,0.6), inset -0.5px -0.5px 1px rgba(0,0,0,0.18)",
      }}
      aria-hidden
    />
  );
}

/* Vent slots — 3 recessed pill shapes, top-right */
function VentSlots({ dark = false }: { dark?: boolean }) {
  return (
    <div className="absolute top-3.5 right-10 flex gap-[3px] items-center" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-[3px] h-[18px] rounded-full"
          style={{
            background: dark ? "#3d4446" : "#d0d6e2",
            boxShadow: dark
              ? "inset 0.5px 0.5px 1px rgba(0,0,0,0.4), inset -0.5px -0.5px 1px rgba(255,255,255,0.06)"
              : "inset 0.5px 0.5px 1.5px rgba(0,0,0,0.14), inset -0.5px -0.5px 1px rgba(255,255,255,0.65)",
          }}
        />
      ))}
    </div>
  );
}

function Card({
  className,
  size = "default",
  elevated = false,
  showScrews = true,
  showVents = true,
  ...props
}: CardProps) {
  return (
    <motion.div
      data-slot="card"
      data-size={size}
      className={cn(
        // #f0f2f5 = lighter raised panel sitting on #e0e5ec chassis — exact match to reference
        "relative group/card flex flex-col overflow-hidden rounded-2xl",
        "text-[#2d3436]",
        "transition-all duration-300 ease-out",
        elevated
          ? "shadow-[var(--shadow-floating)]"
          : "shadow-[var(--shadow-card)]",
        size === "default" ? "p-6" : "p-4",
        className
      )}
      style={{
        background: "#f0f2f5",
        ...(props.style as React.CSSProperties | undefined),
      }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {showScrews && (
        <>
          <ScrewCorner position="tl" />
          <ScrewCorner position="tr" />
          <ScrewCorner position="bl" />
          <ScrewCorner position="br" />
        </>
      )}
      {showVents && <VentSlots />}
      {props.children as React.ReactNode}
    </motion.div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-bold leading-snug text-[#2d3436]", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-[#4a5568] font-medium leading-relaxed", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center pt-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
