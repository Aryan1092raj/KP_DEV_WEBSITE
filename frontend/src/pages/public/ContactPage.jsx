import { useState } from "react";

import Toast from "../../components/common/Toast";
import VariableText from "../../components/common/VariableText";
import { contactService } from "../../services/contactService";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/KamandPrompt",
    icon: (
      <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.21-3.37-1.21-.45-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .08 1.54 1.06 1.54 1.06.9 1.57 2.35 1.12 2.92.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.09 0-1.13.39-2.06 1.03-2.79-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.07A9.3 9.3 0 0 1 12 6.89c.85 0 1.71.12 2.52.36 1.91-1.35 2.75-1.07 2.75-1.07.55 1.41.2 2.46.1 2.72.64.73 1.03 1.66 1.03 2.79 0 3.96-2.34 4.82-4.58 5.08.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.59.69.49A10.27 10.27 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/kamandprompt/",
    icon: (
      <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="4.75" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.25" cy="6.75" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/programming-club-iit-mandi/",
    icon: (
      <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
        <path d="M6.75 9H3.75V20.25H6.75V9Z" fill="currentColor" />
        <path d="M5.25 3.75A1.88 1.88 0 1 0 5.25 7.5a1.88 1.88 0 0 0 0-3.75Z" fill="currentColor" />
        <path d="M20.25 13.31c0-3.17-1.69-4.64-3.95-4.64-1.82 0-2.64 1-3.1 1.71V9H10.2c.04.87 0 11.25 0 11.25h3V13.97c0-.34.02-.68.13-.92.27-.68.88-1.38 1.9-1.38 1.34 0 1.88 1.03 1.88 2.55v6.03h3V13.31Z" fill="currentColor" />
      </svg>
    ),
  },
];

