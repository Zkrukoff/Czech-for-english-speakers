import { PageHeader } from './PageHeader';
import { Button } from './ui';

/** A link to something that doesn't exist (any more). */
export function NotFound({ what = 'page' }: { what?: string }) {
  return (
    <>
      <PageHeader
        title={`That ${what} doesn't exist`}
        cs="Tady nic není"
        subtitle="Like a tram stop at 3 a.m. The link may be old, or the address mistyped."
      />
      <Button variant="primary" to="/">Back to the line</Button>
    </>
  );
}
