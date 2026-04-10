import { useState } from "react";
import { Skeleton } from "boneyard-js/react";

import { ApplyPageFallback } from "../../components/common/BoneyardFallbacks";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
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
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const formToRender = boneyardBuildMode ? fixtureForm : form;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);

    try {
      await applicationService.submit(form);
      setForm(initialForm);
      setToast({ type: "success", message: "Application submitted successfully." });
    } catch (requestError) {
      setToast({
        type: "error",
        message: requestError.message || "Unable to submit the application.",
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
          <div className="section-card">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
              <VariableText label="Join Kamand Prompt" />
            </p>
            <h1 className="mt-3 text-4xl font-bold">
              <VariableText label="Apply to build with the club" />
            </h1>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
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
              </label>
            ))}
            <label>
              <span className="label">Why do you want to join?</span>
              <textarea autoComplete="off" className="input min-h-[150px]" name="why_join" onChange={handleChange} value={formToRender.why_join} />
            </label>
            <label>
              <span className="label">Skills and interests</span>
              <textarea autoComplete="off" className="input min-h-[110px]" name="skills" onChange={handleChange} value={formToRender.skills} />
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
