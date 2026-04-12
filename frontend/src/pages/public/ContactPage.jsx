import { useRef, useState } from "react";
import { Skeleton } from "boneyard-js/react";

import { ContactPageFallback } from "../../components/common/BoneyardFallbacks";
import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { useOneTimePageHeadingAnimation } from "../../hooks/useOneTimePageHeadingAnimation";
import { contactService } from "../../services/contactService";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/KamandPrompt",
    icon: (
      <svg aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" fill="#ffffff" r="11" />
        <path
          d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.21-3.37-1.21-.45-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .08 1.54 1.06 1.54 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.09 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.07A9.3 9.3 0 0 1 12 6.89c.85 0 1.71.12 2.52.36 1.91-1.35 2.75-1.07 2.75-1.07.55 1.41.2 2.46.1 2.72.64.73 1.03 1.66 1.03 2.79 0 3.96-2.34 4.82-4.58 5.08.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.59.69.49A10.27 10.27 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
          fill="#181717"
        />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/kamandprompt/",
    icon: (
      <svg aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="kp-ig-gradient" x1="3" x2="21" y1="21" y2="3">
            <stop offset="0" stopColor="#feda75" />
            <stop offset="0.35" stopColor="#fa7e1e" />
            <stop offset="0.6" stopColor="#d62976" />
            <stop offset="0.82" stopColor="#962fbf" />
            <stop offset="1" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#kp-ig-gradient)" />
        <circle cx="12" cy="12" r="4.35" stroke="#ffffff" strokeWidth="1.9" />
        <circle cx="17.15" cy="6.85" fill="#ffffff" r="1.1" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/programming-club-iit-mandi/",
    icon: (
      <svg aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#0a66c2" />
        <path d="M7.3 9.35H4.95V18.7H7.3V9.35Z" fill="#ffffff" />
        <path d="M6.12 5.3A1.57 1.57 0 1 0 6.12 8.44 1.57 1.57 0 0 0 6.12 5.3Z" fill="#ffffff" />
        <path d="M18.9 12.96c0-2.64-1.41-3.87-3.29-3.87-1.52 0-2.2.83-2.58 1.43V9.35h-2.49c.03.73 0 9.35 0 9.35h2.5v-5.22c0-.29.02-.57.11-.77.23-.57.73-1.15 1.58-1.15 1.11 0 1.57.86 1.57 2.13v5.01h2.5v-5.74Z" fill="#ffffff" />
      </svg>
    ),
  },
];

