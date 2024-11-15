import { motion } from "framer-motion";
import { formatCurrency } from "@/utils/calculations";
import type { CalculationResults } from "@/utils/calculations";

interface ResultCardProps {
  results: CalculationResults;
}

export const ResultCard = ({ results }: ResultCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md rounded-2xl bg-[#2a2a2a] p-6 shadow-lg"
    >
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-sm font-medium text-gray-400">Jährliches Einsparpotenzial</span>
          <h2 className="mt-1 text-4xl font-bold text-primary">
            {formatCurrency(results.savings)}
          </h2>
          <span className="mt-1 text-sm text-gray-400">
            {results.savingsPercentage.toFixed(1)}% Ersparnis
          </span>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Traditionelle Kosten</span>
            <span className="font-medium text-white">
              {formatCurrency(results.totalTraditionalCosts)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Crocodile Health Kosten</span>
            <span className="font-medium text-white">
              {formatCurrency(results.crocodileCosts)}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="text-xs text-gray-500">Aufschlüsselung traditioneller Kosten:</div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Zahnärzte</span>
            <span className="font-medium text-white">
              {formatCurrency(results.traditionalCostsDentists)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Assistenzkräfte</span>
            <span className="font-medium text-white">
              {formatCurrency(results.traditionalCostsAssistants)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};