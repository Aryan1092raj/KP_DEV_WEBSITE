import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import kpLogo from "../../assets/kp-logo.svg";
import { useAuth } from "../../hooks/useAuth";
import VariableText from "../common/VariableText";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/events", label: "Events" },
  { to: "/admin/announcements", label: "Announcements" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/contact-messages", label: "Contact messages" },
];

export default function AdminSidebar({ onLogout }) {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  const parsedLastLogin = user?.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
  const hasValidLastLogin = parsedLastLogin instanceof Date && !Number.isNaN(parsedLastLogin.getTime());
  const lastLogin = hasValidLastLogin
    ? parsedLastLogin.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not available";

  const panel = (
    <>
      <div>
        <div className="mb-3 flex h-14 w-[112px] items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-white/20 dark:bg-white/95">
          <img alt="Kamand Prompt logo" className="h-full w-full object-contain" src={kpLogo} />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          <VariableText label="Admin portal" radius={85} />
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          <VariableText label="KP Control Room" />
        </h2>
        <p className="mt-3 text-xs uppercase tracking-[0.2em]">Last login</p>
        <p className="mt-1 text-sm">{lastLogin}</p>
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
            onClick={() => setDrawerOpen(false)}
            to={link.to}
          >
            <VariableText label={link.label} radius={85} />
          </NavLink>
        ))}
      </nav>

      <button
        className="btn-primary mt-8 w-full !text-white"
        onClick={() => {
          setDrawerOpen(false);
          onLogout();
        }}
        type="button"
      >
        <VariableText label="Logout" radius={85} />
      </button>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 py-3 dark:border-white/10 dark:bg-white/5 lg:hidden">
        <div>
          <div className="flex h-11 w-[88px] items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-white/20 dark:bg-white/95">
            <img alt="Kamand Prompt logo" className="h-full w-full object-contain" src={kpLogo} />
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-ember">
            <VariableText label="Admin portal" radius={85} />
          </p>
          <h2 className="text-base font-semibold">
            <VariableText label="KP Control Room" />
          </h2>
        </div>

        <button
          aria-expanded={drawerOpen}
          aria-label="Toggle admin navigation"
          className="btn-secondary !px-3 !py-2"
          onClick={() => setDrawerOpen((current) => !current)}
          type="button"
        >
          <span aria-hidden="true" className="text-base font-bold leading-none">
            {drawerOpen ? "X" : "☰"}
          </span>
        </button>
      </div>

      <div
        className={`fixed inset-0 bg-slate-950/50 transition-opacity lg:hidden ${
          drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawerOpen(false)}
        style={{ zIndex: 1002 }}
      />

      <aside
        className={`fixed inset-y-0 left-0 w-[88vw] max-w-[320px] border-r border-slate-200/80 bg-white/95 p-6 shadow-2xl transition-transform duration-200 dark:border-white/10 dark:bg-[#0a1220] lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ zIndex: 1003 }}
      >
        {panel}
      </aside>

      <aside className="hidden border-b border-slate-200/80 bg-white/85 p-6 dark:border-white/10 dark:bg-white/5 lg:block lg:min-h-screen lg:border-b-0 lg:border-r">
        {panel}
      </aside>
    </>
  );
}
