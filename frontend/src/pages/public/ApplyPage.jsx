import { useState } from "react";

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

export default function ApplyPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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
                value={form[name]}
              />
            </label>
          ))}
          <label>
            <span className="label">Why do you want to join?</span>
            <textarea autoComplete="off" className="input min-h-[150px]" name="why_join" onChange={handleChange} value={form.why_join} />
          </label>
          <label>
            <span className="label">Skills and interests</span>
            <textarea autoComplete="off" className="input min-h-[110px]" name="skills" onChange={handleChange} value={form.skills} />
          </label>
          <button className="btn-primary" disabled={loading} type="submit">
            <VariableText label={loading ? "Submitting..." : "Submit application"} radius={85} />
          </button>
        </form>
      </div>
    </div>
  );
}
