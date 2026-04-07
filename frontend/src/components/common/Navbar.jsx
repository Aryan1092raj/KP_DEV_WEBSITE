import { Link, NavLink } from "react-router-dom";

import kpLogo from "../../assets/kp-logo.png";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/team", label: "Team" },
  { to: "/events", label: "Events" },
  { to: "/apply", label: "Apply" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar({ darkMode, onToggleTheme, authenticated }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-dune/80 backdrop-blur dark:border-white/10 dark:bg-ink/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" to="/">
          <div className="flex h-12 w-[96px] items-center justify-center overflow-hidden rounded-xl border border-slate-300/70 bg-white p-1 shadow-sm dark:border-white/20 dark:bg-white/95">
            <img alt="Kamand Prompt logo" className="h-full w-full object-contain" src={kpLogo} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
              IIT Mandi
            </p>
            <p className="text-lg font-semibold">Kamand Prompt</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-ember" : "text-slate-600 hover:text-ink dark:text-slate-300 dark:hover:text-white"
                }`
              }
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
          <Link className="btn-primary !px-4 !py-2" to={authenticated ? "/admin" : "/admin/login"}>
            {authenticated ? "Dashboard" : "Admin login"}
          </Link>
        </div>
      </div>
    </header>
  );
}
