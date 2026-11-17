import type { ReactNode, SVGProps } from 'react';

/**
 * Pražák icon set. One drawing style for every icon: 24×24 grid, 1.75px
 * round-capped stroke in currentColor, no fills except tiny accents, and
 * deliberately slightly imperfect lines (hand-drawn, not geometric-perfect).
 * Decorative by default (aria-hidden); pass `title` to make one meaningful.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number; title?: string };

function Icon({ size = 20, title, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export const IconTram = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 3.2h6.1M12 3.4v2.3" />
    <path d="M6.4 6.1c3.6-.5 7.6-.5 11.2 0 .8.1 1.3.8 1.3 1.6l-.1 9.2c0 1-.8 1.8-1.8 1.8H7c-1 0-1.8-.8-1.8-1.8V7.7c0-.8.5-1.5 1.2-1.6Z" />
    <path d="M5.4 12.1h13.2M9.2 6.4v5.6M14.9 6.4v5.6" />
    <circle cx="8.6" cy="15.3" r=".6" fill="currentColor" />
    <circle cx="15.4" cy="15.3" r=".6" fill="currentColor" />
    <path d="M7.6 18.8 6.2 21M16.5 18.8l1.4 2.2M4.5 21.1h15" />
  </Icon>
);

export const IconTicket = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.4 7.2c0-.7.5-1.2 1.2-1.2h14.8c.7 0 1.2.5 1.2 1.2v2.1a2.7 2.7 0 0 0 0 5.4v2.1c0 .7-.5 1.2-1.2 1.2H4.6c-.7 0-1.2-.5-1.2-1.2v-2.1a2.7 2.7 0 0 0 0-5.4Z" />
    <path d="M15.2 6.3v1.5M15.1 10.4v1.4M15.2 14.1v1.4M15.1 16.6v1" strokeDasharray="0" />
    <path d="M6.6 10h5M6.5 13.3h3.4" />
  </Icon>
);

export const IconStamp = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.6 3.6c1.5-.6 3.3-.6 4.8 0 .3 2-.4 3.9-1 5.2.8.4 1.4 1 1.6 1.9h3.3c.8 0 1.4.6 1.4 1.4v1.6H4.3v-1.6c0-.8.6-1.4 1.4-1.4H9c.2-.9.8-1.5 1.6-1.9-.6-1.3-1.3-3.2-1-5.2Z" />
    <path d="M5.2 17.4h13.6M7 20.5h10" />
  </Icon>
);

/** The háček: the brand mark as an icon (bullet, "aha" mark, loader). */
export const IconHacek = (p: IconProps) => (
  <Icon {...p} strokeWidth={p.strokeWidth ?? 2.6}>
    <path d="M5 8.2c2.2 2.4 4.4 5 6.7 7.6.2.2.5.2.7 0 2-2.6 4-5.2 6.3-7.7" />
  </Icon>
);

export const IconBeer = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.3 7.4h9.6l-.7 12.1c0 .8-.7 1.4-1.5 1.4H8.5c-.8 0-1.5-.6-1.5-1.4Z" />
    <path d="M15.8 9.6h1.6c1.1 0 1.9.9 1.9 2v2.6c0 1.1-.9 2-2 2h-1.8" />
    <path d="M6.1 7.5c-.9-.4-1.3-1.5-.8-2.3.4-.7 1.2-1 1.9-.8.5-1 1.7-1.5 2.8-1.1.9-.8 2.4-.8 3.3.1 1-.3 2.2.2 2.6 1.2.8 0 1.4.8 1.2 1.6-.2.8-.9 1.3-1.7 1.3" />
    <path d="M9.3 11.1v6.6M12.4 11.1v6.6" />
  </Icon>
);

export const IconKey = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="7.6" cy="12.1" r="3.8" />
    <path d="M11.4 12.1h9.2M17.6 12.2v3M20.3 12.1v2.2" />
    <circle cx="7.5" cy="12" r="1" fill="currentColor" />
  </Icon>
);

export const IconMetro = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.4c4.8 0 8.6 3.9 8.6 8.6s-3.8 8.6-8.6 8.6-8.6-3.9-8.6-8.6S7.2 3.4 12 3.4Z" />
    <path d="M7.4 16.4 9.5 7.8l2.6 6 2.5-6 2.1 8.6" />
  </Icon>
);

export const IconSpeaker = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.2 9.3h3.1l4.6-4.1v13.6l-4.6-4.1H4.2c-.4 0-.7-.3-.7-.7V10c0-.4.3-.7.7-.7Z" />
    <path d="M15.3 9.2c1.5 1.6 1.5 4 0 5.6M18 6.6c2.9 3 2.9 7.8 0 10.8" />
  </Icon>
);

