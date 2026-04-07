import VariableText from "../common/VariableText";

export default function ProjectCard({ project }) {
  return (
    <article className="section-card flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ember">
            <VariableText label={project.status} radius={85} />
          </p>
          <h3 className="mt-2 text-2xl font-semibold">
            <VariableText label={project.title} />
          </h3>
        </div>
        {project.year ? <span className="chip">{project.year}</span> : null}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
        <VariableText label={project.description} radius={85} />
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tech_stack.map((item) => (
          <span key={item} className="chip">
            {item}
          </span>
        ))}
      </div>
      {project.contributors?.length ? (
        <div className="mt-5 text-sm text-slate-500 dark:text-slate-300">
          <span className="font-semibold text-slate-700 dark:text-slate-100">Contributors:</span>{" "}
          {project.contributors.map((contributor) => contributor.member_name).join(", ")}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {project.github_url ? (
          <a className="btn-secondary !px-4 !py-2" href={project.github_url} rel="noreferrer" target="_blank">
            <VariableText label="GitHub" radius={85} />
          </a>
        ) : null}
        {project.live_url ? (
          <a className="btn-primary !px-4 !py-2" href={project.live_url} rel="noreferrer" target="_blank">
            <VariableText label="Live demo" radius={85} />
          </a>
        ) : null}
      </div>
    </article>
  );
}
