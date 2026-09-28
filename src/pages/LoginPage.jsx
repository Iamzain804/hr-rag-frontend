import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { CrocodileLogo } from "../components/CrocodileLogo";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Please enter both email and password");
      return;
    }

    try {
      setIsSubmitting(true);
      const userContext = await login(email, password);
      
      // If user is required to reset temporary password, send to reset screen
      if (userContext.must_reset_password) {
        navigate("/reset-password", { replace: true });
      } else {
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      }
    } catch (err) {
      // Generic secure error message - do not disclose whether user exists
      setLoginError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col justify-between transition-colors duration-200">
      {/* Top Bar with Theme Toggle */}
      <header className="p-6 flex justify-between items-center max-w-5xl w-full mx-auto">
        <CrocodileLogo size="md" withText={true} subtitle="Enterprise Portal" />
        <ThemeToggle />
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-surface border border-border rounded-sm p-8 shadow-sm animate-scaleIn">
          <div className="mb-6 text-center space-y-2">
            <div className="flex justify-center">
              <CrocodileLogo size="xl" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              Employee Sign In
            </h1>
            <p className="text-xs text-text-secondary">
              Enter your corporate credentials to access the contextual HR assistant
            </p>
          </div>

          {loginError && (
            <div
              className="p-3 mb-6 bg-bg border border-cherry/40 dark:border-vibrantRed/50 text-cherry dark:text-vibrantRed rounded-sm flex items-start gap-2 text-sm font-medium"
              role="alert"
            >
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-cherry dark:text-vibrantRed" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1"
              >
                Work Email
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  name="username"
                  type="email"
                  autoComplete="username"
                  tabIndex={1}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2.5 bg-input-bg border border-border text-text-primary text-sm rounded-sm focus:outline-none focus:border-cherry dark:focus:border-lime focus:ring-1 focus:ring-cherry dark:focus:ring-lime placeholder:text-text-secondary/60 transition-colors"
                />
                <Mail size={16} className="absolute right-3 top-3 text-text-secondary" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  tabIndex={2}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2.5 bg-input-bg border border-border text-text-primary text-sm rounded-sm focus:outline-none focus:border-cherry dark:focus:border-lime focus:ring-1 focus:ring-cherry dark:focus:ring-lime placeholder:text-text-secondary/60 transition-colors"
                />
                <Lock size={16} className="absolute right-3 top-3 text-text-secondary" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              tabIndex={3}
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-btn-bg text-btn-text text-sm font-semibold rounded-sm hover:bg-btn-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-btn-text border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Platform</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border text-center text-xs text-text-secondary">
            Default credentials for testing: <br />
            <code className="font-mono text-[11px] text-cherry dark:text-lime font-bold">admin@example.com / Admin@123456</code>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-text-secondary">
        HR RAG Assistant &bull; Microservices Architecture
      </footer>
    </div>
  );
}
