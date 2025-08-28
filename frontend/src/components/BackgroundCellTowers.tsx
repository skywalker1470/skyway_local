import styles from './BackgroundCellTowers.module.css';

function CellTowerSVG({ size = 48, color = "#003366", opacity = 0.1 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 60 L44 60 L32 4 Z" stroke={color} strokeWidth="3" fill="none" />
      <line x1="24" y1="48" x2="40" y2="48" stroke={color} strokeWidth="2" />
      <line x1="22" y1="36" x2="42" y2="36" stroke={color} strokeWidth="2" />
      <line x1="26" y1="24" x2="38" y2="24" stroke={color} strokeWidth="2" />
      <path d="M32 4 C28 12, 36 12, 32 4 Z" stroke={color} strokeWidth="2" fill="none" />
      <path d="M32 14 C24 24, 40 24, 32 14 Z" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  );
}

export default function BackgroundCellTowers() {
  const ROWS = 5;
  const COLUMNS = 5;

  const towerPositions = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      towerPositions.push({
        left: `${(col + 0.6) * (100 / COLUMNS)}vw`,
        top: `${(row + 0.7) * (100 / (ROWS + 1))}vh`,
        size: 36 + Math.random() * 18,
        opacity: 0.1 + Math.random() * 0.18,
      });
    }
  }

  return (
    <div className={styles.background}>
      {towerPositions.map(({ left, top, size, opacity }, i) => (
        <div
          key={i}
          className={styles.tower}
          style={{ left, top, position: "absolute" }}
        >
          <CellTowerSVG size={size} opacity={opacity} />
        </div>
      ))}
    </div>
  );
}
