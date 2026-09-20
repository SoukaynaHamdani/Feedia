import React from 'react';
import { cn } from '../../utils/utils';

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-agricultural-green text-white hover:bg-agricultural-green-dark shadow-md hover:shadow-glow",
    secondary: "bg-agricultural-sunset text-white hover:bg-agricultural-sunset-dark shadow-md hover:shadow-lg",
    outline: "border-2 border-agricultural-green text-agricultural-green hover:bg-agricultural-green/10",
    ghost: "text-slate-600 hover:text-agricultural-green hover:bg-agricultural-green/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-4 text-lg w-full",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
