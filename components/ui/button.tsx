import clsx from "clsx";
import Link from "next/link";
import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  customColors?: boolean;
  customPadding?: boolean;
  href?: string;
  target?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      customColors,
      customPadding,
      href,
      target,
      variant = "default",
      size = "md",
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base",
    };

    const variantClasses = {
      default: "bg-gray-200 text-gray-600 hover:bg-gray-300",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    };

    if (href)
      return (
        <Link
          href={href}
          target={target ?? "_self"}
          className={clsx(
            !customColors && variantClasses[variant],
            !customPadding && sizeClasses[size],
            "inline-flex items-center rounded-[3px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            className
          )}
        >
          {children}
        </Link>
      );
    return (
      <button
        className={clsx(
          !customColors && variantClasses[variant],
          !customPadding && sizeClasses[size],
          "inline-flex items-center rounded-[3px] font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
