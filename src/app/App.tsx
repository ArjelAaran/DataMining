import { useCallback, useEffect, useState } from 'react';
import { DataIngestionHub } from './components/DataIngestionHub';
import { IterationSwitcher } from './components/IterationSwitcher';
import { MLEngineView } from './components/MLEngineView';
import { BusinessActionCenter } from './components/BusinessActionCenter';
import { ProductCatalog } from './components/ProductCatalog';
import { AnalysisResults } from './types/analysis';

type ActiveView = 'ml' | 'business' | 'catalog';

export default function App() {
  const [selectedIteration, setSelectedIteration] = useState<number>(0);
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('ml');

  const loadAnalysis = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const response = await fetch('/analysis-results.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = (await response.json()) as AnalysisResults;
      setAnalysis(json);
      setSelectedIteration((prev) => Math.min(prev, Math.max(0, json.iterations.length - 1)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    await fetch('/api/run-analysis', { method: 'POST' }).catch(() => null);
    await loadAnalysis(true);
    setRefreshing(false);
  }, [loadAnalysis]);

  useEffect(() => { void loadAnalysis(false); }, [loadAnalysis]);

  const navItems: { id: ActiveView; label: string; code: string }[] = [
    { id: 'ml',       label: 'ML ENGINE',   code: '01' },
    { id: 'business', label: 'ACTIONS',     code: '02' },
    { id: 'catalog',  label: 'CATALOG',     code: '03' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col" style={{ fontFamily: "'Courier New', Courier, monospace" }}>

      {/* Top bar */}
      <header className="border-b-2 border-red-600 bg-black flex items-center px-6 py-3 gap-6 shrink-0">
        <div className="relative w-9 h-9 rounded-full border-2 border-white overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-red-600" style={{ clipPath: 'inset(0 0 50% 0)' }} />
          <div className="absolute inset-0 bg-white" style={{ clipPath: 'inset(50% 0 0 0)' }} />
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-black z-10" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-black z-20" />
        </div>

        <div className="flex-1">
          <div className="text-red-500 text-xs tracking-[0.3em] uppercase mb-0.5">System / Admin</div>
          <h1 className="text-xl font-bold tracking-widest uppercase text-white">
            PokéML <span className="text-red-500">Recommender</span>
          </h1>
        </div>

        <div className="hidden md:flex items-center gap-4 text-xs text-gray-500 tracking-widest">
          <span>FP-GROWTH ENGINE</span>
          <span className="text-red-600">█</span>
          <span className={error ? 'text-red-400' : loading ? 'text-yellow-400' : 'text-green-400'}>
            {error ? 'ERR' : loading ? 'LOADING...' : '● LIVE'}
          </span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">

        {/* LEFT SIDEBAR */}
        <aside className="w-64 shrink-0 border-r-2 border-red-600 bg-black flex flex-col">

          <div className="border-b border-red-900 p-4">
            <DataIngestionHub
              analysis={analysis}
              loading={loading}
              refreshing={refreshing}
              error={error}
              onRefresh={handleRefresh}
            />
          </div>

          <div className="border-b border-red-900 p-4">
            <IterationSwitcher
              selectedIteration={selectedIteration}
              onIterationChange={setSelectedIteration}
              analysis={analysis}
              loading={loading}
            />
          </div>

          <nav className="p-4 space-y-1">
            <div className="text-gray-600 text-[10px] tracking-[0.25em] mb-3 uppercase">— View Mode —</div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-all duration-150 border text-xs tracking-widest uppercase ${
                  activeView === item.id
                    ? 'border-red-500 bg-red-950 text-red-400'
                    : 'border-transparent text-gray-500 hover:text-white hover:border-gray-700'
                }`}
              >
                <span className={`text-[10px] font-bold ${activeView === item.id ? 'text-red-600' : 'text-gray-700'}`}>
                  {item.code}
                </span>
                {item.label}
                {activeView === item.id && <span className="ml-auto text-red-500 text-xs">▶</span>}
              </button>
            ))}
          </nav>

          <div className="mt-auto p-4 border-t border-red-900 text-[10px] text-gray-700 space-y-1 tracking-wider">
            <div>ASSOC. RULE MINING</div>
            <div>LOCAL · MLXTEND</div>
            <div>POKÉML SYSTEM v1.0</div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-black relative">
          {/* subtle scanline texture */}
          <div
            className="pointer-events-none fixed inset-0 z-50 opacity-[0.02]"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px)',
            }}
          />
          <div className="p-6 space-y-6">
            {activeView === 'ml' && (
              <MLEngineView iteration={selectedIteration} analysis={analysis} loading={loading} />
            )}
            {activeView === 'business' && (
              <BusinessActionCenter iteration={selectedIteration} analysis={analysis} loading={loading} />
            )}
            {activeView === 'catalog' && <ProductCatalog />}
          </div>
        </main>
      </div>
    </div>
  );
}
