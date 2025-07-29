import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";

interface CalculationLoadingStateProps {
  currentStep?: number;
}

const loadingSteps = [
  {
    id: 1,
    title: "Nächstes Fortbildungsinstitut wird ermittelt...",
    description: "Suche nach dem nächstgelegenen Fortbildungsinstitut"
  },
  {
    id: 2,
    title: "Entfernungen werden berechnet...",
    description: "Berechnung der Fahrstrecke und Reisezeit"
  },
  {
    id: 3,
    title: "Kalkulation wird finalisiert...",
    description: "Ermittlung der Kostenersparnis und Zeitgewinn"
  }
];

export const CalculationLoadingState: React.FC<CalculationLoadingStateProps> = ({ 
  currentStep = 1 
}) => {
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep(prev => (prev + 1) % 8);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full bg-[#2a2a2a] border-gray-700">
      <div className="p-8 text-center">
        {/* Crocodile Logo Animation */}
        <div className="mb-6 relative">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <img 
              src="/lovable-uploads/818d3c15-58b1-498e-a2af-fa2546da9b70.png" 
              alt="Crocodile Logo" 
              className={`w-full h-full transition-transform duration-300 ${
                animationStep % 4 === 0 ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Pulse Ring */}
            <div 
              className={`absolute inset-0 rounded-full border-2 border-primary/30 transition-all duration-500 ${
                animationStep % 2 === 0 ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
              }`}
            />
          </div>
          
          {/* Current Step Title */}
          <h3 className="text-xl font-semibold text-white mb-2">
            {loadingSteps[currentStep - 1]?.title || "Berechnung läuft..."}
          </h3>
          <p className="text-gray-400 text-sm">
            {loadingSteps[currentStep - 1]?.description || "Bitte warten Sie einen Moment"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3">
          {loadingSteps.map((step, index) => (
            <div 
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                index + 1 < currentStep 
                  ? 'bg-primary/10 border-primary/30 text-primary' 
                  : index + 1 === currentStep
                  ? 'bg-primary/20 border-primary text-white'
                  : 'bg-gray-800/50 border-gray-700 text-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index + 1 < currentStep 
                    ? 'bg-primary text-white' 
                    : index + 1 === currentStep
                    ? 'bg-white text-primary'
                    : 'bg-gray-600 text-gray-400'
                }`}>
                  {index + 1 < currentStep ? '✓' : step.id}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
              {index + 1 === currentStep && (
                <div className="flex space-x-1">
                  {[0, 1, 2].map((dot) => (
                    <div
                      key={dot}
                      className={`w-2 h-2 bg-current rounded-full transition-opacity duration-300 ${
                        animationStep % 3 === dot ? 'opacity-100' : 'opacity-30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Schritt {currentStep} von {loadingSteps.length}
        </div>
      </div>
    </Card>
  );
};