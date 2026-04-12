import { useEffect, useRef, useState } from "react";
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
  const headerRef = useRef(null);

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

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [menuOpen]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof document === "undefined") {
      return undefined;
    }

    const syncNavHeight = () => {
      const nextHeight = Math.round(header.getBoundingClientRect().height);
      if (nextHeight > 0) {
        document.documentElement.style.setProperty("--kp-nav-height", `${nextHeight}px`);
      }
    };

    syncNavHeight();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncNavHeight);
      resizeObserver.observe(header);
    }

    window.addEventListener("resize", syncNavHeight);
    return () => {
      window.removeEventListener("resize", syncNavHeight);
      resizeObserver?.disconnect();
    };
  }, []);

  const adminButtonClass = authenticated
    ? "btn-primary !px-4 !py-2"
    : "btn-primary !px-4 !py-2 !bg-[#2f8cff] !border-[#2f8cff] hover:!border-[#5aa8ff]";

  return (
    <header className="kp-nav" ref={headerRef}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <Link className="flex min-w-0 items-center gap-2 sm:gap-3" to="/">
          <div className="flex h-10 w-[80px] shrink-0 items-center justify-center overflow-hidden sm:h-12 sm:w-[96px]">
            <img alt="Kammand Prompt logo" className="h-full w-full object-contain" src={kpLogo} />
          </div>
          <div className="min-w-0">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-ember sm:text-sm sm:tracking-[0.24em]">
              <VariableText label="IIT Mandi" />
            </p>
            <p className="truncate text-lg font-black leading-tight sm:text-[1.55rem]">
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
          className="btn-secondary shrink-0 !px-3 !py-2 lg:hidden"
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
          menuOpen
            ? "pointer-events-auto opacity-100 duration-200 ease-out"
            : "pointer-events-none opacity-0 duration-340 ease-in"
        }`}
        onClick={() => setMenuOpen(false)}
        style={{ zIndex: 1002 }}
      />

      <div
        className={`kp-mobile-drawer fixed inset-x-0 top-[var(--kp-nav-height,84px)] border-b border-white/10 bg-[#040d1d]/95 px-4 pb-5 pt-4 shadow-xl backdrop-blur transition-all will-change-transform lg:hidden ${
          menuOpen
            ? "pointer-events-auto visible translate-y-0 opacity-100 duration-220 ease-out"
            : "pointer-events-none invisible -translate-y-2 opacity-0 duration-220 ease-in"
        }`}
        id="mobile-nav-drawer"
        style={{ zIndex: 1003 }}
      >
        <nav className="kp-mobile-drawer-nav grid gap-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3.5 text-base font-medium transition ${
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
            className={`${adminButtonClass} mt-1 min-h-[48px] justify-center !py-3.5 text-base`}
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
