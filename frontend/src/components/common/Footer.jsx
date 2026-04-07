import kpLogo from "../../assets/kp-logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white/60 dark:border-white/10 dark:bg-white/5">
      <div className="page-shell flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <img
            alt="Kamand Prompt logo"
            className="h-14 w-auto rounded-lg border border-slate-200/80 bg-white p-1 shadow-sm dark:border-white/20"
            src={kpLogo}
          />
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            Eat, Sleep, Code, Repeat
          </p>
          <h3 className="mt-2 text-2xl font-semibold">KP Dev Cell, IIT Mandi</h3>
        </div>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Website:{" "}
            <a
              className="text-ember underline-offset-4 hover:underline"
              href="https://pc.iitmandi.co.in"
              rel="noreferrer"
              target="_blank"
            >
              https://pc.iitmandi.co.in
            </a>
          </p>
          <p>
            Email:{" "}
            <a
              className="text-ember underline-offset-4 hover:underline"
              href="mailto:pc@iitmandi.ac.in"
            >
              pc@iitmandi.ac.in
            </a>
          </p>
          <p>
            GitHub:{" "}
            <a
              className="text-ember underline-offset-4 hover:underline"
              href="https://github.com/KamandPrompt"
              rel="noreferrer"
              target="_blank"
            >
              https://github.com/KamandPrompt
            </a>
          </p>
          <p>Built for the official club website architecture.</p>
        </div>
      </div>
    </footer>
  );
}
