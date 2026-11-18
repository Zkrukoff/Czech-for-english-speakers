import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to #id after navigation; waits briefly for sections that load from the database. */
export function useHashScroll() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) return;
    let tries = 0;
    const t = setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el || ++tries > 20) {
        clearInterval(t);
        el?.scrollIntoView({ block: 'start' });
      }
    }, 50);
    return () => clearInterval(t);
  }, [hash, pathname]);
}
