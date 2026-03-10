import { AnalysisResults } from '../types/analysis';

interface IterationSwitcherProps {
  selectedIteration: number;
  onIterationChange: (i: number) => void;
  analysis: AnalysisResults | null;
  loading: boolean;
}

const ITER_COLORS = [
  { bar: 'bg-red-600',    label: 'text-red-400'   },
  { bar: 'bg-white',      label: 'text-gray-200'  },
  { bar: 'bg-red-400',    label: 'text-red-300'   },
];

export function IterationSwitcher({ selectedIteration, onIterationChange, analysis, loading }: IterationSwitcherProps) {
  const iterations = analysis?.iterations ?? [];

  return (
    <div className="space-y-3">
      <span className="text-[10px] tracking-[0.25em] text-red-500 uppercase">Iteration</span>

      {loading && iterations.length === 0 && (
        <div className="text-[10px] text-gray-700 tracking-wider">LOADING DATA...</div>
      )}

      <div className="space-y-1.5">
        {iterations.map((iter, idx) => {
          const isActive = selectedIteration === idx;
          const col = ITER_COLORS[idx] ?? ITER_COLORS[0];
          const shortName = iter.name.replace(/^Iteration \d+:\s*/i, '');

          return (
            <button
              key={idx}
              onClick={() => onIterationChange(idx)}
              className={`w-full text-left transition-all duration-150 border px-2 py-2 ${
                isActive
                  ? 'border-red-500 bg-red-950'
                  : 'border-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? col.bar : 'bg-gray-700'}`} />
                <span className={`text-[10px] font-bold tracking-widest uppercase ${isActive ? col.label : 'text-gray-600'}`}>
                  IT-{String(idx + 1).padStart(2, '0')}
                </span>
                {iter.driftDetected && (
                  <span className="ml-auto text-[9px] text-yellow-500 tracking-wider">⚡DRIFT</span>
                )}
              </div>
              <div className={`text-[10px] leading-snug ${isActive ? 'text-gray-300' : 'text-gray-700'}`}>
                {shortName}
              </div>
              <div className={`text-[9px] mt-0.5 ${isActive ? 'text-gray-500' : 'text-gray-800'}`}>
                {iter.transactionCount.toLocaleString()} TX
              </div>
            </button>
          );
        })}
      </div>

      {!loading && iterations.length === 0 && (
        <div className="text-[10px] text-gray-700 tracking-wider">NO DATA AVAILABLE</div>
      )}
    </div>
  );
}
