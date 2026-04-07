export default function ErrorMessage({ message, retryLabel, onRetry }) {
  return (
    <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-5 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
      <p className="font-medium">{message}</p>
      {onRetry ? (
        <button className="btn-secondary mt-4" onClick={onRetry} type="button">
          {retryLabel || "Try again"}
        </button>
      ) : null}
    </div>
  );
}
