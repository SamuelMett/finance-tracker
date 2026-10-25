export default function RunwayMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="7" y="18" width="4.5" height="7" rx="1.5" fill="currentColor" opacity="0.55" />
      <rect x="13.75" y="12" width="4.5" height="13" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="20.5" y="6" width="4.5" height="19" rx="1.5" fill="currentColor" />
    </svg>
  );
}
