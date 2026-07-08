import * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", role = "alert", ...props }, ref) => {
    const baseClasses = "rounded-md border p-4 text-sm";
    const variantClasses =
      variant === "destructive"
        ? "border-red-500/20 bg-red-500/5 text-red-300"
        : "border-primary/20 bg-primary/5 text-primary-foreground";
    return (
      <div
        role={role}
        ref={ref}
        className={cn(baseClasses, variantClasses, className)}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("mt-1 text-sm [&_a]:underline", className)}
      {...props}
    />
  ));
AlertDescription.displayName = "AlertDescription";

/*
  Usage example:
  <Alert variant="destructive" className="mt-2">
    <AlertDescription>⚠️ Something went wrong</AlertDescription>
  </Alert>
*/
