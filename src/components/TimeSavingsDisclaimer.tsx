import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { getCalculationTransparency } from "@/utils/calculations/practiceImpactCalculations";

interface TimeSavingsDisclaimerProps {
  dentists: number;
  assistants: number;
}

export const TimeSavingsDisclaimer = ({ dentists, assistants }: TimeSavingsDisclaimerProps) => {
  const totalTeamSize = dentists + assistants;
  const transparency = getCalculationTransparency(dentists, assistants, totalTeamSize);

  return (
    <Alert className="mt-4">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm space-y-2">
        <div className="font-medium">Berechnungsgrundlagen (konservative Schätzung):</div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>• <strong>Gesetzliche Pflicht:</strong> Nur Zahnärzte (§ 95d SGB V: 25 CME-Punkte/Jahr)</li>
          <li>• <strong>ZFA-Fortbildung:</strong> Freiwillig, ~{transparency.voluntaryTraining.zfaParticipating} von {transparency.voluntaryTraining.zfaTotal} ZFA nehmen teil</li>
          <li>• <strong>Praxisausfall:</strong> {Math.round(transparency.practiceImpactFactor * 100)}% (abhängig von Praxisgröße: {transparency.practiceSize === 'small' ? 'klein' : transparency.practiceSize === 'medium' ? 'mittel' : 'groß'})</li>
          <li>• <strong>Opportunitätskosten:</strong> Reduzierte Stundensätze (€80 Zahnarzt, €20 ZFA)</li>
          <li>• <strong>Hinweis:</strong> Tatsächliche Einsparungen können je nach Praxisorganisation variieren</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};