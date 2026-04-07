export default function ErrorMessage({ message, retryLabel, onRetry }) {
  return (
    <div className="rounded-[24px] border border-white/25 bg-[#090909] p-5 text-white">
      <p className="font-medium">{message}</p>
      {onRetry ? (
        <button className="btn-secondary mt-4" onClick={onRetry} type="button">
          {retryLabel || "Try again"}
        </button>
      ) : null}
    </div>
  );
}
