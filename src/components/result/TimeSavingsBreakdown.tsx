
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, DollarSign, Building, Users, Info } from "lucide-react";
import { formatCurrency } from "@/utils/calculations";
import type { ExtendedTimeSavings } from "@/utils/calculations/extendedTimeSavingsCalculations";

interface TimeSavingsBreakdownProps {
  extendedTimeSavings: ExtendedTimeSavings;
}

export const TimeSavingsBreakdown: React.FC<TimeSavingsBreakdownProps> = ({
  extendedTimeSavings
}) => {
  const { totalHoursPerYear, totalMonetaryValue, practiceImpact, breakdown, sources } = extendedTimeSavings;

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Clock className="h-5 w-5" />
          Erweiterte Zeitersparnis-Analyse
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="practice">Praxisauswirkung</TabsTrigger>
            <TabsTrigger value="breakdown">Kostenvergleich</TabsTrigger>
            <TabsTrigger value="sources">Quellen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm text-gray-400">Zeitersparnis/Jahr</span>
                </div>
                <p className="text-2xl font-bold text-white">{Math.round(totalHoursPerYear)} Stunden</p>
                <p className="text-xs text-gray-500">≈ {Math.round(totalHoursPerYear / 8)} Arbeitstage</p>
              </div>

              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-400">Monetärer Wert</span>
                </div>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(totalMonetaryValue)}</p>
                <p className="text-xs text-gray-500">Gesamte Ersparnis</p>
              </div>

              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-400">Praxisschließung</span>
                </div>
                <p className="text-2xl font-bold text-blue-500">{practiceImpact.closureHours} Stunden</p>
                <p className="text-xs text-gray-500">vermieden pro Jahr</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white">Zusammensetzung der Ersparnis</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gesparte Arbeitszeit (Personal)</span>
                  <span className="text-white">{formatCurrency(extendedTimeSavings.details.monetaryValues.dentist + extendedTimeSavings.details.monetaryValues.assistant)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Vermiedene Praxisschließung</span>
                  <span className="text-white">{formatCurrency(practiceImpact.lostRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Eingesparte Organisationskosten</span>
                  <span className="text-white">{formatCurrency(practiceImpact.reschedulingCosts + practiceImpact.communicationCosts)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Vermiedene Opportunitätskosten</span>
                  <span className="text-white">{formatCurrency(practiceImpact.opportunityCosts)}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="practice" className="space-y-4">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building className="h-5 w-5" />
                Auswirkungen auf den Praxisbetrieb
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                  <h5 className="font-medium text-white mb-3">Praxisschließungen vermieden</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Schließungsstunden/Jahr:</span>
                      <span className="text-white">{practiceImpact.closureHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Betroffene Patienten:</span>
                      <span className="text-white">{practiceImpact.closureHours * 3}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Umsatzausfall vermieden:</span>
                      <span className="text-white">{formatCurrency(practiceImpact.lostRevenue)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700">
                  <h5 className="font-medium text-white mb-3">Organisationsaufwand</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Terminumorganisation:</span>
                      <span className="text-white">{formatCurrency(practiceImpact.reschedulingCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Patientenkommunikation:</span>
                      <span className="text-white">{formatCurrency(practiceImpact.communicationCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Opportunitätskosten:</span>
                      <span className="text-white">{formatCurrency(practiceImpact.opportunityCosts)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-600">
                <h5 className="font-medium text-primary mb-2">Flexibilitätsgewinn</h5>
                <p className="text-sm text-gray-400">
                  Mit Crocodile können Ihre Mitarbeiter flexibel lernen, ohne den Praxisbetrieb zu unterbrechen. 
                  Dies führt zu einer kontinuierlichen Patientenversorgung und optimiert Ihre Praxisauslastung.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Detaillierter Kostenvergleich</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-red-700/50">
                  <h5 className="font-medium text-red-400 mb-3">Traditionelle Fortbildung</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Arbeitszeit Personal:</span>
                      <span className="text-white">{formatCurrency(breakdown.traditionalCosts.trainingTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reisezeit:</span>
                      <span className="text-white">{formatCurrency(breakdown.traditionalCosts.travelTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vor-/Nachbereitung:</span>
                      <span className="text-white">{formatCurrency(breakdown.traditionalCosts.preparationTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Praxisschließung:</span>
                      <span className="text-white">{formatCurrency(breakdown.traditionalCosts.practiceClosureImpact)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Organisation:</span>
                      <span className="text-white">{formatCurrency(breakdown.traditionalCosts.organizationalCosts)}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-white">Gesamtkosten:</span>
                        <span className="text-red-400">{formatCurrency(breakdown.traditionalCosts.totalTraditionalImpact)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] p-4 rounded-lg border border-green-700/50">
                  <h5 className="font-medium text-green-400 mb-3">Crocodile Online-Fortbildung</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Arbeitszeit Personal:</span>
                      <span className="text-white">{formatCurrency(breakdown.crocodileCosts.trainingTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reisezeit:</span>
                      <span className="text-white">{formatCurrency(breakdown.crocodileCosts.travelTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vor-/Nachbereitung:</span>
                      <span className="text-white">{formatCurrency(breakdown.crocodileCosts.preparationTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Praxisschließung:</span>
                      <span className="text-white">{formatCurrency(breakdown.crocodileCosts.practiceClosureImpact)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Organisation:</span>
                      <span className="text-white">{formatCurrency(breakdown.crocodileCosts.organizationalCosts)}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-white">Gesamtkosten:</span>
                        <span className="text-green-400">{formatCurrency(breakdown.crocodileCosts.totalCrocodileImpact)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#2a2a2a] p-4 rounded-lg border border-primary/50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-white">Jährliche Gesamtersparnis:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(breakdown.traditionalCosts.totalTraditionalImpact - breakdown.crocodileCosts.totalCrocodileImpact)}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                <Info className="h-5 w-5" />
                Datenquellen und Berechnungsgrundlagen
              </h4>
              
              <div className="space-y-3">
                {Object.entries(sources).map(([key, source]) => (
                  <div key={key} className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-700">
                    <div className="text-sm">
                      <div className="text-primary font-medium mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div className="text-gray-400">{source}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-600">
                <h5 className="font-medium text-white mb-2">Berechnungsmethodik</h5>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>Durchschnittlicher Praxisumsatz: 300€/Stunde (konservative Schätzung)</li>
                  <li>Patientenrückgewinnungsrate: 85% (15% dauerhafter Umsatzausfall)</li>
                  <li>Organisationsaufwand: 25€ pro verschobenem Termin + 5€ Kommunikation</li>
                  <li>Opportunitätskostenfaktor: 20% zusätzlich zu direkten Ausfällen</li>
                  <li>Praxisschließung: 8 Stunden pro Ganztags-Fortbildung</li>
                </ul>
              </div>

              <div className="text-xs text-gray-500">
                * Die Berechnungen basieren auf Branchendurchschnitten und können je nach individueller 
                Praxisstruktur variieren. Für eine präzise Analyse empfehlen wir eine individuelle Beratung.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
