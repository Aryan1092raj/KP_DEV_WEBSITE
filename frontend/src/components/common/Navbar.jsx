import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import kpLogo from "../../assets/kp-logo.svg";
import VariableText from "./VariableText";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/projects", label: "Projects" },
  { to: "/team", label: "Team" },
  { to: "/events", label: "Events" },
  { to: "/apply", label: "Apply" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar({ authenticated, scrollProgress = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const adminButtonClass = authenticated
    ? "btn-primary !px-4 !py-2"
    : "btn-primary !px-4 !py-2 !bg-[#2f8cff] !border-[#2f8cff] hover:!border-[#5aa8ff]";

  return (
    <header className="kp-nav">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" to="/">
          <div className="flex h-12 w-[96px] items-center justify-center overflow-hidden">
            <img alt="Kammand Prompt logo" className="h-full w-full object-contain" src={kpLogo} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember sm:text-sm">
              <VariableText label="IIT Mandi" />
            </p>
            <p className="text-xl font-black leading-tight sm:text-[1.55rem]">
              <VariableText label="Kammand Prompt" />
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                `kp-nav-link allow-accent text-sm font-medium transition ${isActive ? "kp-nav-link-active" : "kp-nav-link-idle"}`
              }
              end={link.end}
              to={link.to}
            >
              <VariableText label={link.label} radius={85} />
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link className={adminButtonClass} to={authenticated ? "/admin" : "/admin/login"}>
            <VariableText label={authenticated ? "Dashboard" : "Admin login"} radius={85} />
          </Link>
        </div>

        <button
          aria-controls="mobile-nav-drawer"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          className="btn-secondary !px-3 !py-2 lg:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          <span aria-hidden="true" className="text-base font-bold leading-none">
            {menuOpen ? "X" : "☰"}
          </span>
        </button>
      </div>

      <div
        className={`fixed inset-0 bg-slate-950/50 transition-opacity lg:hidden ${
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
        style={{ zIndex: 1002 }}
      />

      <div
        className={`fixed left-0 right-0 top-[var(--kp-nav-height,84px)] border-b border-white/10 bg-[#040d1d]/95 px-4 pb-5 pt-4 shadow-xl backdrop-blur transition-transform duration-200 lg:hidden ${
          menuOpen ? "translate-y-0" : "-translate-y-[110%]"
        }`}
        id="mobile-nav-drawer"
        style={{ zIndex: 1003 }}
      >
        <nav className="grid gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-[#041326]"
                    : "text-white/85 hover:bg-white/10"
                }`
              }
              end={link.end}
              onClick={() => setMenuOpen(false)}
              to={link.to}
            >
              <VariableText label={link.label} radius={85} />
            </NavLink>
          ))}

          <Link
            className={`${adminButtonClass} mt-2 justify-center`}
            onClick={() => setMenuOpen(false)}
            to={authenticated ? "/admin" : "/admin/login"}
          >
            <VariableText label={authenticated ? "Dashboard" : "Admin login"} radius={85} />
          </Link>
        </nav>
      </div>

      <span className="kp-nav-progress" aria-hidden="true">
        <span className="kp-nav-progress-line" style={{ "--scroll-progress": scrollProgress }} />
      </span>
    </header>
  );
}
