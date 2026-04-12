import { useRef, useState } from "react";
import { Skeleton } from "boneyard-js/react";

import { ApplyPageFallback } from "../../components/common/BoneyardFallbacks";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useOneTimePageHeadingAnimation } from "../../hooks/useOneTimePageHeadingAnimation";
import { applicationService } from "../../services/applicationService";

const initialForm = {
  name: "",
  email: "",
  branch: "",
  batch: "",
  why_join: "",
  skills: "",
};

const fixtureForm = {
  name: "Aarav Sharma",
  email: "aarav@example.com",
  branch: "Computer Science",
  batch: "2026",
  why_join:
    "I want to work on production-grade club infrastructure and contribute to backend and frontend systems.",
  skills: "React, Python, FastAPI, PostgreSQL",
};

export default function ApplyPage() {
  const headingScopeRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const formToRender = boneyardBuildMode ? fixtureForm : form;

  useOneTimePageHeadingAnimation({
    enabled: !boneyardBuildMode,
    scopeRef: headingScopeRef,
    visitTag: "apply",
  });

  function validate(nextForm) {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if ((nextForm.name || "").trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!emailRegex.test((nextForm.email || "").trim())) {
      errors.email = "Enter a valid email address.";
    }

    if ((nextForm.branch || "").trim().length < 2) {
      errors.branch = "Branch must be at least 2 characters.";
    }

    if ((nextForm.batch || "").trim().length < 2) {
      errors.batch = "Batch must be at least 2 characters.";
    }

    const whyJoinLength = (nextForm.why_join || "").trim().length;
    if (whyJoinLength < 10) {
      errors.why_join = "Why you want to join must be at least 10 characters.";
    }

    if ((nextForm.skills || "").trim().length > 500) {
      errors.skills = "Skills and interests must be 500 characters or fewer.";
    }

    return errors;
  }

  function getRequestErrorMessage(requestError, fallbackMessage) {
    if (Array.isArray(requestError?.details) && requestError.details.length > 0) {
      const firstIssue = requestError.details[0];
      if (firstIssue?.msg && Array.isArray(firstIssue?.loc)) {
        return `${firstIssue.loc.slice(-1)[0]}: ${firstIssue.msg}`;
      }
    }

    return requestError?.message || fallbackMessage;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const nextForm = { ...current, [name]: value };
      const nextErrors = validate(nextForm);
      setFormErrors((currentErrors) => ({
        ...currentErrors,
        [name]: nextErrors[name] || "",
      }));
      return nextForm;
    });
  }

  async function submit(event) {
    event.preventDefault();

    const nextErrors = validate(form);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.values(nextErrors)[0];
      setToast({ type: "error", message: firstError });
      return;
    }

    setLoading(true);

    try {
      await applicationService.submit(form);
      setForm(initialForm);
      setFormErrors({});
      setToast({ type: "success", message: "Application submitted successfully." });
    } catch (requestError) {
      setToast({
        type: "error",
        message: getRequestErrorMessage(requestError, "Unable to submit the application."),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <Skeleton
        fallback={<ApplyPageFallback />}
        loading={boneyardBuildMode}
        name={boneyardBuildMode ? "apply-page" : undefined}
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="section-card" ref={headingScopeRef}>
            <p className="page-heading-anim text-sm font-semibold uppercase tracking-[0.28em] text-ember">
              <VariableText label="Join Kamand Prompt" />
            </p>
            <h1 className="page-heading-anim mt-3 text-3xl font-bold sm:text-4xl">
              <VariableText label="Apply to build with the club" />
            </h1>
            <p className="page-heading-anim mt-4 text-base text-slate-600 dark:text-slate-300">
              Share your background, motivation, and the kind of work you want to do.
              Applications go directly to the admin dashboard for review.
            </p>
          </div>

          <form className="section-card space-y-4" onSubmit={submit}>
            {[
              ["name", "Full name", "text"],
              ["email", "Email", "email"],
              ["branch", "Branch", "text"],
              ["batch", "Batch", "text"],
            ].map(([name, label, type]) => (
              <label key={name}>
                <span className="label">{label}</span>
                <input
                  autoComplete={
                    name === "name"
                      ? "name"
                      : name === "email"
                        ? "email"
                        : name === "branch"
                          ? "organization-title"
                          : "off"
                  }
                  className="input"
                  name={name}
                  onChange={handleChange}
                  type={type}
                  value={formToRender[name]}
                />
                {formErrors[name] ? (
                  <p className="mt-1 text-xs text-rose-300">{formErrors[name]}</p>
                ) : null}
              </label>
            ))}
            <label>
              <span className="label">Why do you want to join?</span>
              <textarea autoComplete="off" className="input min-h-[150px]" name="why_join" onChange={handleChange} value={formToRender.why_join} />
              {formErrors.why_join ? (
                <p className="mt-1 text-xs text-rose-300">{formErrors.why_join}</p>
              ) : null}
            </label>
            <label>
              <span className="label">Skills and interests</span>
              <textarea autoComplete="off" className="input min-h-[110px]" name="skills" onChange={handleChange} value={formToRender.skills} />
              {formErrors.skills ? (
                <p className="mt-1 text-xs text-rose-300">{formErrors.skills}</p>
              ) : null}
            </label>
            <button className="btn-primary" disabled={loading} type="submit">
              {loading ? (
                <span
                  aria-hidden="true"
                  className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
              ) : null}
              <VariableText label={loading ? "Submitting..." : "Submit application"} radius={85} />
            </button>
          </form>
        </div>
      </Skeleton>
    </div>
  );
}
