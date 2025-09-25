"use client";

import * as React from "react";
import { cn } from "../lib/utils";

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const requirements: PasswordRequirement[] = React.useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasUpperAndLower = hasUppercase && hasLowercase;

    return [
      {
        id: "length",
        label: "8 or more characters",
        met: hasMinLength,
      },
      {
        id: "case",
        label: "Uppercase and lowercase letters",
        met: hasUpperAndLower,
      },
      {
        id: "number",
        label: "At least one number",
        met: hasNumber,
      },
    ];
  }, [password]);

  const allRequirementsMet = requirements.every(req => req.met);

  if (allRequirementsMet) {
    return (
      <div className={cn("flex items-center gap-1.5 px-1 text-[0.8rem] font-medium text-green-600", className)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check size-3">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <p>All requirements met</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {requirements.map((requirement) => (
        <div
          key={requirement.id}
          className={cn(
            "flex items-center gap-1.5 px-1 text-[0.8rem] font-medium transition-colors",
            requirement.met ? "text-green-600" : "text-muted-foreground"
          )}
        >
          {requirement.met ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check size-3">
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-x size-3">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          )}
          <p>{requirement.label}</p>
        </div>
      ))}
    </div>
  );
}
