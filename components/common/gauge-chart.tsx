interface GaugeChartProps {
  value: number;
  max?: number;
  status: 'safe' | 'warning' | 'danger';
}

export function GaugeChart({ value, max = 100, status }: GaugeChartProps) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    switch (status) {
      case 'safe':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'danger':
        return '#ef4444';
      default:
        return '#10b981';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="200" height="120" viewBox="0 0 200 120" className="mb-4">
        {/* Background arc */}
        <path
          d="M 20 100 A 45 45 0 0 1 180 100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <path
          d="M 20 100 A 45 45 0 0 1 180 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out',
            transform: 'rotate(-90deg)',
            transformOrigin: '100px 100px',
          }}
        />

        {/* Center text */}
        <text
          x="100"
          y="110"
          textAnchor="middle"
          fontSize="28"
          fontWeight="bold"
          fill="#1e293b"
        >
          {value}
        </text>
      </svg>

      {/* Labels */}
      <div className="flex justify-between w-full text-xs text-muted-foreground">
        <span>0</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
