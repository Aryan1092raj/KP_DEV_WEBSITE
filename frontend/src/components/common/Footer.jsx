import kpLogo from "../../assets/kp-logo.svg";
import VariableText from "./VariableText";

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
            <VariableText label="Eat, Sleep, Code, Repeat" />
          </p>
          <h3 className="mt-2 text-2xl font-semibold">
            <VariableText label="KP Dev Cell, IIT Mandi" />
          </h3>
        </div>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>
            <VariableText className="text-base font-bold sm:text-lg" label="Website:" radius={85} />{" "}
            <a
              className="allow-accent text-[#b78bff] underline-offset-4 hover:underline"
              href="https://pc.iitmandi.co.in"
              rel="noreferrer"
              target="_blank"
            >
              <VariableText
                className="allow-accent text-[#b78bff] font-semibold"
                label="https://pc.iitmandi.co.in"
                radius={85}
              />
            </a>
          </p>
          <p>
            <VariableText className="text-base font-bold sm:text-lg" label="Email:" radius={85} />{" "}
            <a
              className="allow-accent text-[#b78bff] underline-offset-4 hover:underline"
              href="mailto:pc@iitmandi.ac.in"
            >
              <VariableText className="allow-accent text-[#b78bff] font-semibold" label="pc@iitmandi.ac.in" radius={85} />
            </a>
          </p>
          <p>
            <VariableText className="text-base font-bold sm:text-lg" label="Instagram:" radius={85} />{" "}
            <a
              className="allow-accent text-[#b78bff] underline-offset-4 hover:underline"
              href="https://www.instagram.com/kamandprompt/"
            >
              <VariableText className="allow-accent text-[#b78bff] font-semibold" label="pc@iitmandi.ac.in" radius={85} />
            </a>
          </p>
          <p>
            <VariableText className="text-base font-bold sm:text-lg" label="Github:" radius={85} />{" "}
            <a
              className="allow-accent text-[#b78bff] underline-offset-4 hover:underline"
              href="https://github.com/KamandPrompt"
            >
              <VariableText className="allow-accent text-[#b78bff] font-semibold" label="pc@iitmandi.ac.in" radius={85} />
            </a>
          </p>
          <p>
            <a
              className="allow-accent text-[#b78bff] underline-offset-4 hover:underline"
              href="#"
              id="open_preferences_center"
            >
              <VariableText className="allow-accent text-[#b78bff] font-semibold" label="Update cookies preferences" radius={85} />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
