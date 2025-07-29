import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const TimeSavingsLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Alert className="mt-6 bg-[#1a1a1a] text-white border-gray-700 cursor-pointer hover:bg-[#222]" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-start">
        <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
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
                    <h4 className="font-medium text-emerald-400">Gesetzliche CME-Pflicht nach § 95d SGB V</h4>
                    <p className="mt-1 text-gray-400">
                      <strong>Nur Zahnärzte</strong> haben eine gesetzliche Fortbildungspflicht:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-1">
                      <li>25 CME-Punkte pro Jahr (125 Punkte in 5 Jahren)</li>
                      <li>Ca. 5 Präsenzveranstaltungen à 5 Stunden pro Jahr</li>
                      <li>ZFA haben KEINE gesetzliche Fortbildungspflicht</li>
                      <li>ZFA: Nur freiwillige Weiterbildung (~30% Teilnahmequote)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-emerald-400">Traditionelle vs. Online-Fortbildung</h4>
                    <p className="mt-1 text-gray-400">
                      Zeitaufwand pro Fortbildungseinheit (konservative Schätzung):
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-1">
                      <li><strong>Traditionell:</strong> 5h Fortbildung + Reisezeit + 1h Vorbereitung</li>
                      <li><strong>Online:</strong> Flexible Zeiteinteilung, keine Reisezeit</li>
                      <li><strong>Praxisausfall:</strong> Degressive Skalierung je nach Teamgröße</li>
                      <li><strong>Vertretung:</strong> Große Praxen haben bessere Möglichkeiten</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-emerald-400">Degressive Praxisausfall-Faktoren</h4>
                    <p className="mt-1 text-gray-400">
                      Realistische Berechnung basierend auf Praxisgröße:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-1">
                      <li><strong>Kleine Praxis (bis 4 Mitarbeiter):</strong> 85% Ausfallwahrscheinlichkeit</li>
                      <li><strong>Mittlere Praxis (5-10 Mitarbeiter):</strong> 65% Ausfallwahrscheinlichkeit</li>
                      <li><strong>Große Praxis (10+ Mitarbeiter):</strong> 45% Ausfallwahrscheinlichkeit</li>
                      <li>Berücksichtigt Vertretungsmöglichkeiten und Flexibilität</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-emerald-400">Konservative Opportunitätskosten</h4>
                    <p className="mt-1 text-gray-400">
                      Reduzierte Stundensätze für realistische Berechnung:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-1">
                      <li><strong>Zahnarzt:</strong> 80€/Stunde (konservative Opportunitätskosten)</li>
                      <li><strong>ZFA:</strong> 20€/Stunde (konservative Opportunitätskosten)</li>
                      <li>Deutlich unter Marktpreisen für konservative Schätzung</li>
                      <li>Keine Umsatzverluste, nur direkte Personalkosten</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-emerald-400">Qualitative Zeitvorteile</h4>
                    <p className="mt-1 text-gray-400">
                      Zusätzlich zu den messbaren Zeitersparnissen:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-1">
                      <li>Flexible Zeiteinteilung der Fortbildungen</li>
                      <li>Bessere Work-Life-Balance für das Team</li>
                      <li>Kontinuierliches Lernen statt punktuelle Fortbildungen</li>
                      <li>Sofortige Anwendung des Gelernten in der Praxis</li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-500">
                    * Diese Berechnungen basieren auf durchschnittlichen Branchenwerten und können je nach 
                    individueller Praxissituation variieren.
                  </p>

                  <div className="space-y-2 border-t border-gray-700 pt-4">
                    <p className="text-xs text-gray-500">Quellen:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>
                        <a href="https://www.kzbv.de/praxisfuehrung-betriebswirtschaft.14.de.html" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">
                          KZBV - Praxisführung und Betriebswirtschaft
                        </a>
                      </li>
                      <li>
                        <a href="https://www.statistisches-bundesamt.de/DE/Themen/Arbeit/Verdienste/Verdienste-Branchen/_inhalt.html" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">
                          Statistisches Bundesamt - Verdienste nach Branchen
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </motion.div>
          ) : (
            <span className="ml-2 text-sm text-gray-400">Klicken für Details zu den Zeitersparnis-Berechnungen</span>
          )}
        </AnimatePresence>
      </div>
    </Alert>
  );
};