/** Small brand pieces built from the three line colours. */
/** The logo mark: three overlapping metro-line circles. */
export function MetroMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className={className}>
      <circle cx="13" cy="15" r="10" fill="var(--line-a)" />
      <circle cx="27" cy="15" r="10" fill="var(--line-b)" opacity="0.92" />
      <circle cx="20" cy="27" r="10" fill="var(--line-c)" opacity="0.9" />
    </svg>
  );
}

/** A full-width three-colour line, as on the metro map. */
export function MetroLineStripe({ className = 'h-1.5' }: { className?: string }) {
  return (
    <div aria-hidden className={`flex w-full ${className}`}>
      <span className="flex-1 bg-line-a" />
      <span className="flex-1 bg-line-b" />
      <span className="flex-1 bg-line-c" />
    </div>
  );
}
