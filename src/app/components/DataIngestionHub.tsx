import { AnalysisResults } from '../types/analysis';
interface DataIngestionHubProps {
  analysis: AnalysisResults | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
}
export function DataIngestionHub({ analysis, loading, refreshing, error, onRefresh }: DataIngestionHubProps) {
  const latestIteration = analysis?.iterations?.[analysis.iterations.length - 1];
  const lastSynced = analysis?.generatedAt
    ? new Date(analysis.generatedAt).toLocaleTimeString()
    : '--:--';
  const rowCount = latestIteration?.transactionCount ?? 0;
  const rawCount = latestIteration?.rawRowCount ?? 0;
  const statusColor = error ? 'text-red-500' : loading || refreshing ? 'text-yellow-400' : 'text-green-400';
  const statusLabel = error ? 'FILE ERROR' : loading ? 'LOADING' : refreshing ? 'REFRESHING' : 'LOADED';
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[0.25em] text-red-500 uppercase">Data Source</span>
        <button
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="text-[10px] text-gray-600 hover:text-red-400 disabled:opacity-40 tracking-widest uppercase transition-colors"
        >
          {refreshing ? 'SYNC...' : '↺ SYNC'}
        </button>
      </div>
      <div className={`text-xs font-bold tracking-widest ${statusColor}`}>
        {statusLabel}
      </div>
      <div className="border border-gray-800 divide-y divide-gray-800">
        <div className="flex justify-between px-2 py-1.5">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider">TX COUNT</span>
          <span className="text-[11px] text-white font-bold">{rowCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between px-2 py-1.5">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider">RAW ROWS</span>
          <span className="text-[11px] text-white font-bold">{rawCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between px-2 py-1.5">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider">SYNCED</span>
          <span className="text-[11px] text-gray-400">{lastSynced}</span>
        </div>
      </div>
      {error && (
        <div className="text-[10px] text-red-500 border border-red-900 px-2 py-1.5 leading-relaxed">
          ERR: {error}
        </div>
      )}
    </div>
  );
}
