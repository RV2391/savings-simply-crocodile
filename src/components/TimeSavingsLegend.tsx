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
                    <h4 className="font-medium text-emerald-400">Traditionelle Fortbildung: 5 Stunden pro Präsenzveranstaltung</h4>
                    <p className="mt-1 text-gray-400">
                      Jede traditionelle Fortbildungsveranstaltung erfordert (konservative Berechnung):
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-1">
                      <li>5 Stunden aktive Fortbildungszeit</li>
                      <li>Anreise- und Abreisezeit (variiert je nach Standort)</li>
                      <li>0,5 Stunden Vor- und Nachbereitung</li>
                      <li>Praxisschließung oder Personalausfall während der Abwesenheit</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-emerald-400">Crocodile Online-Fortbildung: 3 Stunden pro Einheit</h4>
                    <p className="mt-1 text-gray-400">
                      Digitale Fortbildungen bei Crocodile:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-1">
                      <li>3 Stunden fokussierte Online-Fortbildung</li>
                      <li>Keine Reisezeit - direkt in der Praxis</li>
                      <li>0,5 Stunden minimale Vor- und Nachbereitung</li>
                      <li>Keine Praxisschließung oder Personalausfälle</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-emerald-400">Praxisausfallkosten</h4>
                    <p className="mt-1 text-gray-400">
                      Bei traditionellen Fortbildungen entstehen zusätzliche Kosten durch:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-1">
                      <li>Terminabsagen und Patientenumbuchungen</li>
                      <li>Entgangene Umsätze während Praxisschließung</li>
                      <li>Kommunikationsaufwand mit Patienten</li>
                      <li>Permanente Patientenverluste bei häufigen Ausfällen</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-emerald-400">Monetäre Bewertung der Zeitersparnis</h4>
                    <p className="mt-1 text-gray-400">
                      Die Zeitersparnis wird wie folgt bewertet:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-1">
                      <li>Zahnarzt/Zahnärztin: 150 € pro Stunde</li>
                      <li>Assistenzkraft: 25 € pro Stunde</li>
                      <li>Durchschnittlicher Praxisumsatz: 200 € pro Stunde</li>
                      <li>Basiert auf branchenüblichen Durchschnittswerten</li>
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