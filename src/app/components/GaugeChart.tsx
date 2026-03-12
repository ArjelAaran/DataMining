interface GaugeChartProps {
  label: string;
  value: number;
  displayValue?: string;
  color?: string;
}
export function GaugeChart({ label, value, displayValue }: GaugeChartProps) {
  const pct = Math.min(Math.max(value, 0), 1);
  const filled = Math.round(pct * 10);
  const bars = Array.from({ length: 10 }, (_, i) => i < filled);
  const barColor = pct > 0.7 ? 'bg-red-500' : pct > 0.4 ? 'bg-red-700' : 'bg-gray-700';
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[10px] text-gray-500 tracking-widest uppercase">{label}</div>
      <div className="flex gap-0.5 items-end h-5">
        {bars.map((on, i) => (
          <div
            key={i}
            className={`w-3 transition-all duration-500 ${on ? barColor : 'bg-gray-900 border border-gray-800'}`}
            style={{ height: `${50 + i * 6}%` }}
          />
        ))}
      </div>
      <div className="text-sm font-bold text-white tracking-wider">
        {displayValue ?? value.toFixed(2)}
      </div>
    </div>
  );
}
