export default function MemberCard({ member }) {
  const initials = member.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="section-card h-full">
      <div className="flex items-center gap-4">
        {member.photo_url ? (
          <img
            alt={`${member.name} profile`}
            className="h-16 w-16 rounded-3xl border border-slate-200 object-cover dark:border-white/10"
            src={member.photo_url}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-ink text-xl font-bold text-white dark:bg-white/10">
            {initials}
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold">{member.name}</h3>
          <p className="text-sm text-ember">{member.role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{member.bio || "KP core contributor"}</p>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
        <span>{member.batch}</span>
        <div className="flex gap-3">
          {member.github_url ? (
            <a href={member.github_url} rel="noreferrer" target="_blank">
              GitHub
            </a>
          ) : null}
          {member.linkedin_url ? (
            <a href={member.linkedin_url} rel="noreferrer" target="_blank">
              LinkedIn
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
