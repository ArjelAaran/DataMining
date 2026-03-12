import { AnalysisRule, IterationAnalysis } from '../types/analysis';
export function sortRulesByWeightedScore(rules: AnalysisRule[]): AnalysisRule[] {
  return [...rules].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.lift - a.lift;
  });
}
export function getTopRuleFromBackend(iteration: IterationAnalysis | null): AnalysisRule | null {
  if (!iteration || iteration.topRules.length === 0) return null;
  return sortRulesByWeightedScore(iteration.topRules)[0];
}
export function getHighestLiftRuleFromBackend(iteration: IterationAnalysis | null): AnalysisRule | null {
  if (!iteration || iteration.topRules.length === 0) return null;
  return [...iteration.topRules].sort((a, b) => {
    if (b.lift !== a.lift) return b.lift - a.lift;
    return b.score - a.score;
  })[0];
}
