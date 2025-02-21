
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";

interface ImpactCardProps {
  title: string;
  value: string | number;
  subValue?: string | number;
  description: string;
  trend?: number;
  isCurrency?: boolean;
}

export const ImpactCard = ({ 
  title, 
  value, 
  subValue, 
  description, 
  trend,
  isCurrency = false 
}: ImpactCardProps) => {
  const formattedValue = isCurrency ? formatCurrency(Number(value)) : value;
  const formattedSubValue = subValue && isCurrency ? formatCurrency(Number(subValue)) : subValue;

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {trend !== undefined && (
            <div className={`flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="ml-1 text-sm">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold">{formattedValue}</div>
          {formattedSubValue && (
            <div className="text-sm text-muted-foreground mt-1">
              Gesamt: {formattedSubValue}
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