function TerminalPanel({ title, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-[28px] border border-white/10 bg-[#070707] text-white shadow-soft ${className}`}>
      <div className="border-b border-white/10 px-5 py-4 text-sm uppercase tracking-[0.22em] text-[#8e8b7c]">
        <VariableText label={title} radius={85} />
      </div>
      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

function ContactInfoCard({ label, value, href, icon }) {
  const content = (
    <div className="flex items-center gap-4 rounded-[22px] border border-white/10 bg-black/30 px-4 py-5">
      <div className="text-[#8e8b7c]">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[#8e8b7c]">
          <VariableText label={label} radius={85} />
        </p>
        <p className="mt-1 text-xl font-semibold text-white">
          <VariableText label={value} radius={85} />
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
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

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
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          <VariableText label="./JOIN.SH" radius={85} />
        </p>
        <h1 className="text-4xl font-bold sm:text-5xl">
          <VariableText label="Contact us" />
        </h1>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
          <span className="font-mono text-ember">$ ./contact.sh --init</span>
          {" "}
          <VariableText
            label="Use the terminal-style contact panel below to write to Kamand Prompt, reach the coordinator, or jump directly to the official socials."
            radius={85}
          />
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <TerminalPanel title="message.sh" className="min-h-[620px]">
          <form className="space-y-7" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-3 block font-mono text-lg text-[#d5d0bf]">$ name</span>
              <input
                autoComplete="name"
                className="w-full rounded-none border border-white/15 bg-[#111111] px-5 py-4 text-lg text-white outline-none transition placeholder:text-[#55524a] focus:border-[#d5d0bf]"
                name="name"
                onChange={handleChange}
                placeholder="your_name"
                required
                value={form.name}
              />
            </label>

            <label className="block">
              <span className="mb-3 block font-mono text-lg text-[#d5d0bf]">$ email</span>
              <input
                autoComplete="email"
                className="w-full rounded-none border border-white/15 bg-[#111111] px-5 py-4 text-lg text-white outline-none transition placeholder:text-[#55524a] focus:border-[#d5d0bf]"
                name="email"
                onChange={handleChange}
                placeholder="your@email.com"
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className="block">
              <span className="mb-3 block font-mono text-lg text-[#d5d0bf]">$ message</span>
              <textarea
                autoComplete="off"
                className="min-h-[180px] w-full rounded-none border border-white/15 bg-[#111111] px-5 py-4 text-lg text-white outline-none transition placeholder:text-[#55524a] focus:border-[#d5d0bf]"
                name="message"
                onChange={handleChange}
                placeholder="your_message..."
                required
                value={form.message}
              />
            </label>

            <button
              disabled={!isReady || isSubmitting}
              className={`flex w-full items-center justify-center gap-3 border border-white px-5 py-4 font-mono text-2xl font-semibold uppercase tracking-[0.18em] transition ${
                isReady && !isSubmitting
                  ? "bg-white text-black hover:bg-[#efede9]"
                  : "cursor-not-allowed bg-[#cfcfcf] text-[#55524a] opacity-60"
              }`}
              type="submit"
            >
              <span>{isSubmitting ? "$ ./SENDING.SH" : "$ ./SEND.SH"}</span>
              <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path d="M21 3 10 14" stroke="currentColor" strokeWidth="1.8" />
                <path d="m21 3-7 18-4-7-7-4 18-7Z" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>

            <div className="space-y-2 text-sm text-[#8e8b7c]">
              <p>
                <VariableText label="Saves your message to the club contact inbox in the database." radius={85} />
              </p>
              <p>
                <VariableText label="You can also email" radius={85} />{" "}
                <a
                  className="text-[#d5d0bf] underline-offset-4 hover:underline"
                  href="mailto:pc@iitmandi.ac.in"
                >
                  <VariableText label="pc@iitmandi.ac.in" radius={85} />
                </a>{" "}
                <VariableText label="directly or" radius={85} />{" "}
                <button
                  className="text-[#d5d0bf] underline-offset-4 hover:underline"
                  onClick={copyEmailAddress}
                  type="button"
                >
                  <VariableText label="copy the email" radius={85} />
                </button>
                .
              </p>
              {copied ? (
                <p className="text-emerald-300">
                  <VariableText label="Email copied to clipboard." radius={85} />
                </p>
              ) : null}
            </div>
          </form>
        </TerminalPanel>

        <div className="space-y-6">
          <TerminalPanel title="$ CAT CONTACT.TXT">
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

          <TerminalPanel title="$ WHOAMI --COORDINATOR">
            <div className="flex items-center gap-5 rounded-[22px] border border-white/10 bg-black/30 px-4 py-5">
              <div className="flex h-20 w-20 items-center justify-center border border-white/10 bg-[#1a1a1a] font-mono text-2xl font-bold text-white">
                HJ
              </div>
              <div>
                <p className="text-4xl font-bold uppercase tracking-[0.05em] text-white">
                  HARSHIT_JAIN
                </p>
                <p className="mt-1 font-mono text-xl uppercase tracking-[0.12em] text-[#9d9989]">
                  COORDINATOR
                </p>
                <a
                  className="mt-3 inline-block font-mono text-2xl text-[#d5d0bf] hover:text-white"
                  href="tel:+919418539191"
                >
                  <VariableText label="+91 94185 39191" radius={85} />
                </a>
              </div>
            </div>
          </TerminalPanel>

          <TerminalPanel title="$ LS /SOCIALS">
            <div className="grid gap-4 sm:grid-cols-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  className="flex flex-col items-center justify-center gap-5 border border-white/10 bg-black/30 px-4 py-8 text-center text-[#9d9989] transition hover:border-white/20 hover:text-white"
                  href={item.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.icon}
                  <span className="font-mono text-xl uppercase tracking-[0.12em]">
                    <VariableText label={item.label} radius={85} />
                  </span>
                </a>
              ))}
            </div>
          </TerminalPanel>
        </div>
      </div>
    </div>
  );
}