export const IconArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.4 12.1c4.9-.2 9.8-.1 14.7 0M13.9 6.8c1.9 1.8 3.6 3.5 5.2 5.3-1.6 1.8-3.3 3.6-5.2 5.3" />
  </Icon>
);

export const IconArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.6 12.1c-4.9-.2-9.8-.1-14.7 0M10.1 6.8C8.2 8.6 6.5 10.3 4.9 12.1c1.6 1.8 3.3 3.6 5.2 5.3" />
  </Icon>
);

export const IconExternal = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10.4 5.3H6c-.9 0-1.6.7-1.6 1.6v11.2c0 .9.7 1.6 1.6 1.6h11.1c.9 0 1.6-.7 1.6-1.6v-4.4" />
    <path d="M13.6 4.4h6v6M19.4 4.6 11.2 12.8" />
  </Icon>
);

export const IconUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12.1 19.4c-.2-4.9-.1-9.8 0-14.7M6.8 9.9c1.8-1.9 3.5-3.6 5.3-5.2 1.8 1.6 3.6 3.3 5.3 5.2" />
  </Icon>
);

/** Done: an ink stamp ring with a hand tick, used instead of a green check. */
export const IconDone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5c4.6-.1 8.5 3.6 8.5 8.4 0 4.7-3.8 8.6-8.5 8.6-4.6 0-8.5-3.9-8.4-8.6C3.6 7.3 7.4 3.6 12 3.5Z" />
    <path d="M7.9 12.4c1.1 1.1 2.1 2.2 3.1 3.3 1.6-2.4 3.3-4.7 5.2-6.9" />
  </Icon>
);

/** Not yet: an empty station ring. */
export const IconOpen = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5.1c3.9-.1 7 3 6.9 6.9 0 3.8-3.1 6.9-6.9 6.9-3.9 0-6.9-3.1-6.9-6.9 0-3.9 3-6.9 6.9-6.9Z" />
  </Icon>
);

/** Terminus / milestone: a station sign on a post. */
export const IconTerminus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21v-9.2" />
    <path d="M5.6 4h12.8c.6 0 1 .4 1 1v5.6c0 .6-.4 1-1 1H5.6c-.6 0-1-.4-1-1V5c0-.6.4-1 1-1Z" />
    <path d="M8.3 7.8h7.4" />
    <path d="M9.4 21h5.2" />
  </Icon>
);

export const IconReview = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.2 11.2a7.3 7.3 0 0 0-12.9-4.1L4.6 9" />
    <path d="M4.5 4.9 4.6 9l4.1-.2" />
    <path d="M4.8 12.8a7.3 7.3 0 0 0 12.9 4.1l1.7-1.9" />
    <path d="M19.5 19.1 19.4 15l-4.1.2" />
  </Icon>
);

export const IconSettings = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.2 7.1h9.4M17.8 7.1h2M4.2 16.9h2M10.4 16.9h9.4" />
    <circle cx="15.7" cy="7.1" r="2.1" />
    <circle cx="8.3" cy="16.9" r="2.1" />
  </Icon>
);

export const IconMic = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.6c1.6 0 2.9 1.3 2.9 2.9v5.2c0 1.6-1.3 2.9-2.9 2.9s-2.9-1.3-2.9-2.9V6.5c0-1.6 1.3-2.9 2.9-2.9Z" />
    <path d="M6.2 11.3c0 3.3 2.6 5.9 5.8 5.9s5.8-2.6 5.8-5.9M12 17.3v3.3M8.9 20.7h6.2" />
  </Icon>
);

export const IconPin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 21c-3.6-3.9-6.4-7.4-6.4-10.6A6.4 6.4 0 0 1 12 4a6.4 6.4 0 0 1 6.4 6.4c0 3.2-2.8 6.7-6.4 10.6Z" />
    <circle cx="12" cy="10.3" r="2.2" />
  </Icon>
);

export const IconBook = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 6.4c-2-1.5-4.6-2.1-7.6-1.9v13.3c3-.2 5.6.4 7.6 1.9 2-1.5 4.6-2.1 7.6-1.9V4.5c-3-.2-5.6.4-7.6 1.9ZM12 6.4v13.2" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.2 6.1c3.9 3.9 7.8 7.8 11.6 11.8M17.9 6.2C14 10 10.1 14 6.1 17.8" />
  </Icon>
);

/** All icons, for the style guide. */
export const ALL_ICONS = {
  IconTram, IconTicket, IconStamp, IconHacek, IconBeer, IconKey, IconMetro, IconSpeaker, IconArrowRight, IconArrowLeft,
  IconExternal, IconUp, IconDone, IconOpen, IconTerminus, IconReview, IconSettings, IconMic, IconPin, IconBook, IconClose,
};
