import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useFetch } from "../../hooks/useFetch";
import { contactService } from "../../services/contactService";

function formatDate(value) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ViewContactMessages() {
  const { data, error, loading, refetch } = useFetch(contactService.getAdminAll);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ember">
          Contact inbox
        </p>
        <h1 className="mt-3 text-4xl font-bold">
          Review messages submitted from the public contact page
        </h1>
      </div>

      {loading ? <LoadingSpinner label="Loading contact messages..." /> : null}
      {error ? <ErrorMessage message={error} onRetry={refetch} /> : null}

      {!loading && !error ? (
        data?.length ? (
          <div className="grid gap-5">
            {data.map((message) => (
              <div className="admin-card" key={message.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{message.name}</h2>
                    <a
                      className="mt-1 inline-block text-sm text-ember underline-offset-4 hover:underline"
                      href={`mailto:${message.email}`}
                    >
                      {message.email}
                    </a>
                  </div>
                  <span className="chip">{formatDate(message.created_at)}</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {message.message}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-card">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No contact messages have been submitted yet.
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}
