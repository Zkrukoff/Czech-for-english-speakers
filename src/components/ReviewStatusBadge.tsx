/** Shown on any Czech content not yet checked by a native speaker. */
export function ReviewStatusBadge({ reviewed }: { reviewed: boolean }) {
  if (reviewed) return null;
  return (
    <span
      title="This content was written carefully but hasn't been checked by a native Czech speaker yet."
      className="inline-flex items-center rounded-full border border-champagne bg-champagne-tint px-2 py-0.5 text-xs font-medium text-ink"
    >
      Not yet native-reviewed
    </span>
  );
}
