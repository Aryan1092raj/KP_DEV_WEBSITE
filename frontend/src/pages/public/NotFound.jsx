import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page-shell">
      <div className="section-card text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">404</p>
        <h1 className="mt-4 text-5xl font-bold">That page drifted out of the route map.</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          The link may be stale, or the route may never have existed in this build.
        </p>
        <Link className="btn-primary mt-8" to="/">
          Return home
        </Link>
      </div>
    </div>
  );
}
