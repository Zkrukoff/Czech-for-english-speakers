import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'quiet';

/** Flat button with an ink border and a solid offset shadow. One primary per screen. */
export function Button({
  variant = 'secondary',
  to,
  children,
  className = '',
  ...rest
}: { variant?: Variant; to?: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `btn btn-${variant} ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
