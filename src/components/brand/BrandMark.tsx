export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg
        className="brand-mark-icon"
        viewBox="0 0 64 64"
        role="img"
        focusable="false"
      >
        <path d="M32 9 L32 2.5" fill="none" stroke="#1f1a17" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 6.5 C27.5 1.5 20.5 2.5 21.5 7.5 C24.5 9.8 30 9.6 32 6.5 Z" fill="#1f1a17" />
        <path d="M32 6.5 C36.5 1.5 43.5 2.5 42.5 7.5 C39.5 9.8 34 9.6 32 6.5 Z" fill="#1f1a17" />
        <path
          d="M32 9 C19 9 10 18 10 29 C10 42 23 51 32 59 C41 51 54 42 54 29 C54 18 45 9 32 9 Z"
          fill="#ffd85a"
          stroke="#3d342f"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <ellipse cx="20" cy="36" rx="3.4" ry="2.3" fill="#ff8f9c" />
        <ellipse cx="44" cy="36" rx="3.4" ry="2.3" fill="#ff8f9c" />
        <circle cx="25.5" cy="31" r="2.7" fill="#1f1a17" />
        <circle cx="38.5" cy="31" r="2.7" fill="#1f1a17" />
        <circle cx="32" cy="35.4" r="1.5" fill="#1f1a17" />
      </svg>
    </span>
  );
}
