import { Skeleton } from "boneyard-js/react";

import { AdminContactMessagesFallback } from "../../components/common/BoneyardFallbacks";
import ErrorMessage from "../../components/common/ErrorMessage";
import VariableText from "../../components/common/VariableText";
import { useFetch } from "../../hooks/useFetch";
import { contactService } from "../../services/contactService";

const fixtureContactMessages = [
  {
    id: "fixture-message-1",
    name: "Ishaan",
    email: "ishaan@example.com",
    created_at: new Date().toISOString(),
    message: "Wanted to ask about the next mentoring session schedule.",
  },
  {
    id: "fixture-message-2",
    name: "Ritika",
    email: "ritika@example.com",
    created_at: new Date().toISOString(),
    message: "Can you share how to apply for the upcoming build sprint?",
  },
];

function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ViewContactMessages() {
  const { data, error, loading, refetch } = useFetch(contactService.getAdminAll);
  const boneyardBuildMode =
    typeof window !== "undefined" && window.__BONEYARD_BUILD === true;
  const showError = Boolean(error) && !boneyardBuildMode;
  const messages =
    boneyardBuildMode || loading || !(data ?? []).length ? fixtureContactMessages : data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          <VariableText label="Contact inbox" radius={85} />
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          <VariableText label="Review messages submitted from the public contact page" />
        </h1>
      </div>

      {showError ? <ErrorMessage message={error} onRetry={refetch} /> : null}

      {!showError ? (
        <Skeleton
          fallback={<AdminContactMessagesFallback />}
          fixture={<AdminContactMessagesFallback />}
          loading={boneyardBuildMode || loading}
          name="admin-view-contact-messages"
        >
          {messages.length ? (
            <div className="grid gap-5">
              {messages.map((message) => (
                <div className="admin-card" key={message.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{message.name}</h2>
                      <a
                        className="mt-1 inline-block text-sm text-ember underline-offset-4 hover:underline"
                        href={`mailto:${message.email}`}
                      >
                        <VariableText label={message.email} radius={85} />
                      </a>
                    </div>
                    <span className="chip">{formatDate(message.created_at)}</span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                    <VariableText label={message.message} radius={85} />
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-card">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <VariableText label="No contact messages have been submitted yet." radius={85} />
              </p>
            </div>
          )}
        </Skeleton>
      ) : null}
    </div>
  );
}