function TerminalPanel({ title, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-[28px] border border-[var(--kp-border)] bg-[var(--kp-surface)] text-white shadow-soft ${className}`}
    >
      <div
        className="border-b border-[var(--kp-border)] px-5 py-4 text-base font-black uppercase tracking-[0.24em] text-[#f4fbff] sm:text-[1.35rem]"
        style={{ textShadow: "0 0 16px rgba(158, 214, 255, 0.55), 0 0 2px rgba(255, 255, 255, 0.88)" }}
      >
        <VariableText label={title} radius={85} />
      </div>
      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

function ContactInfoCard({ label, value, href, icon }) {
  const isEmailLink = typeof href === "string" && href.startsWith("mailto:");
  const content = (
    <div className="flex items-center gap-4 rounded-[22px] border border-[var(--kp-border)] bg-[var(--kp-elevated)] px-4 py-5">
      <div className="text-white">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-white">
          <VariableText label={label} radius={85} />
        </p>
        <p className={`mt-1 text-xl font-semibold ${isEmailLink ? "allow-accent text-[#b78bff]" : "text-white"}`}>
          <VariableText className={isEmailLink ? "allow-accent text-[#b78bff]" : ""} label={value} radius={85} />
        </p>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <a className="block transition hover:border-white/20 hover:bg-white/[0.02]" href={href}>
      {content}
    </a>
  );
}

export default function ContactPage() {
  const headingScopeRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const formToRender = boneyardBuildMode
    ? {
        name: "Aarav Sharma",
        email: "aarav@example.com",
        message:
          "Wanted to ask about the next build sprint and how new contributors can get involved.",
      }
    : form;

  useOneTimePageHeadingAnimation({
    enabled: !boneyardBuildMode,
    scopeRef: headingScopeRef,
    visitTag: "contact",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function copyEmailAddress() {
    try {
      await navigator.clipboard.writeText("pc@iitmandi.ac.in");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const isReady = Boolean(form.name && form.email && form.message);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isReady || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await contactService.submit(form);
      setForm({ name: "", email: "", message: "" });
      setToast({ type: "success", message: "Message saved successfully. Kamand Prompt will get back to you." });
    } catch (error) {
      setToast({
        type: "error",
        message: error.message || "Unable to send your message right now.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell space-y-8">
      <Toast onClose={() => setToast(null)} toast={toast} />
      <Skeleton
        fallback={<ContactPageFallback />}
        loading={boneyardBuildMode}
        name={boneyardBuildMode ? "contact-page" : undefined}
      >
        <div className="space-y-8">
          <div className="space-y-3" ref={headingScopeRef}>
            <p className="page-heading-anim text-sm font-semibold uppercase tracking-[0.28em] text-ember">
              <VariableText label="Get in touch" radius={85} />
            </p>
            <h1 className="page-heading-anim text-4xl font-bold sm:text-5xl">
              <VariableText label="Contact us" />
            </h1>
            <p className="page-heading-anim max-w-2xl text-base text-white">
              <VariableText
                label="Reach out to Kamand Prompt for collaborations, questions, event details, or general club updates. You can send a message here or use the direct contact links."
                radius={85}
              />
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <TerminalPanel title="Message" className="min-h-[620px]">
              <form className="space-y-7" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-3 block text-lg font-semibold text-white">Name</span>
                  <input
                    autoComplete="name"
                    className="w-full rounded-[14px] border border-[var(--kp-border)] bg-[var(--kp-elevated)] px-5 py-4 text-lg text-white outline-none transition placeholder:text-white/60 focus:border-white"
                    name="name"
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    value={formToRender.name}
                  />
                </label>

                <label className="block">
                  <span className="mb-3 block text-lg font-semibold text-white">Email</span>
                  <input
                    autoComplete="email"
                    className="w-full rounded-[14px] border border-[var(--kp-border)] bg-[var(--kp-elevated)] px-5 py-4 text-lg text-white outline-none transition placeholder:text-white/60 focus:border-white"
                    name="email"
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    type="email"
                    value={formToRender.email}
                  />
                </label>

                <label className="block">
                  <span className="mb-3 block text-lg font-semibold text-white">Message</span>
                  <textarea
                    autoComplete="off"
                    className="min-h-[180px] w-full rounded-[14px] border border-[var(--kp-border)] bg-[var(--kp-elevated)] px-5 py-4 text-lg text-white outline-none transition placeholder:text-white/60 focus:border-white"
                    name="message"
                    onChange={handleChange}
                    placeholder="Tell us how we can help"
                    required
                    value={formToRender.message}
                  />
                </label>

                <button
                  disabled={!isReady || isSubmitting}
                  className={`contact-send-btn flex w-full items-center justify-center gap-3 rounded-[14px] border border-[var(--kp-border)] px-5 py-4 text-lg font-semibold transition ${
                    isReady && !isSubmitting
                      ? ""
                      : "cursor-not-allowed"
                  }`}
                  type="submit"
                >
                  {isSubmitting ? (
                    <span
                      aria-hidden="true"
                      className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    />
                  ) : null}
                  <span>{isSubmitting ? "Sending..." : "Send message"}</span>
                  <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path d="M21 3 10 14" stroke="currentColor" strokeWidth="1.8" />
                    <path d="m21 3-7 18-4-7-7-4 18-7Z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </button>

                <div className="space-y-2 text-sm text-white">
                  <p>
                    <VariableText label="Your message is delivered to the club contact inbox." radius={85} />
                  </p>
                  <p>
                    <VariableText label="You can also email" radius={85} />{" "}
                    <a
                      className="allow-accent text-[#b78bff] underline-offset-4 hover:underline"
                      href="mailto:pc@iitmandi.ac.in"
                    >
                      <VariableText className="allow-accent text-[#b78bff] font-semibold" label="pc@iitmandi.ac.in" radius={85} />
                    </a>{" "}
                    <VariableText label="directly or" radius={85} />{" "}
                    <button
                      className="text-white underline-offset-4 hover:underline"
                      onClick={copyEmailAddress}
                      type="button"
                    >
                      <VariableText label="copy the email" radius={85} />
                    </button>
                    .
                  </p>
                  {copied ? (
                    <p className="text-white">
                      <VariableText label="Email copied to clipboard." radius={85} />
                    </p>
                  ) : null}
                </div>
              </form>
            </TerminalPanel>

            <div className="space-y-6">
              <TerminalPanel title="Contact details">
                <div className="space-y-4">
                  <ContactInfoCard
                    href="mailto:pc@iitmandi.ac.in"
                    icon={
                      <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
                        <path d="M4 6.75h16v10.5H4z" stroke="currentColor" strokeWidth="1.5" />
                        <path d="m4 8 8 6 8-6" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    }
                    label="EMAIL"
                    value="pc@iitmandi.ac.in"
                  />
                  <ContactInfoCard
                    href="tel:+919418539191"
                    icon={
                      <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
                        <path d="M7.25 4.75h2.5l1.25 4-1.75 1.75a14 14 0 0 0 4.5 4.5l1.75-1.75 4 1.25v2.5c0 .83-.67 1.5-1.5 1.5C10.04 19 5 13.96 5 7.75c0-.83.67-1.5 1.5-1.5Z" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    }
                    label="PHONE"
                    value="+91 94185 39191"
                  />
                </div>
              </TerminalPanel>

              <TerminalPanel title="Coordinator">
                <div className="flex items-center gap-5 rounded-[22px] border border-[var(--kp-border)] bg-[var(--kp-elevated)] px-4 py-5">
                  <div className="flex h-20 w-20 items-center justify-center border border-[var(--kp-border)] bg-[var(--kp-elevated)] font-mono text-2xl font-bold text-white">
                    HJ
                  </div>
                  <div>
                    <p className="text-4xl font-bold uppercase tracking-[0.05em] text-white">
                      HARSHIT_JAIN
                    </p>
                    <p className="mt-1 font-mono text-xl uppercase tracking-[0.12em] text-white">
                      COORDINATOR
                    </p>
                    <a
                      className="mt-3 inline-block font-mono text-2xl text-white hover:text-white"
                      href="tel:+919418539191"
                    >
                      <VariableText label="+91 94185 39191" radius={85} />
                    </a>
                  </div>
                </div>
              </TerminalPanel>

              <TerminalPanel title="Social links">
                <div className="grid gap-4 sm:grid-cols-3">
                  {socialLinks.map((item) => (
                    <a
                      key={item.label}
                      className="flex flex-col items-center justify-center gap-6 border border-[var(--kp-border)] bg-[var(--kp-elevated)] px-4 py-10 text-center text-white transition hover:opacity-90"
                      href={item.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--kp-border)] bg-[var(--kp-surface)]">
                        {item.icon}
                      </span>
                      <span className="font-mono text-lg font-black uppercase tracking-[0.14em] sm:text-xl">
                        <VariableText label={item.label} radius={85} />
                      </span>
                    </a>
                  ))}
                </div>
              </TerminalPanel>
            </div>
          </div>
        </div>
      </Skeleton>
    </div>
  );
}
