// GLOW Logo SVG Component - "GL[wheel]W" where the wheel replaces the O
const GlowLogo = ({ width = 120, darkMode = false }) => {
  const color = darkMode ? "#ffffff" : "#111111";
  return (
    <svg
      width={width}
      viewBox="0 0 340 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GLOW Logo"
    >
      {/* G */}
      <text
        x="0"
        y="95"
        fontFamily="'Arial Black', 'Arial Bold', sans-serif"
        fontWeight="900"
        fontSize="105"
        fill={color}
        letterSpacing="-2"
      >
        GL
      </text>

      {/* Wheel replacing O — centered around x=192, y=60 */}
      {/* Outer tyre */}
      <circle cx="192" cy="62" r="46" fill={color} />
      {/* Inner rim */}
      <circle cx="192" cy="62" r="36" fill={darkMode ? "#1a1a2e" : "#f0f4ff"} />
      {/* Hub */}
      <circle cx="192" cy="62" r="7" fill={color} />
      {/* Spokes (9 spokes) */}
      {Array.from({ length: 9 }).map((_, i) => {
        const angle = (i * 40 * Math.PI) / 180;
        const x1 = 192 + 9 * Math.cos(angle);
        const y1 = 62 + 9 * Math.sin(angle);
        const x2 = 192 + 33 * Math.cos(angle);
        const y2 = 62 + 33 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={darkMode ? "#1a1a2e" : "#f0f4ff"}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      {/* Shadow/ground line under wheel */}
      <ellipse cx="192" cy="110" rx="38" ry="5" fill={color} opacity="0.35" />

      {/* W */}
      <text
        x="236"
        y="95"
        fontFamily="'Arial Black', 'Arial Bold', sans-serif"
        fontWeight="900"
        fontSize="105"
        fill={color}
        letterSpacing="-2"
      >
        W
      </text>
    </svg>
  );
};

export default GlowLogo;
