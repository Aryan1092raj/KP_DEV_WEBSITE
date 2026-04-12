import { Link, NavLink } from "react-router-dom";

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

        <div className="flex items-center gap-3">
          <Link className={adminButtonClass} to={authenticated ? "/admin" : "/admin/login"}>
            <VariableText label={authenticated ? "Dashboard" : "Admin login"} radius={85} />
          </Link>
        </div>
      </div>

      <span className="kp-nav-progress" aria-hidden="true">
        <span className="kp-nav-progress-line" style={{ "--scroll-progress": scrollProgress }} />
      </span>
    </header>
  );
}
