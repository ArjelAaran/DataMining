import { useEffect, useMemo, useState } from 'react';
import { AnalysisResults, AnalysisRule } from '../types/analysis';
import { getHighestLiftRuleFromBackend, getTopRuleFromBackend, sortRulesByWeightedScore } from '../lib/associationRules';

interface BusinessActionCenterProps {
  iteration: number;
  analysis: AnalysisResults | null;
  loading: boolean;
}

interface PromoCampaign {
  antecedent: string;
  consequent: string;
  lift: number;
  code: string;
  discountPercent: number;
}

export function BusinessActionCenter({ iteration, analysis, loading }: BusinessActionCenterProps) {
  const [campaign, setCampaign] = useState<PromoCampaign | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => { setCampaign(null); setActionError(null); }, [iteration, analysis?.generatedAt]);

  const currentIteration = analysis?.iterations?.[iteration] ?? null;
  const topThree = useMemo(() => sortRulesByWeightedScore(currentIteration?.topRules ?? []).slice(0, 3), [currentIteration]);
  const activePreview = getTopRuleFromBackend(currentIteration) ?? topThree[0] ?? null;

  const handleGenerateCampaign = () => {
    const rule = getHighestLiftRuleFromBackend(currentIteration);
    if (!rule) { setActionError('NO RULE FOUND — run main_engine.py first.'); return; }
    setActionError(null);
    setCampaign({
      antecedent: rule.antecedent,
      consequent: rule.consequent,
      lift: rule.lift,
      code: rule.promoCode,           // ← use JSON value directly
      discountPercent: rule.promoDiscount,  // ← use JSON value directly
    });
  };

  return (
    <div className="space-y-6">

      {/* Section header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-red-600" />
          <div>
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Business Action Center</h2>
            <p className="text-[10px] text-gray-600 tracking-widest uppercase">E-commerce Recommendations · Pokémon Merch</p>
          </div>
        </div>
        <div className="flex-1 h-px bg-red-900" />
      </div>

      {/* SECTION A: Homepage Ranking — full-width table */}
      <div className="border border-gray-800">
        <div className="border-b border-gray-800 bg-gray-950 px-4 py-2 flex items-center gap-3">
          <div className="w-2 h-2 bg-red-600" />
          <span className="text-[10px] tracking-[0.25em] uppercase text-red-400 font-bold">Homepage Ranking</span>
          <span className="text-[10px] text-gray-700 tracking-wider ml-2">— Bundles featured at top of storefront</span>
        </div>

        <div className="divide-y divide-gray-900">
          {topThree.length === 0 && !loading && (
            <div className="px-4 py-4 text-[10px] text-gray-700 tracking-wider">NO RANKING DATA</div>
          )}
          {topThree.map((rule, idx) => (
            <div key={idx} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-950 transition-colors">
              <div className="text-red-600 text-xs font-bold w-6 shrink-0">#{idx + 1}</div>
              <div className="flex-1 text-xs text-white tracking-wide">
                <span className="text-gray-400">{rule.antecedent}</span>
                <span className="text-red-600 mx-2">+</span>
                <span className="text-gray-400">{rule.consequent}</span>
              </div>
              <div className="text-[10px] text-gray-600 tracking-wider shrink-0">
                SCORE <span className="text-gray-400">{rule.score.toFixed(3)}</span>
              </div>
              <div className="text-[10px] text-gray-600 tracking-wider shrink-0">
                LIFT <span className="text-white">{rule.lift.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION B: Cart Suggestion */}
      <div className="border border-gray-800">
        <div className="border-b border-gray-800 bg-gray-950 px-4 py-2 flex items-center gap-3">
          <div className="w-2 h-2 bg-white" />
          <span className="text-[10px] tracking-[0.25em] uppercase text-white font-bold">Cart Suggestion</span>
          <span className="text-[10px] text-gray-700 tracking-wider ml-2">— "Frequently bought together" popup</span>
        </div>

        <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-800">
          <div className="py-3 md:py-0 md:pr-6">
            <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-2">Trigger Item</div>
            <div className="text-xs text-white border border-gray-700 bg-gray-950 px-3 py-2 leading-relaxed">
              {activePreview?.antecedent ?? <span className="text-gray-700">—</span>}
            </div>
          </div>

          <div className="py-3 md:py-0 md:px-6 flex items-center justify-center">
            <div className="text-red-600 text-lg font-bold tracking-widest">→</div>
          </div>

          <div className="py-3 md:py-0 md:pl-6">
            <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-2">Suggested Add</div>
            <div className="text-xs text-white border border-red-900 bg-red-950 px-3 py-2 leading-relaxed">
              {activePreview?.consequent ?? <span className="text-gray-700">—</span>}
            </div>
            {activePreview && (
              <div className="text-[10px] text-gray-600 mt-2 tracking-wider">
                {Math.round(activePreview.confidence * 100)}% of trainers bought this together
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION C: Promo Generator */}
      <div className="border border-gray-800">
        <div className="border-b border-gray-800 bg-gray-950 px-4 py-2 flex items-center gap-3">
          <div className="w-2 h-2 bg-red-400" />
          <span className="text-[10px] tracking-[0.25em] uppercase text-red-300 font-bold">Promo Generator</span>
          <span className="text-[10px] text-gray-700 tracking-wider ml-2">— ML-powered campaign from highest-lift rule</span>
        </div>

        <div className="px-4 py-4 flex items-start gap-6 flex-wrap">
          {campaign ? (
            <div className="flex-1 border border-red-800 bg-red-950 px-5 py-4 min-w-[200px]">
              <div className="text-3xl font-bold text-red-400 tracking-wider mb-1">
                {campaign.discountPercent}% OFF
              </div>
              <div className="text-[10px] text-red-300 tracking-widest uppercase mb-3">Campaign Active</div>
              <div className="text-xs text-gray-400 mb-3 leading-relaxed">
                {campaign.antecedent} + {campaign.consequent}
              </div>
              <div className="text-xs font-bold tracking-[0.3em] text-white bg-black border border-red-700 px-3 py-1.5 inline-block">
                CODE: {campaign.code}
              </div>
              <div className="text-[10px] text-gray-600 mt-2 tracking-wider">
                LIFT {campaign.lift.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="flex-1 border border-gray-800 bg-gray-950 px-5 py-4 min-w-[200px]">
              <div className="text-3xl font-bold text-gray-800 tracking-wider mb-1">--% OFF</div>
              <div className="text-[10px] text-gray-700 tracking-widest uppercase mb-3">Awaiting Generation</div>
              <div className="text-[10px] text-gray-800 tracking-wider">CODE: N/A</div>
            </div>
          )}

          <div className="flex flex-col gap-2 justify-center">
            <button
              onClick={handleGenerateCampaign}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold tracking-[0.2em] uppercase transition-colors border border-red-500"
            >
              ▶ GENERATE CAMPAIGN
            </button>
            {actionError && (
              <div className="text-[10px] text-red-500 tracking-wider border border-red-900 px-3 py-1.5">
                {actionError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
