import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResultCard } from "./ResultCard";
import { calculateResults, type CalculationInputs } from "@/utils/calculations";
import { PracticeMap } from "./PracticeMap";
import { AddressInput } from "./AddressInput";
import { dentalInstitutes } from "@/utils/dentalInstitutes";

const defaultInputs: CalculationInputs = {
  teamSize: 10,
  dentists: 3,
  cmePointCost: 40,
  travelCosts: 200,
  growthRate: 5,
  practiceLat: undefined,
  practiceLng: undefined,
};

export const CostCalculator = () => {
  const [inputs, setInputs] = useState<CalculationInputs>(defaultInputs);
  const [showMap, setShowMap] = useState(false);

  const handleInputChange = (field: keyof CalculationInputs) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value) || 0;
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (location: { lat: number; lng: number }) => {
    setInputs((prev) => ({
      ...prev,
      practiceLat: location.lat,
      practiceLng: location.lng,
    }));
  };

  const results = calculateResults(inputs);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-2 lg:px-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 rounded-2xl bg-[#2a2a2a] p-6 shadow-lg"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Kostenkalkulator</h2>
          <p className="text-sm text-gray-400">
            Berechnen Sie Ihr Einsparpotenzial mit Crocodile Health
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamSize" className="text-gray-300">Teamgröße</Label>
            <Input
              id="teamSize"
              type="number"
              value={inputs.teamSize}
              onChange={handleInputChange("teamSize")}
              min="1"
              className="input-transition bg-[#1a1a1a] text-white border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dentists" className="text-gray-300">Anzahl Zahnärzte</Label>
            <Input
              id="dentists"
              type="number"
              value={inputs.dentists}
              onChange={handleInputChange("dentists")}
              min="0"
              className="input-transition bg-[#1a1a1a] text-white border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cmePointCost" className="text-gray-300">Kosten pro CME-Punkt (€)</Label>
            <Input
              id="cmePointCost"
              type="number"
              value={inputs.cmePointCost}
              onChange={handleInputChange("cmePointCost")}
              min="0"
              className="input-transition bg-[#1a1a1a] text-white border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="travelCosts" className="text-gray-300">Reisekosten pro Veranstaltung (€)</Label>
            <Input
              id="travelCosts"
              type="number"
              value={inputs.travelCosts}
              onChange={handleInputChange("travelCosts")}
              min="0"
              className="input-transition bg-[#1a1a1a] text-white border-gray-700"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="growthRate" className="text-gray-300">Jährliche Wachstumsrate (%)</Label>
            <Input
              id="growthRate"
              type="number"
              value={inputs.growthRate}
              onChange={handleInputChange("growthRate")}
              min="0"
              max="100"
              className="input-transition bg-[#1a1a1a] text-white border-gray-700"
            />
          </div>

          <div className="space-y-2 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-white">Standort der Praxis</h3>
            <AddressInput onLocationChange={handleLocationChange} />
            
            <button
              onClick={() => setShowMap(!showMap)}
              className="mt-2 text-sm text-primary hover:text-primary/80"
            >
              {showMap ? "Karte ausblenden" : "Karte anzeigen"}
            </button>

            {showMap && (
              <div className="mt-4">
                <PracticeMap
                  institutes={dentalInstitutes}
                  practiceLocation={
                    inputs.practiceLat && inputs.practiceLng
                      ? { lat: inputs.practiceLat, lng: inputs.practiceLng }
                      : undefined
                  }
                  onPracticeLocationChange={handleLocationChange}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="flex items-center justify-center">
        <ResultCard results={results} />
      </div>
    </div>
  );
};