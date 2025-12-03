import { motion } from "framer-motion";
import { useEffect } from "react";
import { Clock, TrendingUp, Users, Car, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGTMTracking } from "@/hooks/useGTMTracking";
import { TimeSavingsDisclaimer } from "./TimeSavingsDisclaimer";
import { ExtendedTimeSavings } from "@/utils/calculations/extendedTimeSavingsCalculations";

interface TimeSavingsCardProps {
  timeSavings: ExtendedTimeSavings;
  dentists: number;
  assistants: number;
}

export const TimeSavingsCard = ({ timeSavings, dentists, assistants }: TimeSavingsCardProps) => {
  const { trackTimeSavingsViewed } = useGTMTracking();

  // Track when time savings card is displayed
  useEffect(() => {
    if (timeSavings.totalHoursPerYear > 0) {
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
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-primary/20 p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="font-montserrat text-xl font-bold text-foreground">
              Zeitersparnis mit KursRadar*
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Hauptersparnis */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary font-montserrat">
              {formatHours(timeSavings.totalHoursPerYear)}
            </div>
            <p className="text-lg text-foreground font-medium font-roboto">
              gesparte Arbeitszeit
            </p>
            <div className="text-2xl font-bold text-foreground font-montserrat">
              {formatCurrency(timeSavings.totalMonetaryValue)}
            </div>
            <p className="text-sm text-muted-foreground font-roboto">
              Monetärer Wert der Zeitersparnis
            </p>
            <div className="text-xs text-muted-foreground mt-2 font-roboto">
              *Verglichen mit unkoordinierter Kurssuche und Präsenz-Fortbildungen
            </div>
          </div>

          {/* Aufschlüsselung */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/60 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-4 w-4 text-primary mr-1" />
                <span className="text-xs font-medium text-foreground font-roboto">Zahnärzte</span>
              </div>
              <div className="text-lg font-bold text-foreground font-montserrat">
                {formatHours(timeSavings.dentistHours)}
              </div>
              <div className="text-xs text-muted-foreground font-roboto">
                {formatCurrency(timeSavings.details.monetaryValues.dentist)}
              </div>
            </div>

            <div className="bg-card/60 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-4 w-4 text-primary mr-1" />
                <span className="text-xs font-medium text-foreground font-roboto">Assistenz</span>
              </div>
              <div className="text-lg font-bold text-foreground font-montserrat">
                {formatHours(timeSavings.assistantHours)}
              </div>
              <div className="text-xs text-muted-foreground font-roboto">
                {formatCurrency(timeSavings.details.monetaryValues.assistant)}
              </div>
            </div>
          </div>

          {/* Recherche-Ersparnis */}
          <div className="bg-card/60 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Search className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground font-roboto">Gesparte Recherche-Zeit</span>
            </div>
            <div className="text-xl font-bold text-foreground font-montserrat">
              10+ Stunden/Jahr
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-roboto">
              Alle Kurse auf einer Plattform statt auf dutzenden Websites
            </p>
          </div>

          {/* Berechnungshinweis */}
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
            <h4 className="text-sm font-medium text-foreground mb-2 font-montserrat">Konservative Berechnung:</h4>
            <ul className="text-xs text-muted-foreground space-y-1 font-roboto">
              <li>• Nur gesetzlich verpflichtende CME für Zahnärzte (§ 95d SGB V)</li>
              <li>• ZFA-Fortbildung freiwillig, realistische Teilnahmequote</li>
              <li>• Degressive Praxisausfall-Faktoren je nach Teamgröße</li>
              <li>• Opportunitätskosten: €80/h Zahnarzt, €20/h ZFA</li>
            </ul>
          </div>

          {/* Reisezeit */}
          <div className="bg-card/60 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground font-roboto">Gesparte Reisezeit</span>
            </div>
            <div className="text-xl font-bold text-foreground font-montserrat">
              {formatHours(timeSavings.travelHours)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-roboto">
              Durch mehr Online-Optionen weniger Präsenztermine nötig
            </p>
          </div>

          {/* Praxisauswirkungen */}
          {timeSavings.practiceImpact && (
            <div className="bg-card/60 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground font-roboto">Vermiedene Praxisausfälle</span>
              </div>
              <div className="text-xl font-bold text-foreground font-montserrat">
                {formatHours(timeSavings.practiceImpact.closureHours)}
              </div>
              <div className="text-sm font-medium text-foreground mt-1 font-roboto">
                {formatCurrency(timeSavings.practiceImpact.totalPracticeImpact)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-roboto">
                Vermiedene Ausfallkosten durch bessere Planung
              </p>
            </div>
          )}

          {/* Transparenz-Hinweis */}
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
            <h4 className="text-sm font-medium text-foreground mb-2 font-montserrat">Klingt viel?</h4>
            <p className="text-xs text-muted-foreground mb-2 font-roboto">
              Lass dir die detaillierte Kalkulation per Mail zuschicken und vergleiche sie mit deinen aktuellen Fortbildungskosten.
              Unsere Berechnung basiert auf aktuellen Branchendaten und konservativen Annahmen.
            </p>
            <p className="text-xs text-muted-foreground/80 font-roboto">
              Nach der Anmeldung erhältst du eine E-Mail mit allen Berechnungsgrundlagen, 
              Stundensätzen und Quellen unserer Analyse.
            </p>
          </div>

          {/* Weitere Zeitvorteile */}
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
            <h4 className="text-sm font-medium text-foreground mb-2 font-montserrat">Weitere Vorteile mit KursRadar:</h4>
            <ul className="text-xs text-muted-foreground space-y-1 font-roboto">
              <li>• Filter nach Punkten, Preis, Datum und Ort</li>
              <li>• Transparenter Preisvergleich aller Anbieter</li>
              <li>• Jahresplanung für das gesamte Team</li>
              <li>• Kostenlose/gesponserte Kurse entdecken</li>
              <li>• Keine Plattformgebühren für Praxen</li>
            </ul>
          </div>

          <TimeSavingsDisclaimer dentists={dentists} assistants={assistants} />
        </CardContent>
      </Card>
    </motion.div>
  );
};
