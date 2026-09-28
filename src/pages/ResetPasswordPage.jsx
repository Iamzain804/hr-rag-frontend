import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";

export function ResetPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { user, refreshContext } = useAuth();
  const navigate = useNavigate();

  // Client-side password validation
  const isLengthValid = newPassword.length >= 8;
  const isMatchValid = newPassword && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!isLengthValid) {
      setErrorMessage("New password must be at least 8 characters in length.");
      return;
    }

    if (!isMatchValid) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.changePassword(currentPassword, newPassword);
      setSuccessMessage("Password successfully changed. Refreshing session...");
      
      // Update context (which sets must_reset_password=false)
      await refreshContext();

      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to update password. Please verify current credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col justify-between">
      <header className="p-6 flex justify-between items-center max-w-5xl w-full mx-auto">
        <span className="text-xl font-bold tracking-tight text-cherry dark:text-lime">
          HR RAG Assistant
        </span>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface border border-border rounded-sm p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 border border-border bg-bg mx-auto mb-3 rounded-sm flex items-center justify-center text-cherry dark:text-lime">
              <KeyRound size={22} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary mb-1">
              Password Reset Required
            </h1>
            <p className="text-xs text-text-secondary">
              Welcome {user?.first_name || "User"}! You are using a temporary password and must create a permanent password before continuing.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 mb-4 bg-bg border border-cherry/40 dark:border-vibrantRed/50 text-cherry dark:text-vibrantRed rounded-sm flex items-start gap-2 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 mb-4 bg-bg border border-border text-text-primary rounded-sm flex items-start gap-2 text-sm">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-cherry dark:text-lime" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Temporary Password */}
            <div>
              <label
                htmlFor="current-pw"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1"
              >
                Temporary Password
              </label>
              <input
                id="current-pw"
                type="password"
                required
                tabIndex={1}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter temporary password received"
                className="w-full px-3 py-2 bg-input-bg border border-border text-text-primary text-sm rounded-sm focus:outline-none focus:border-cherry dark:focus:border-lime focus:ring-1 focus:ring-cherry dark:focus:ring-lime"
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="new-pw"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1"
              >
                New Password (min 8 chars)
              </label>
              <input
                id="new-pw"
                type="password"
                required
                tabIndex={2}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create new secure password"
                className="w-full px-3 py-2 bg-input-bg border border-border text-text-primary text-sm rounded-sm focus:outline-none focus:border-cherry dark:focus:border-lime focus:ring-1 focus:ring-cherry dark:focus:ring-lime"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirm-pw"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-pw"
                type="password"
                required
                tabIndex={3}
                value={confirmPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3 py-2 bg-input-bg border border-border text-text-primary text-sm rounded-sm focus:outline-none focus:border-cherry dark:focus:border-lime focus:ring-1 focus:ring-cherry dark:focus:ring-lime"
              />
            </div>

            {/* Password Validation Indicators */}
            <div className="text-xs text-text-secondary space-y-1 pt-1">
              <div className="flex items-center gap-1.5">
                <span className={isLengthValid ? "text-cherry dark:text-lime font-bold" : "text-text-secondary"}>
                  {isLengthValid ? "✓" : "○"} At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={isMatchValid ? "text-cherry dark:text-lime font-bold" : "text-text-secondary"}>
                  {isMatchValid ? "✓" : "○"} Passwords match
                </span>
              </div>
            </div>

            <button
              type="submit"
              tabIndex={4}
              disabled={isSubmitting || !isLengthValid || !isMatchValid}
              className="w-full mt-3 py-2.5 px-4 bg-btn-bg text-btn-text text-sm font-semibold rounded-sm hover:bg-btn-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? "Updating Password..." : "Set Password & Proceed"}
            </button>
          </form>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-text-secondary">
        Security Policy Enforcement &bull; Single-use temporary password policy
      </footer>
    </div>
  );
}
