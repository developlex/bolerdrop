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

export function AccountPasswordFields() {
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordStrength = useMemo(() => evaluatePasswordStrength(newPassword), [newPassword]);
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch(newPassword, confirmPassword);
  const minLengthMet = hasMinimumPasswordLength(newPassword);

  useEffect(() => {
    if (!newPasswordRef.current) {
      return;
    }
    newPasswordRef.current.setCustomValidity(minLengthMet ? "" : PASSWORD_MIN_LENGTH_MESSAGE);
  }, [minLengthMet]);

  useEffect(() => {
    if (!confirmPasswordRef.current) {
      return;
    }
    confirmPasswordRef.current.setCustomValidity(showMismatch ? PASSWORD_MISMATCH_MESSAGE : "");
  }, [showMismatch]);

  return (
    <>
      <label className="block text-sm">
        <span className={ui.text.label + " mb-1 block"}>Current password</span>
        <div className="relative">
          <input
            id="account-current-password"
            name="current_password"
            type={currentPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            required
            className={ui.form.input + " pr-12"}
          />
          <PasswordVisibilityToggle
            visible={currentPasswordVisible}
            controls="account-current-password"
            onToggle={() => setCurrentPasswordVisible((value) => !value)}
          />
        </div>
      </label>
      <label className="block text-sm">
        <span className={ui.text.label + " mb-1 block"}>New password</span>
        <div className="relative">
          <input
            ref={newPasswordRef}
            id="account-new-password"
            name="new_password"
            type={newPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            className={ui.form.input + " pr-12"}
            onChange={(event) => setNewPassword(event.currentTarget.value)}
          />
          <PasswordVisibilityToggle
            visible={newPasswordVisible}
            controls="account-new-password"
            onToggle={() => setNewPasswordVisible((value) => !value)}
          />
        </div>
        <PasswordStrengthMeter level={passwordStrength.level} label={passwordStrength.label} />
      </label>
      <label className="block text-sm">
        <span className={ui.text.label + " mb-1 block"}>Confirm new password</span>
        <div className="relative">
          <input
            ref={confirmPasswordRef}
            id="account-confirm-password"
            name="confirm_password"
            type={confirmPasswordVisible ? "text" : "password"}
            autoComplete="new-password"
            required
            className={ui.form.input + " pr-12"}
            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
          />
          <PasswordVisibilityToggle
            visible={confirmPasswordVisible}
            controls="account-confirm-password"
            onToggle={() => setConfirmPasswordVisible((value) => !value)}
          />
        </div>
        {showMismatch ? (
          <p className="mt-1 text-xs font-medium text-red-700">{PASSWORD_MISMATCH_MESSAGE}</p>
        ) : null}
      </label>
    </>
  );
}
