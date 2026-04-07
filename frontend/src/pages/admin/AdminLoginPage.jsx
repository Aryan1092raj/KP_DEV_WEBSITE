import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Toast from "../../components/common/Toast";
import { useAuth } from "../../hooks/useAuth";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { isAdmin, loading, login, session } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (session && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [session, isAdmin, navigate]);

  if (!loading && session && isAdmin) {
    return <Navigate replace to="/admin" />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(form);
      navigate("/admin", { replace: true });
    } catch (requestError) {
      setToast({
        type: "error",
        message: requestError.message || "Unable to log in.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <div className="mb-5">
        <Link className="btn-secondary !px-4 !py-2" to="/">
          &larr; Back to main page
        </Link>
      </div>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="section-card bg-ink text-white dark:bg-white/5">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-300">
            Admin access
          </p>
          <h1 className="mt-4 text-4xl font-bold">Sign in with your Supabase admin account.</h1>
          <p className="mt-4 text-slate-200">
            The session stays in memory only, the JWT is attached through Axios
            interceptors, and protected routes redirect back here on 401.
          </p>
        </section>

        <form className="section-card space-y-4" onSubmit={submit}>
          <h2 className="text-2xl font-semibold">Admin login</h2>
          <label>
            <span className="label">Email</span>
            <input autoComplete="email" className="input" name="email" onChange={handleChange} type="email" value={form.email} />
          </label>
          <label>
            <span className="label">Password</span>
            <input autoComplete="current-password" className="input" name="password" onChange={handleChange} type="password" value={form.password} />
          </label>
          <button className="btn-primary w-full" disabled={submitting} type="submit">
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
