import React from "react";

interface PasswordFieldGroupProps {
  passwordValue: string;
  setPasswordValue: (val: string) => void;
  confirmPasswordValue: string;
  setConfirmPasswordValue: (val: string) => void;
  passwordLabel?: string;
  confirmLabel?: string;
  passwordPlaceholder?: string;
  confirmPlaceholder?: string;
  passwordName?: string;
  confirmName?: string;
}

export default function PasswordFieldGroup({
  passwordValue,
  setPasswordValue,
  confirmPasswordValue,
  setConfirmPasswordValue,
  passwordLabel = "Password",
  confirmLabel = "Confirm Password",
  passwordPlaceholder = "Minimum 8 characters",
  confirmPlaceholder = "Verify password",
  passwordName = "password",
  confirmName = "confirmPassword",
}: PasswordFieldGroupProps) {
  const getStrengthScore = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthScore = getStrengthScore(passwordValue);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={passwordName} className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">
          {passwordLabel}
        </label>
        <input
          id={passwordName}
          type="password"
          name={passwordName}
          required
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          className="w-full min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35"
          placeholder={passwordPlaceholder}
        />
        {passwordValue.length > 0 && (
          <div className="mt-2.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">Password strength:</span>
              <span
                className={`font-semibold ${
                  strengthScore <= 1
                    ? "text-rose-400"
                    : strengthScore <= 3
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {strengthScore <= 1
                  ? "Weak"
                  : strengthScore <= 3
                  ? "Fair"
                  : "Strong"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 h-1">
              <div
                className={`rounded-full h-full transition-colors duration-300 ${
                  passwordValue.length > 0
                    ? strengthScore <= 1
                      ? "bg-rose-500"
                      : strengthScore <= 3
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                    : "bg-white/10"
                }`}
              />
              <div
                className={`rounded-full h-full transition-colors duration-300 ${
                  passwordValue.length > 0 && strengthScore > 1
                    ? strengthScore <= 3
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                    : "bg-white/10"
                }`}
              />
              <div
                className={`rounded-full h-full transition-colors duration-300 ${
                  passwordValue.length > 0 && strengthScore > 2
                    ? strengthScore <= 3
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                    : "bg-white/10"
                }`}
              />
              <div
                className={`rounded-full h-full transition-colors duration-300 ${
                  passwordValue.length > 0 && strengthScore > 3
                    ? "bg-emerald-500"
                    : "bg-white/10"
                }`}
              />
            </div>

            {strengthScore < 4 && (
              <ul className="text-[10px] text-white/40 space-y-1 mt-1.5 font-[family-name:var(--font-inter)]">
                <li
                  className={`flex items-center gap-1.5 ${
                    passwordValue.length >= 8 ? "text-emerald-400/80" : ""
                  }`}
                >
                  <span className="text-xs">
                    {passwordValue.length >= 8 ? "✓" : "○"}
                  </span>
                  At least 8 characters
                </li>
                <li
                  className={`flex items-center gap-1.5 ${
                    /[A-Z]/.test(passwordValue) ? "text-emerald-400/80" : ""
                  }`}
                >
                  <span className="text-xs">
                    {/[A-Z]/.test(passwordValue) ? "✓" : "○"}
                  </span>
                  At least one uppercase letter (A-Z)
                </li>
                <li
                  className={`flex items-center gap-1.5 ${
                    /[0-9]/.test(passwordValue) ? "text-emerald-400/80" : ""
                  }`}
                >
                  <span className="text-xs">
                    {/[0-9]/.test(passwordValue) ? "✓" : "○"}
                  </span>
                  At least one number (0-9)
                </li>
                <li
                  className={`flex items-center gap-1.5 ${
                    /[^A-Za-z0-9]/.test(passwordValue) ? "text-emerald-400/80" : ""
                  }`}
                >
                  <span className="text-xs">
                    {/[^A-Za-z0-9]/.test(passwordValue) ? "✓" : "○"}
                  </span>
                  At least one special character (e.g. @, #, $, !)
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor={confirmName} className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">
          {confirmLabel}
        </label>
        <div className="relative">
          <input
            id={confirmName}
            type="password"
            name={confirmName}
            required
            value={confirmPasswordValue}
            onChange={(e) => setConfirmPasswordValue(e.target.value)}
            className="w-full min-h-10 rounded-lg border border-white/10 bg-black/20 pl-3 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35"
            placeholder={confirmPlaceholder}
          />
          {confirmPasswordValue.length > 0 &&
            confirmPasswordValue === passwordValue && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-emerald-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
        </div>
        {confirmPasswordValue.length > 0 &&
          confirmPasswordValue !== passwordValue && (
            <p className="mt-1.5 text-xs text-rose-400">
              ✗ Passwords do not match
            </p>
          )}
      </div>
    </div>
  );
}
