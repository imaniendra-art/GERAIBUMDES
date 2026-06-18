import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for tailwind classes (can be moved to lib/utils.ts later)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-primary text-surface hover:bg-primary-dark focus:ring-primary",
      secondary: "bg-secondary text-text-main hover:bg-secondary/90 focus:ring-secondary",
      outline: "border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary",
      ghost: "text-primary hover:bg-primary/10 focus:ring-primary",
      danger: "bg-danger text-surface hover:bg-danger/90 focus:ring-danger",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-11 px-6 text-base", // Larger buttons for rural B2B
      lg: "h-14 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
