export interface CalculationInputs {
  teamSize: number;
  dentists: number;
  assistants: number;
  cmePointCost: number;
  travelCosts: number;
  growthRate: number;
}

export interface CalculationResults {
  traditionalCostsDentists: number;
  traditionalCostsAssistants: number;
  totalTraditionalCosts: number;
  crocodileCosts: number;
  savings: number;
  savingsPercentage: number;
}

const ASSISTANT_HOURS = 20;
const ASSISTANT_HOURLY_RATE = 30;
const CME_POINTS_REQUIRED = 50;

export const calculateCrocodileCosts = (teamSize: number): number => {
  // Beispielhafte Staffelung der Kosten
  if (teamSize <= 5) return 1990;
  if (teamSize <= 10) return 2990;
  if (teamSize <= 20) return 4990;
  if (teamSize <= 50) return 9990;
  return 14990;
};

export const calculateResults = (inputs: CalculationInputs): CalculationResults => {
  const traditionalCostsDentists =
    inputs.dentists * CME_POINTS_REQUIRED * inputs.cmePointCost +
    inputs.dentists * inputs.travelCosts;

  const traditionalCostsAssistants =
    inputs.assistants * ASSISTANT_HOURS * ASSISTANT_HOURLY_RATE;

  const totalTraditionalCosts = traditionalCostsDentists + traditionalCostsAssistants;
  const crocodileCosts = calculateCrocodileCosts(inputs.teamSize);
  const savings = totalTraditionalCosts - crocodileCosts;
  const savingsPercentage = (savings / totalTraditionalCosts) * 100;

  return {
    traditionalCostsDentists,
    traditionalCostsAssistants,
    totalTraditionalCosts,
    crocodileCosts,
    savings,
    savingsPercentage,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};