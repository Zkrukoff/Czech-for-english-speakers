import { Navigate, useLocation, useParams } from 'react-router-dom';

/** Redirect, keeping ?query and #hash (e.g. /alphabet?tab=practice → /sounds?tab=practice). */
export function KeepQuery({ to }: { to: string }) {
  const { search, hash } = useLocation();
  return <Navigate to={`${to}${search}${hash}`} replace />;
}

export function OverheardRedirect() {
  const { sceneId = '' } = useParams();
  return <Navigate to={`/sounds/overheard/${sceneId}`} replace />;
}
