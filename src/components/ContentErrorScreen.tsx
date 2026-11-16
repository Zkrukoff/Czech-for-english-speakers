export function ContentErrorScreen({ errors }: { errors: string[] }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-semibold text-red-900">Course content has {errors.length} error(s)</h1>
      <p className="mt-1 text-sm text-red-800">Fix these files in /content. The app reloads automatically in dev.</p>
      <ul className="mt-4 space-y-1 font-mono text-xs text-red-900">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}
