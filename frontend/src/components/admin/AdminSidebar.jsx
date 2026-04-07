import { NavLink } from "react-router-dom";

import kpLogo from "../../assets/kp-logo.png";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/events", label: "Events" },
  { to: "/admin/timeline", label: "Timeline" },
  { to: "/admin/announcements", label: "Announcements" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/contact-messages", label: "Contact inbox" },
];

export default function AdminSidebar({ onLogout }) {
  return (
    <aside className="border-b border-slate-200/80 bg-white/85 p-6 dark:border-white/10 dark:bg-white/5 lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 lg:block">
        <div>
          <div className="mb-3 flex h-14 w-[112px] items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-white/20 dark:bg-white/95">
            <img alt="Kamand Prompt logo" className="h-full w-full object-contain" src={kpLogo} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            Admin portal
          </p>
          <h2 className="mt-2 text-2xl font-semibold">KP Control Room</h2>
        </div>
      </div>

      <nav className="mt-8 grid gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            className={({ isActive }) =>
              `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-ink text-white dark:bg-ember"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              }`
            }
            end={link.end}
            to={link.to}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button className="btn-danger mt-8 w-full" onClick={onLogout} type="button">
        Logout
      </button>
    </aside>
  );
}
