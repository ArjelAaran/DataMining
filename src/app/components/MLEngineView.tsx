import { AnalysisResults } from '../types/analysis';
import { GaugeChart } from './GaugeChart';

interface MLEngineViewProps {
  iteration: number;
  analysis: AnalysisResults | null;
  loading: boolean;
}

export function MLEngineView({ iteration, analysis, loading }: MLEngineViewProps) {
  const data = analysis?.iterations?.[iteration];

  return (
    <div className="space-y-6">

      {/* Section header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-red-600" />
          <div>
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">ML Engine View</h2>
            <p className="text-[10px] text-gray-600 tracking-widest uppercase">FP-Growth · Association Rule Mining</p>
          </div>
        </div>
        <div className="flex-1 h-px bg-red-900" />
        <div className="text-[10px] text-gray-700 tracking-widest">
          {data ? `AUTO-SUPP: ${data.autoSupport.toFixed(2)}` : 'NO DATA'}
        </div>
      </div>

      {/* Support readout bar */}
      {data && (
        <div className="border border-gray-800 bg-gray-950 px-4 py-3 flex items-center gap-6">
          <div>
            <div className="text-[10px] text-gray-600 tracking-widest uppercase mb-1">Min Support Threshold</div>
            <div className="text-2xl font-bold text-red-500 tracking-wider">{data.autoSupport.toFixed(2)}</div>
          </div>
          <div className="w-px h-10 bg-gray-800" />
          <div>
            <div className="text-[10px] text-gray-600 tracking-widest uppercase mb-1">Transactions</div>
            <div className="text-2xl font-bold text-white">{data.transactionCount.toLocaleString()}</div>
          </div>
          <div className="w-px h-10 bg-gray-800" />
          <div>
            <div className="text-[10px] text-gray-600 tracking-widest uppercase mb-1">Mode</div>
            <div className="text-xs font-bold text-gray-400 tracking-widest mt-1">
              {data.transactionCount < 500 ? 'SMALL DATASET' : 'LARGE DATASET'}
            </div>
          </div>
          {data.driftDetected && (
            <>
              <div className="w-px h-10 bg-gray-800" />
              <div className="text-xs font-bold text-yellow-500 tracking-widest border border-yellow-900 px-3 py-1">
                ⚡ DRIFT DETECTED
              </div>
            </>
          )}
        </div>
      )}

      {/* Rules */}
      <div className="space-y-4">
        <div className="text-[10px] text-gray-600 tracking-[0.3em] uppercase">
          — Top Association Rules ·  Frequently Bought Together —
        </div>

        {(data?.topRules ?? []).map((rule, index) => (
          <div key={index} className="border border-gray-800 hover:border-red-900 transition-colors">

            {/* Rule header row */}
            <div className="flex items-center gap-0 border-b border-gray-800">
              <div className="bg-red-600 text-white text-xs font-bold px-3 py-2 shrink-0 tracking-wider">
                #{String(index + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 px-4 py-2 flex items-center gap-3 flex-wrap">
                <span className="text-xs text-white font-bold bg-gray-900 border border-gray-700 px-2 py-1 tracking-wide">
                  {rule.antecedent}
                </span>
                <span className="text-red-600 text-xs font-bold">→</span>
                <span className="text-xs text-white font-bold bg-gray-900 border border-gray-700 px-2 py-1 tracking-wide">
                  {rule.consequent}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 shrink-0">
                {rule.highlyStable && (
                  <span className="text-[9px] text-green-500 border border-green-900 px-1.5 py-0.5 tracking-wider uppercase">
                    STABLE
                  </span>
                )}
                {rule.collectorThemeEligible && (
                  <span className="text-[9px] text-yellow-500 border border-yellow-900 px-1.5 py-0.5 tracking-wider uppercase">
                    TCG
                  </span>
                )}
              </div>
            </div>

            {/* Metrics row */}
            <div className="px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-6">
              <GaugeChart label="Confidence" value={rule.confidence} />
              <GaugeChart label="Lift" value={rule.lift / 3} displayValue={rule.lift.toFixed(2)} />
              <GaugeChart label="Support" value={rule.support} />
              <GaugeChart label="Leverage" value={Math.max(0, Math.min(rule.leverage * 4, 1))} displayValue={rule.leverage.toFixed(2)} />
            </div>

            {/* Score footer */}
            <div className="border-t border-gray-800 px-4 py-2 flex items-center gap-4 text-[10px] text-gray-600 tracking-widest">
              <span>SCORE <span className="text-gray-400">{rule.score.toFixed(3)}</span></span>
              <span>·</span>
              <span>PROMO <span className="text-red-500">{rule.promoCode}</span></span>
              <span>·</span>
              <span>DISCOUNT <span className="text-gray-400">{rule.promoDiscount}%</span></span>
            </div>
          </div>
        ))}

        {!loading && (!data || data.topRules.length === 0) && (
          <div className="border border-gray-900 px-4 py-6 text-center">
            <div className="text-xs text-gray-700 tracking-widest">NO RULES AVAILABLE</div>
            <div className="text-[10px] text-gray-800 mt-2 tracking-wider">Run python main_engine.py to generate analysis</div>
          </div>
        )}

        {loading && (
          <div className="border border-gray-900 px-4 py-6 text-center">
            <div className="text-xs text-gray-600 tracking-widest animate-pulse">LOADING RULES...</div>
          </div>
        )}
      </div>
    </div>
  );
}
