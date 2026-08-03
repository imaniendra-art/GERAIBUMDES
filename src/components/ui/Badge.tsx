import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "primary";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  const variantStyles = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    primary: "bg-primary/10 text-primary border-primary/20",
    neutral: "bg-border/30 text-text-muted border-border",
  };

  return (
    <span
      className={cn(
        "inline-block px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
