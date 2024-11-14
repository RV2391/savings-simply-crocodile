import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResultCard } from "./ResultCard";
import { calculateResults, type CalculationInputs } from "@/utils/calculations";

const defaultInputs: CalculationInputs = {
  teamSize: 10,
  dentists: 3,
  assistants: 7,
  cmePointCost: 40,
  travelCosts: 200,
  growthRate: 5,
};

export const CostCalculator = () => {
  const [inputs, setInputs] = useState<CalculationInputs>(defaultInputs);

  const handleInputChange = (field: keyof CalculationInputs) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const results = calculateResults(inputs);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-2 lg:px-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 rounded-2xl bg-card p-6 shadow-lg"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-sage-800">Kostenkalkulator</h2>
          <p className="text-sm text-sage-600">
            Berechnen Sie Ihr Einsparpotenzial mit Crocodile Health
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamSize">Teamgröße</Label>
            <Input
              id="teamSize"
              type="number"
              value={inputs.teamSize}
              onChange={handleInputChange("teamSize")}
              min="1"
              className="input-transition"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dentists">Anzahl Zahnärzte</Label>
            <Input
              id="dentists"
              type="number"
              value={inputs.dentists}
              onChange={handleInputChange("dentists")}
              min="0"
              className="input-transition"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assistants">Anzahl Assistenzkräfte</Label>
            <Input
              id="assistants"
              type="number"
              value={inputs.assistants}
              onChange={handleInputChange("assistants")}
              min="0"
              className="input-transition"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cmePointCost">Kosten pro CME-Punkt (€)</Label>
            <Input
              id="cmePointCost"
              type="number"
              value={inputs.cmePointCost}
              onChange={handleInputChange("cmePointCost")}
              min="0"
              className="input-transition"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="travelCosts">Reisekosten pro Veranstaltung (€)</Label>
            <Input
              id="travelCosts"
              type="number"
              value={inputs.travelCosts}
              onChange={handleInputChange("travelCosts")}
              min="0"
              className="input-transition"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="growthRate">Jährliche Wachstumsrate (%)</Label>
            <Input
              id="growthRate"
              type="number"
              value={inputs.growthRate}
              onChange={handleInputChange("growthRate")}
              min="0"
              max="100"
              className="input-transition"
            />
          </div>
        </div>
      </motion.div>

      <div className="flex items-center justify-center">
        <ResultCard results={results} />
      </div>
    </div>
  );
};