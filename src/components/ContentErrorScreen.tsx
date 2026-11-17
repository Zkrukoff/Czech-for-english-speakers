export function ContentErrorScreen({ errors }: { errors: string[] }) {
  return (
    <div className="rounded-lg border border-ink bg-paper-2 p-6">
      <h1 className="text-lg font-semibold text-ink">Course content has {errors.length} error(s)</h1>
      <p className="mt-1 text-sm text-ink">Fix these files in /content. The app reloads automatically in dev.</p>
      <ul className="mt-4 space-y-1 font-mono text-xs text-ink">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
