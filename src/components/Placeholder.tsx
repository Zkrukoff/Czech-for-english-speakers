export function Placeholder({ milestone }: { milestone: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
      Coming in milestone {milestone}.
    </div>
  );
}
