import { cn } from "@/lib/utils";
import React from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  rounded?: "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}

export function GlassCard({ 
  children, 
  className, 
  hoverable = false,
  rounded = "2xl",
  ...props 
}: GlassCardProps) {
  const roundedClass = {
    "md": "rounded-md",
    "lg": "rounded-lg",
    "xl": "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    "full": "rounded-full"
  }[rounded];

  return (
    <div 
      className={cn(
        roundedClass,
        "border border-white/10 bg-white/[0.02] backdrop-blur-md",
        hoverable && "transition-all duration-300 hover:border-white/20 hover:bg-white/[0.03]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
