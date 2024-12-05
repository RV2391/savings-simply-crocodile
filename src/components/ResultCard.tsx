import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AddressComponents, CalculatorData, Results } from "@/types";

interface ResultCardProps {
  results: Results;
  calculatorData: CalculatorData;
  addressComponents: AddressComponents;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  calculatorData,
  results,
  addressComponents,
}) => {
  const { toast } = useToast();

  return (
    <Card className="w-full">
      <div className="p-6">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-white">Ihre Ersparnis</h3>
          <div className="text-center">
            <span className="text-sm font-medium text-gray-400">Jährliches Einsparpotenzial</span>
            <h2 className="mt-1 text-4xl font-bold text-green-500">
              {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(results.savings)}
            </h2>
            <span className="mt-1 text-lg font-semibold text-green-500">
              {results.savingsPercentage?.toFixed(1)}% Ersparnis
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};