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
    const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-cta text-white hover:brightness-95 focus:ring-cta shadow-sm",
      secondary: "bg-white border border-primary text-primary hover:bg-gray-50 focus:ring-primary shadow-sm",
      outline: "border border-primary text-primary hover:bg-primary/5 focus:ring-primary",
      ghost: "bg-transparent text-primary hover:bg-primary/10 focus:ring-primary",
      danger: "bg-danger text-white hover:brightness-95 focus:ring-danger shadow-sm",
      success: "bg-success text-white hover:brightness-95 focus:ring-success shadow-sm",
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
