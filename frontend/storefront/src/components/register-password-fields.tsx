"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
  PASSWORD_MISMATCH_MESSAGE,
  evaluatePasswordStrength,
  hasMinimumPasswordLength,
  passwordsMatch
} from "@/src/lib/forms/password";
import { PasswordStrengthMeter } from "@/src/components/password-strength-meter";
import { PasswordVisibilityToggle } from "@/src/components/password-visibility-toggle";
import { ui } from "@/src/ui/styles";

export function RegisterPasswordFields() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch(password, confirmPassword);
  const minLengthMet = hasMinimumPasswordLength(password);

  useEffect(() => {
    if (!passwordRef.current) {
      return;
    }
    passwordRef.current.setCustomValidity(minLengthMet ? "" : PASSWORD_MIN_LENGTH_MESSAGE);
  }, [minLengthMet]);

  useEffect(() => {
    if (!confirmRef.current) {
      return;
    }
    confirmRef.current.setCustomValidity(showMismatch ? PASSWORD_MISMATCH_MESSAGE : "");
  }, [showMismatch]);

  return (
    <>
      <label className="block text-sm">
        <span className={ui.text.label + " mb-1 block"}>Password</span>
        <div className="relative">
          <input
            ref={passwordRef}
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            className={ui.form.input + " pr-12"}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
          <PasswordVisibilityToggle
            visible={showPassword}
            controls="register-password"
            onToggle={() => setShowPassword((value) => !value)}
          />
        </div>
        <PasswordStrengthMeter level={strength.level} label={strength.label} />
      </label>
      <label className="block text-sm">
        <span className={ui.text.label + " mb-1 block"}>Confirm password</span>
        <div className="relative">
          <input
            ref={confirmRef}
            id="register-confirm-password"
            name="confirm_password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className={ui.form.input + " pr-12"}
            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
          />
          <PasswordVisibilityToggle
            visible={showConfirmPassword}
            controls="register-confirm-password"
            onToggle={() => setShowConfirmPassword((value) => !value)}
          />
        </div>
        {showMismatch ? (
          <p className="mt-1 text-xs font-medium text-red-700">{PASSWORD_MISMATCH_MESSAGE}</p>
        ) : null}
      </label>
    </>
  );
}
