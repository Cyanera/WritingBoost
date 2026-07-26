// Shared brand lockup: the "W" mark with a rising "boost" arrow, plus the wordmark.

export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-w">W</span>
        <svg
          className="brand-boost"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
        >
          {/* upward arrow — the "boost" */}
          <path
            d="M12 4.5 6.5 11h3.2v8.5h4.6V11h3.2z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="brand-name">
        Writing <span className="brand-accent">Boost!</span>
      </span>
    </div>
  );
}
