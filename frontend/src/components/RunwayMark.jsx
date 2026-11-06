export default function RunwayMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect width="32" height="32" rx="6" fill="#111215" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="5.5" fill="none" stroke="#383c45" />
      <path
        d="M8 22 L8 16 L13 16 L13 11 L19 11 L19 8 L24 8"
        fill="none"
        stroke="#f0a561"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="square"
      />
      <rect x="8" y="23" width="16" height="1.5" fill="#ececee" />
    </svg>
  );
}
