import { motion } from "framer-motion";
import { useEffect } from "react";
import { Clock, TrendingUp, Users, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGTMTracking } from "@/hooks/useGTMTracking";
import { ExtendedTimeSavings } from "@/utils/calculations/extendedTimeSavingsCalculations";

interface TimeSavingsCardProps {
  timeSavings: ExtendedTimeSavings;
}

export const TimeSavingsCard = ({ timeSavings }: TimeSavingsCardProps) => {
  const { trackTimeSavingsViewed } = useGTMTracking();

  // Track when time savings card is displayed
  useEffect(() => {
    if (timeSavings.totalHoursPerYear > 0) {
      // Assuming we can get team size from the time savings calculation
      const estimatedTeamSize = Math.ceil(
        (timeSavings.dentistHours + timeSavings.assistantHours) / timeSavings.totalHoursPerYear * 10
      );
      
      trackTimeSavingsViewed(
        timeSavings.totalHoursPerYear,
        timeSavings.totalMonetaryValue,
        estimatedTeamSize
      );
    }
  }, [timeSavings, trackTimeSavingsViewed]);
  const formatHours = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return `${days} Tag${days > 1 ? 'e' : ''} ${remainingHours > 0 ? `${remainingHours}h` : ''}`;
    }
    return `${Math.round(hours * 10) / 10}h`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-emerald-50 to-cyan-50 border-emerald-200 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-emerald-100 p-2">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle className="text-xl font-bold text-emerald-800">
              Zeitersparnis pro Jahr (konservativ berechnet)
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Hauptersparnis */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-emerald-600">
              {formatHours(timeSavings.totalHoursPerYear)}
            </div>
            <p className="text-lg text-emerald-700 font-medium">
              gesparte Arbeitszeit
            </p>
            <div className="text-2xl font-bold text-emerald-800">
              {formatCurrency(timeSavings.totalMonetaryValue)}
            </div>
            <p className="text-sm text-emerald-600">
              Monetärer Wert der Zeitersparnis
            </p>
          </div>

          {/* Aufschlüsselung */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-4 w-4 text-emerald-600 mr-1" />
                <span className="text-xs font-medium text-emerald-700">Zahnärzte</span>
              </div>
              <div className="text-lg font-bold text-emerald-800">
                {formatHours(timeSavings.dentistHours)}
              </div>
              <div className="text-xs text-emerald-600">
                {formatCurrency(timeSavings.details.monetaryValues.dentist)}
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-4 w-4 text-emerald-600 mr-1" />
                <span className="text-xs font-medium text-emerald-700">Assistenz</span>
              </div>
              <div className="text-lg font-bold text-emerald-800">
                {formatHours(timeSavings.assistantHours)}
              </div>
              <div className="text-xs text-emerald-600">
                {formatCurrency(timeSavings.details.monetaryValues.assistant)}
              </div>
            </div>
          </div>

          {/* Berechnungshinweis */}
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <h4 className="text-sm font-medium text-emerald-800 mb-2">Konservative Berechnung:</h4>
            <ul className="text-xs text-emerald-700 space-y-1">
              <li>• Ø 5 Stunden pro Präsenzfortbildung (statt 8h)</li>
              <li>• 60% Praxisausfall-Faktor (Wochenendkurse berücksichtigt)</li>
              <li>• Realistische CME-Punkte-Verteilung</li>
              <li>• Inklusive Anfahrt und Vor-/Nachbereitung</li>
            </ul>
          </div>

          {/* Reisezeit */}
          <div className="bg-white/60 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Car className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Gesparte Reisezeit</span>
            </div>
            <div className="text-xl font-bold text-emerald-800">
              {formatHours(timeSavings.travelHours)}
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              Keine Anfahrten zu Präsenzveranstaltungen nötig
            </p>
          </div>

          {/* Praxisauswirkungen */}
          {timeSavings.practiceImpact && (
            <div className="bg-white/60 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Vermiedene Praxisausfälle</span>
              </div>
              <div className="text-xl font-bold text-emerald-800">
                {formatHours(timeSavings.practiceImpact.closureHours)}
              </div>
              <div className="text-sm font-medium text-emerald-700 mt-1">
                {formatCurrency(timeSavings.practiceImpact.totalPracticeImpact)}
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                Vermiedene Ausfallkosten durch geschlossene Praxis
              </p>
            </div>
          )}

          {/* Zusätzliche Vorteile */}
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <h4 className="text-sm font-medium text-emerald-800 mb-2">Weitere Zeitvorteile:</h4>
            <ul className="text-xs text-emerald-700 space-y-1">
              <li>• Flexible Fortbildung ohne Praxisschließung</li>
              <li>• Keine Terminkoordination mit externen Anbietern</li>
              <li>• Kontinuierliches Lernen im Arbeitsalltag</li>
              <li>• Sofortige Umsetzung des Gelernten</li>
              <li>• Keine Wochenend-/Abendtermine erforderlich</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
