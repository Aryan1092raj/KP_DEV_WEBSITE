import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "boneyard-js/react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { AdminLoginFallback } from "../../components/common/BoneyardFallbacks";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useAuth } from "../../hooks/useAuth";

const LOGIN_GUARD_STORAGE_KEY = "kp_admin_login_guard";

function createCaptchaChallenge() {
  const first = Math.floor(Math.random() * 8) + 1;
  const second = Math.floor(Math.random() * 8) + 1;
  return { first, second };
}

export default function AdminLoginPage() {
  const ATTEMPT_LIMIT = 5;
  const COOLDOWN_SECONDS = 60;

  const navigate = useNavigate();
  const { isAdmin, loading, login, session } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [inlineFeedback, setInlineFeedback] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, captcha: false });
  const [formErrors, setFormErrors] = useState({ email: "", password: "", captcha: "" });
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaChallenge, setCaptchaChallenge] = useState(() => createCaptchaChallenge());
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const captchaExpected = String(captchaChallenge.first + captchaChallenge.second);

  const remainingLockSeconds = useMemo(() => {
    if (!lockUntil) {
      return 0;
    }
    return Math.max(0, Math.ceil((lockUntil - now) / 1000));
  }, [lockUntil, now]);

  const isLocked = remainingLockSeconds > 0;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.sessionStorage.getItem(LOGIN_GUARD_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      const nextAttempts = Number(parsed?.failedAttempts);
      const nextLockUntil = Number(parsed?.lockUntil);

      if (Number.isFinite(nextAttempts) && nextAttempts >= 0) {
        setFailedAttempts(nextAttempts);
      }

      if (Number.isFinite(nextLockUntil) && nextLockUntil > Date.now()) {
        setLockUntil(nextLockUntil);
      }
    } catch {
      window.sessionStorage.removeItem(LOGIN_GUARD_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (failedAttempts === 0 && !lockUntil) {
      window.sessionStorage.removeItem(LOGIN_GUARD_STORAGE_KEY);
      return;
    }

    window.sessionStorage.setItem(
      LOGIN_GUARD_STORAGE_KEY,
      JSON.stringify({ failedAttempts, lockUntil })
    );
  }, [failedAttempts, lockUntil]);

  useEffect(() => {
    if (session && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [session, isAdmin, navigate]);

  useEffect(() => {
    if (!isLocked) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLocked]);

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    const syncNow = () => syncAutofillState();
    const first = window.setTimeout(syncNow, 0);
    const second = window.setTimeout(syncNow, 160);
    const third = window.setTimeout(syncNow, 420);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncNow();
      }
    };

    window.addEventListener("focus", syncNow);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
      window.clearTimeout(third);
      window.removeEventListener("focus", syncNow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loading]);

  if (!loading && session && isAdmin) {
    return <Navigate replace to="/admin" />;
  }

  if (loading) {
    return (
      <Skeleton
        fallback={<AdminLoginFallback />}
        fixture={<AdminLoginFallback />}
        loading
        name="admin-login"
      >
        <AdminLoginFallback />
      </Skeleton>
    );
  }

  function syncAutofillState() {
    const nextEmail = emailInputRef.current?.value ?? "";
    const nextPassword = passwordInputRef.current?.value ?? "";

    if (!nextEmail && !nextPassword) {
      return;
    }

    setForm((current) => {
      const mergedEmail = current.email || nextEmail;
      const mergedPassword = current.password || nextPassword;

      if (mergedEmail === current.email && mergedPassword === current.password) {
        return current;
      }

      return {
        ...current,
        email: mergedEmail,
        password: mergedPassword,
      };
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setInlineFeedback("");

    if (touched[name]) {
      setFormErrors((current) => ({
        ...current,
        ...validate({ ...form, [name]: value }, captchaAnswer),
      }));
    }
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setFormErrors((current) => ({ ...current, ...validate(form, captchaAnswer) }));
  }

  function validate(nextForm, nextCaptcha) {
    const errors = { email: "", password: "", captcha: "" };
    const emailValue = (nextForm.email || "").trim();
    const passwordValue = nextForm.password || "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailValue)) {
      errors.email = "Enter a valid email address.";
    }

    if (!passwordValue.trim()) {
      errors.password = "Password cannot be empty.";
    }

    if (String(nextCaptcha).trim() !== captchaExpected) {
      errors.captcha = "Captcha answer is incorrect.";
    }

    return errors;
  }

  async function submit(event) {
    event.preventDefault();

    if (isLocked) {
      setInlineFeedback(`Too many attempts. Try again in ${remainingLockSeconds}s.`);
      return;
    }

    setTouched({ email: true, password: true, captcha: true });
    const nextErrors = validate(form, captchaAnswer);
    setFormErrors(nextErrors);

    if (nextErrors.email || nextErrors.password || nextErrors.captcha) {
      return;
    }

    setSubmitting(true);
    setInlineFeedback("");

    try {
      await login(form);
      setFailedAttempts(0);
      setLockUntil(null);
      setCaptchaAnswer("");
      setCaptchaChallenge(createCaptchaChallenge());
      navigate("/admin", { replace: true });
    } catch (requestError) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);
      setCaptchaAnswer("");
      setCaptchaChallenge(createCaptchaChallenge());

      if (nextAttempts >= ATTEMPT_LIMIT) {
        setLockUntil(Date.now() + COOLDOWN_SECONDS * 1000);
      }

      const attemptsLeft = Math.max(0, ATTEMPT_LIMIT - nextAttempts);
      setInlineFeedback(
        attemptsLeft > 0
          ? `Login failed. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`
          : `Rate limit active. Retry in ${COOLDOWN_SECONDS}s.`
      );

      setToast({
        type: "error",
        message: requestError.message || "Unable to log in.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const hasEmailError = Boolean(touched.email && formErrors.email);
  const hasPasswordError = Boolean(touched.password && formErrors.password);
  const hasCaptchaError = Boolean(touched.captcha && formErrors.captcha);
  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const hasPasswordValue = Boolean(form.password.trim());
  const disableSubmit =
    submitting ||
    isLocked ||
    !emailLooksValid ||
    !hasPasswordValue ||
    captchaAnswer.trim() !== captchaExpected;

  return (
    <div className="page-shell">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <div className="mb-6">
        <Link className="btn-secondary !px-4 !py-2" to="/">
          <VariableText label="Back to main page" radius={85} />
        </Link>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <section className="section-card">
          <p className="type-caption">
            <VariableText label="Security checkpoint" radius={85} />
          </p>
          <h1 className="type-h2 mt-4 flex items-center gap-3">
            <span aria-hidden="true" className="allow-accent">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24">
                <path d="M7 10V7a5 5 0 1 1 10 0v3" stroke="currentColor" strokeWidth="1.8" />
                <rect height="10" rx="2" stroke="currentColor" strokeWidth="1.8" width="14" x="5" y="10" />
              </svg>
            </span>
            <VariableText label="Admin control access" />
          </h1>
          <p className="type-body mt-4">
            <VariableText label="Secure sign-in for club coordinators" radius={85} />
          </p>
          <div className="stack-4 mt-6 type-body text-sm">
            <p>
              <VariableText label="Use your official admin credentials to continue." radius={85} />
            </p>
            <p>
              <VariableText label="Only authorized coordinators should access this panel." radius={85} />
            </p>
          </div>
        </section>

        <form
          aria-describedby="security-hints"
          className="section-card stack-4 border border-white/35 shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_25px_80px_rgba(255,255,255,0.08)]"
          onSubmit={submit}
        >
          <h2 className="type-h3">
            <VariableText label="Sign in" />
          </h2>

          <label htmlFor="admin-email">
            <span className="label">
              <VariableText label="Email" radius={85} />
            </span>
            <input
              aria-describedby={hasEmailError ? "admin-email-error" : undefined}
              aria-invalid={hasEmailError}
              autoComplete="email"
              className={`input ${hasEmailError ? "allow-accent-border !border-rose-400" : ""}`}
              id="admin-email"
              name="email"
              onBlur={handleBlur}
              onChange={handleChange}
              onInput={handleChange}
              ref={emailInputRef}
              type="email"
              value={form.email}
            />
            {hasEmailError ? (
              <p className="allow-accent mt-2 text-xs text-rose-300" id="admin-email-error" role="status">
                {formErrors.email}
              </p>
            ) : null}
          </label>

          <label htmlFor="admin-password">
            <span className="label">
              <VariableText label="Password" radius={85} />
            </span>
            <input
              aria-describedby={hasPasswordError ? "admin-password-error" : undefined}
              aria-invalid={hasPasswordError}
              autoComplete="current-password"
              className={`input ${hasPasswordError ? "allow-accent-border !border-rose-400" : ""}`}
              id="admin-password"
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              onInput={handleChange}
              ref={passwordInputRef}
              type={showPassword ? "text" : "password"}
              value={form.password}
            />
            {hasPasswordError ? (
              <p className="allow-accent mt-2 text-xs text-rose-300" id="admin-password-error" role="status">
                {formErrors.password}
              </p>
            ) : null}
          </label>

          <label className="flex items-center gap-2 text-sm" htmlFor="show-password">
            <input
              checked={showPassword}
              className="allow-accent-border h-4 w-4 rounded border border-white/50 bg-transparent"
              id="show-password"
              onChange={(event) => setShowPassword(event.target.checked)}
              type="checkbox"
            />
            <VariableText label="Show password" radius={85} />
          </label>

          <label htmlFor="captcha-answer">
            <span className="label">
              <VariableText
                label={`Captcha: ${captchaChallenge.first} + ${captchaChallenge.second} = ?`}
                radius={85}
              />
            </span>
            <div className="flex gap-3">
              <input
                aria-describedby={hasCaptchaError ? "captcha-error" : undefined}
                aria-invalid={hasCaptchaError}
                className={`input ${hasCaptchaError ? "allow-accent-border !border-rose-400" : ""}`}
                id="captcha-answer"
                inputMode="numeric"
                name="captcha"
                onBlur={handleBlur}
                onChange={(event) => {
                  setCaptchaAnswer(event.target.value);
                  if (formErrors.captcha) {
                    setFormErrors((current) => ({ ...current, captcha: "" }));
                  }
                }}
                type="text"
                value={captchaAnswer}
              />
              <button
                className="btn-secondary !px-4 !py-2"
                onClick={() => {
                  setCaptchaAnswer("");
                  setCaptchaChallenge(createCaptchaChallenge());
                  setTouched((current) => ({ ...current, captcha: false }));
                  setFormErrors((current) => ({ ...current, captcha: "" }));
                }}
                type="button"
              >
                <VariableText label="New" radius={85} />
              </button>
            </div>
            {hasCaptchaError ? (
              <p className="allow-accent mt-2 text-xs text-rose-300" id="captcha-error" role="status">
                {formErrors.captcha}
              </p>
            ) : null}
          </label>

          {inlineFeedback ? (
            <p aria-live="polite" className="allow-accent text-sm text-rose-300">
              {inlineFeedback}
            </p>
          ) : null}
          {isLocked ? (
            <p aria-live="polite" className="allow-accent text-sm text-rose-300">
              Retry available in {remainingLockSeconds}s.
            </p>
          ) : null}

          <button className="btn-primary w-full" disabled={disableSubmit} type="submit">
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                <VariableText label="Signing in..." radius={85} />
              </span>
            ) : (
              <VariableText label="Login" radius={85} />
            )}
          </button>

          <p className="type-caption opacity-80" id="security-hints">
            <VariableText label="Repeated failed attempts will temporarily lock access." radius={85} />
          </p>

          <div className="border-t border-white/20 pt-4 text-center text-xs opacity-80">
            <p>
              <VariableText label="Authorized access only" radius={85} />
            </p>
            <p className="mt-1">
              <VariableText label="© IIT Mandi" radius={85} />
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
