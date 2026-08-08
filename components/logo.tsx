export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      role="img"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>EPDP logo</title>
      <path d="M4 20V16" />
      <path d="M10 20V12" />
      <path d="M16 20V7" />
      <path d="M3 15L9 9L13 12L21 4" />
      <path d="M21 10V4H15" />
    </svg>
  );
}
