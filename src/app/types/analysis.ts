export interface AnalysisRule {
  rank: number;
  antecedentItems: string[];
  consequentItems: string[];
  antecedent: string;
  consequent: string;
  support: number;
  confidence: number;
  lift: number;
  leverage: number;
  conviction: number | null;
  score: number;
  promoCode: string;
  promoDiscount: number;
  collectorThemeEligible: boolean;
  highlyStable: boolean;
  ruleSignature: string;
}

export interface IterationAnalysis {
  name: string;
  range: {
    min_id: number;
    max_id: number;
  };
  transactionCount: number;
  rawRowCount: number;
  autoSupport: number;
  stabilitySupport: number;
  topRules: AnalysisRule[];
  driftDetected: boolean;
  previousTopRuleSignature: string | null;
  currentTopRuleSignature: string | null;
}

export interface AnalysisResults {
  generatedAt: string;
  source: string;
  iterations: IterationAnalysis[];
  modelHistory: Record<string, {
    name: string;
    range: { min_id: number; max_id: number };
    topRules: AnalysisRule[];
    topRuleSignature: string | null;
  }>;
  comparisonIteration1Vs3: {
    iteration1TopRule: string | null;
    iteration3TopRule: string | null;
    topRuleChanged: boolean;
  };
}
