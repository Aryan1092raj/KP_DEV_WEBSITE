import { useMemo, useState } from "react";

export default function MemberCard({ member }) {
  const [imageFailed, setImageFailed] = useState(false);
  const name = (member.name || "Anonymous").trim();
  const photoUrl = typeof member.photo_url === "string" ? member.photo_url.trim() : "";
  const showPhoto = Boolean(photoUrl) && !imageFailed;
  const initials = useMemo(
    () =>
      name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    [name],
  );

  return (
    <article className="section-card h-full">
      <div className="flex items-center gap-4">
        {showPhoto ? (
          <img
            alt={`${name} profile`}
            className="h-16 w-16 rounded-3xl border border-slate-200 object-cover dark:border-white/10"
            loading="lazy"
            onError={() => setImageFailed(true)}
            src={photoUrl}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-ink text-xl font-bold text-white dark:bg-white/10">
            {initials || "A"}
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold">{name}</h3>
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
