import { Link } from 'react-router-dom';
import { StreakTicket } from './StreakTicket';
import { useTicket } from './useTicket';

/** Home: today's ticket, if there is one. Nothing at all before the first answer. */
export function TicketCard() {
  const t = useTicket();
  if (!t || (t.days === 0 && !t.justExpired)) return null;
  return (
    <div>
      <StreakTicket t={t} />
      <Link to="/wallet#ticket" className="mt-2 inline-block text-sm text-vltava hover:underline">
        {t.days > 0 ? <>Plan a <span lang="cs">výluka</span>, see old tickets</> : 'See old tickets'}
      </Link>
    </div>
  );
}
