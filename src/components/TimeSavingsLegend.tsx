import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const TimeSavingsLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Alert className="mt-6 bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-start">
        <Clock className="h-4 w-4 text-primary shrink-0" />
        <AnimatePresence initial={false}>
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2"
            >
              <AlertDescription className="text-left text-sm">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-montserrat font-medium text-primary">Gesetzliche CME-Pflicht nach § 95d SGB V</h4>
                    <p className="mt-1 text-muted-foreground font-roboto">
                      <strong>Nur Zahnärzte</strong> haben eine gesetzliche Fortbildungspflicht:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-muted-foreground font-roboto space-y-1">
                      <li>25 CME-Punkte pro Jahr (125 Punkte in 5 Jahren)</li>
                      <li>Ca. 5 Präsenzveranstaltungen à 5 Stunden pro Jahr</li>
                      <li>ZFA haben KEINE gesetzliche Fortbildungspflicht</li>
                      <li>ZFA: Nur freiwillige Weiterbildung (~30% Teilnahmequote)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-montserrat font-medium text-primary">Zeitersparnis mit KursRadar</h4>
                    <p className="mt-1 text-muted-foreground font-roboto">
                      KursRadar spart Zeit durch:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-muted-foreground font-roboto space-y-1">
                      <li><strong>10+ Stunden/Jahr weniger Recherche:</strong> Alle Kurse auf einer Plattform statt auf dutzenden Websites</li>
                      <li><strong>Bessere Kursauswahl:</strong> Mehr Online-Optionen reduzieren Reisezeit</li>
                      <li><strong>Effiziente Planung:</strong> Filter nach Punkten, Preis, Datum und Ort</li>
                      <li><strong>Team-Koordination:</strong> Jahresplanung für das gesamte Team an einem Ort</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-montserrat font-medium text-primary">Degressive Praxisausfall-Faktoren</h4>
                    <p className="mt-1 text-muted-foreground font-roboto">
                      Realistische Berechnung basierend auf Praxisgröße:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-muted-foreground font-roboto space-y-1">
                      <li><strong>Kleine Praxis (bis 4 Mitarbeiter):</strong> 85% Ausfallwahrscheinlichkeit</li>
                      <li><strong>Mittlere Praxis (5-10 Mitarbeiter):</strong> 65% Ausfallwahrscheinlichkeit</li>
                      <li><strong>Große Praxis (10+ Mitarbeiter):</strong> 45% Ausfallwahrscheinlichkeit</li>
                      <li>Berücksichtigt Vertretungsmöglichkeiten und Flexibilität</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-montserrat font-medium text-primary">Konservative Opportunitätskosten</h4>
                    <p className="mt-1 text-muted-foreground font-roboto">
                      Reduzierte Stundensätze für realistische Berechnung:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-muted-foreground font-roboto space-y-1">
                      <li><strong>Zahnarzt:</strong> 80€/Stunde (konservative Opportunitätskosten)</li>
                      <li><strong>ZFA:</strong> 20€/Stunde (konservative Opportunitätskosten)</li>
                      <li>Deutlich unter Marktpreisen für konservative Schätzung</li>
                      <li>Keine Umsatzverluste, nur direkte Personalkosten</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-montserrat font-medium text-primary">Qualitative Zeitvorteile</h4>
                    <p className="mt-1 text-muted-foreground font-roboto">
                      Zusätzlich zu den messbaren Zeitersparnissen:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-muted-foreground font-roboto space-y-1">
                      <li>Flexible Zeiteinteilung der Fortbildungen</li>
                      <li>Bessere Work-Life-Balance für das Team</li>
                      <li>Kontinuierliches Lernen statt punktuelle Fortbildungen</li>
                      <li>Sofortige Anwendung des Gelernten in der Praxis</li>
                    </ul>
                  </div>

                  <p className="text-xs text-muted-foreground/70 font-roboto">
                    * Diese Berechnungen basieren auf durchschnittlichen Branchenwerten und können je nach 
                    individueller Praxissituation variieren.
                  </p>

                  <div className="space-y-2 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground/70 font-roboto">Quellen:</p>
                    <ul className="text-xs text-muted-foreground/70 font-roboto space-y-1">
                      <li>
                        <a href="https://www.kzbv.de/praxisfuehrung-betriebswirtschaft.14.de.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          KZBV - Praxisführung und Betriebswirtschaft
                        </a>
                      </li>
                      <li>
                        <a href="https://www.statistisches-bundesamt.de/DE/Themen/Arbeit/Verdienste/Verdienste-Branchen/_inhalt.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          Statistisches Bundesamt - Verdienste nach Branchen
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </motion.div>
          ) : (
            <span className="ml-2 text-sm text-muted-foreground font-roboto">Klicken für Details zu den Zeitersparnis-Berechnungen</span>
          )}
        </AnimatePresence>
      </div>
    </Alert>
  );
};
