import { formatCurrency } from "@/utils/calculations";

interface ResultSummaryProps {
  savings: number;
  savingsPercentage: number;
  totalTraditionalCosts: number;
  crocodileCosts: number;
}

export const ResultSummary = ({ 
  savings, 
  savingsPercentage, 
  totalTraditionalCosts, 
  crocodileCosts 
}: ResultSummaryProps) => {
  const savingsColor = savings > 0 ? "text-green-500" : "text-primary";

  return (
    <div className="text-center">
      <span className="text-sm font-medium text-gray-200">Jährliches Einsparpotenzial</span>
      <h2 className={`mt-1 text-4xl font-bold ${savingsColor}`}>
        {formatCurrency(savings)}
      </h2>
      <span className={`mt-1 text-lg font-semibold ${savingsPercentage > 0 ? "text-green-400" : "text-gray-300"}`}>
        {savingsPercentage?.toFixed(1)}% Ersparnis
      </span>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Bisherige geschätzte Kosten*</span>
          <span className="font-medium text-white">
            {formatCurrency(totalTraditionalCosts)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Crocodile Kosten</span>
          <span className="font-medium text-white">
            {formatCurrency(crocodileCosts)}
          </span>
        </div>
      </div>
    </div>
  );
};