import { formatCurrency } from "@/utils/calculations";

interface ResultSummaryProps {
  savings: number;
  savingsPercentage: number;
  totalTraditionalCosts: number;
  optimizedCosts: number;
}

export const ResultSummary = ({ 
  savings, 
  savingsPercentage, 
  totalTraditionalCosts, 
  optimizedCosts 
}: ResultSummaryProps) => {
  const savingsColor = savings > 0 ? "text-primary" : "text-destructive";

  return (
    <div className="text-center">
      <span className="text-sm font-medium text-muted-foreground font-roboto">Jährliches Einsparpotenzial</span>
      <h2 className={`mt-1 font-montserrat text-4xl font-bold ${savingsColor}`}>
        {formatCurrency(savings)}
      </h2>
      <span className={`mt-1 text-lg font-semibold ${savingsPercentage > 0 ? "text-primary" : "text-muted-foreground"}`}>
        {savingsPercentage?.toFixed(1)}% Ersparnis
      </span>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-roboto">Bisherige geschätzte Kosten*</span>
          <span className="font-medium text-card-foreground">
            {formatCurrency(totalTraditionalCosts)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground font-roboto">Mit KursRadar optimiert</span>
          <span className="font-medium text-card-foreground">
            {formatCurrency(optimizedCosts)}
          </span>
        </div>
      </div>
    </div>
  );
};
