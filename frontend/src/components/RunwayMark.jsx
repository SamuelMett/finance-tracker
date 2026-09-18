export default function RunwayMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" fill="#181510" />
      <text x="16" y="23" textAnchor="middle" fontFamily="'Newsreader', Georgia, serif" fontSize="19" fill="#fbfaf6">
        R
      </text>
    </svg>
  );
}
