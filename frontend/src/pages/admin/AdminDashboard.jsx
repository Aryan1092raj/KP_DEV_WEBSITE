import { useEffect, useState } from "react";
import { Skeleton } from "boneyard-js/react";

import { AdminDashboardFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import { announcementService } from "../../services/announcementService";
import { applicationService } from "../../services/applicationService";
import { contactService } from "../../services/contactService";
import { eventService } from "../../services/eventService";
import { memberService } from "../../services/memberService";
import { projectService } from "../../services/projectService";
import { timelineService } from "../../services/timelineService";

const dashboardFixture = {
  members: [{ id: "fixture-member" }],
  projects: [{ id: "fixture-project" }],
  events: [{ id: "fixture-event" }],
  timeline: [{ id: "fixture-timeline" }],
  announcements: [
    { id: "fixture-announcement-1", title: "Spring sprint opens", author: "Core Team", is_published: true },
    { id: "fixture-announcement-2", title: "Workshop schedule updated", author: "Events Desk", is_published: true },
  ],
  applications: [
    { id: "fixture-application-1", name: "Aarav Sharma", email: "aarav@example.com", status: "pending" },
    { id: "fixture-application-2", name: "Riya Kapoor", email: "riya@example.com", status: "accepted" },
  ],
  contactMessages: [
    {
      id: "fixture-message-1",
      name: "Ishaan",
      email: "ishaan@example.com",
      created_at: new Date().toISOString(),
      message: "Wanted to ask about upcoming workshops.",
    },
  ],
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;

  async function load() {
    setLoading(true);
    setError("");

    if (boneyardBuildMode) {
      setSummary(dashboardFixture);
      setLoading(false);
      return;
    }

    try {
      const [members, projects, events, timeline, announcements, applications, contactMessages] =
        await Promise.all([
          memberService.getAdminAll(),
          projectService.getAdminAll(),
          eventService.getAdminAll(),
          timelineService.getAdminAll(),
          announcementService.getAdminAll(),
          applicationService.getAdminAll(),
          contactService.getAdminAll(),
        ]);

      setSummary({
        members,
        projects,
        events,
        timeline,
        announcements,
        applications,
        contactMessages,
      });
    } catch (requestError) {
      setError(requestError.message || "Unable to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [boneyardBuildMode]);

  const showError = Boolean(error) && !boneyardBuildMode;
  const activeSummary = summary ?? dashboardFixture;

  if (showError) {
    return <ErrorMessage message={error} onRetry={load} />;
  }

  const tiles = [
    { label: "Members", value: activeSummary.members.length },
    { label: "Projects", value: activeSummary.projects.length },
    { label: "Events", value: activeSummary.events.length },
    { label: "Milestones", value: activeSummary.timeline.length },
    { label: "Announcements", value: activeSummary.announcements.length },
    {
      label: "Pending applications",
      value: activeSummary.applications.filter((application) => application.status === "pending").length,
    },
    { label: "Contact messages", value: activeSummary.contactMessages.length },
  ];

  return (
    <div className="space-y-6">
      <Skeleton
        fallback={<AdminDashboardFallback />}
        fixture={<AdminDashboardFallback />}
        loading={boneyardBuildMode || loading}
        name="admin-dashboard"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
            <VariableText label="Dashboard" radius={85} />
          </p>
          <h1 className="mt-3 text-4xl font-bold">
            <VariableText label="Operations overview for this cycle" />
          </h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="admin-card">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">
                <VariableText label={tile.label} radius={85} />
              </p>
              <p className="mt-3 text-4xl font-bold text-ink dark:text-white">{tile.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="admin-card">
            <h2 className="text-2xl font-semibold">
              <VariableText label="Recent announcements" />
            </h2>
            <div className="mt-4 space-y-4">
              {activeSummary.announcements.slice(0, 4).map((announcement) => (
                <div key={announcement.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                  <p className="font-semibold">{announcement.title}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                    {announcement.author} • {announcement.is_published ? "Published" : "Draft"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-2xl font-semibold">
              <VariableText label="Application queue" />
            </h2>
            <div className="mt-4 space-y-4">
              {activeSummary.applications.slice(0, 5).map((application) => (
                <div key={application.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{application.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-300">{application.email}</p>
                    </div>
                    <span className="chip">{application.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card xl:col-span-2">
            <h2 className="text-2xl font-semibold">
              <VariableText label="Latest contact messages" />
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {activeSummary.contactMessages.length ? (
                activeSummary.contactMessages.slice(0, 4).map((message) => (
                  <div key={message.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{message.name}</p>
                        <a
                          className="mt-1 inline-block text-sm text-ember underline-offset-4 hover:underline"
                          href={`mailto:${message.email}`}
                        >
                          <VariableText label={message.email} radius={85} />
                        </a>
                      </div>
                      <span className="chip">
                        {new Date(message.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                      <VariableText label={message.message} radius={85} />
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  No contact messages yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </Skeleton>
    </div>
  );
}
