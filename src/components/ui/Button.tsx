import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for tailwind classes (can be moved to lib/utils.ts later)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
    
    const variants = {
      primary: "bg-cta text-white hover:bg-[#E07A1F] hover:-translate-y-0.5 hover:shadow-md focus:ring-cta shadow-sm",
      secondary: "bg-white border-2 border-primary text-primary hover:bg-primary/10 hover:-translate-y-0.5 hover:shadow-md focus:ring-primary shadow-sm",
      outline: "border border-border text-text-main hover:border-primary hover:text-primary hover:bg-primary/5 hover:-translate-y-0.5 hover:shadow-md focus:ring-primary bg-surface",
      ghost: "bg-transparent text-primary hover:bg-primary/10 focus:ring-primary",
      danger: "bg-danger text-white hover:brightness-95 hover:-translate-y-0.5 hover:shadow-md focus:ring-danger shadow-sm",
      success: "bg-success text-white hover:brightness-95 hover:-translate-y-0.5 hover:shadow-md focus:ring-success shadow-sm",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6 text-base",
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
