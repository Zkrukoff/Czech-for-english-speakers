import { Link } from 'react-router-dom';

export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-xl font-semibold">That {what} doesn't exist</h1>
      <Link to="/" className="mt-4 inline-block text-vltava underline">Back to the course</Link>
    </div>
  );
}
