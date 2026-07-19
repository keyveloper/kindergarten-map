import type { ReactNode, SVGProps } from 'react';

export type GameIconName =
  | 'book'
  | 'check'
  | 'compass'
  | 'home'
  | 'map'
  | 'pin'
  | 'scroll'
  | 'shield'
  | 'sparkle';

interface GameIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: GameIconName;
  size?: number;
}

const paths: Record<GameIconName, ReactNode> = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2Z" />
      <path d="M8 4v13M16 7v13" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23Z" />
      <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23Z" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9Z" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5.5-8 12-8 12S4 15.5 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  scroll: (
    <>
      <path d="M7 4h11a3 3 0 0 1 3 3v1h-5V7a3 3 0 0 0-3-3H7a4 4 0 0 0-4 4v11h13" />
      <path d="M16 8v11a3 3 0 0 0 3 3H7a4 4 0 0 1-4-4" />
      <path d="M8 10h5M8 14h5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.7 3 7.8 7.5 9.5 4.5-1.7 7.5-4.8 7.5-9.5V6Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </>
  ),
  check: <path d="m5 12 4.2 4L19 6.5" />,
  sparkle: (
    <>
      <path d="m12 2 1.4 4.6L18 8l-4.6 1.4L12 14l-1.4-4.6L6 8l4.6-1.4Z" />
      <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z" />
      <path d="m5 14 .7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7Z" />
    </>
  ),
};

export function GameIcon({ name, size = 20, ...props }: GameIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
