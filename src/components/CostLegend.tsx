import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const CostLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Alert className="mt-6 bg-[#1a1a1a] text-white border-gray-700 cursor-pointer hover:bg-[#222]" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="flex items-start">
        <InfoIcon className="h-4 w-4 text-primary shrink-0" />
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
                     <h4 className="font-medium text-primary">Zahnärzte/innen: 1.200 € pro Jahr*</h4>
                     <p className="mt-1 text-gray-400">
                       Diese konservative Schätzung basiert auf den gesetzlichen Anforderungen von 125 Fortbildungspunkten in 5 Jahren 
                       (durchschnittlich 25 Punkte pro Jahr nach § 95d SGB V) und beinhaltet Kosten für Selbststudium, Präsenzveranstaltungen, 
                       Online-Fortbildungen und Fachmitgliedschaften.
                     </p>
                   </div>
                   
                   <div>
                     <h4 className="font-medium text-primary">Assistenzkräfte: Freiwillige Fortbildung*</h4>
                     <p className="mt-1 text-gray-400">
                       ZFA haben keine gesetzliche CME-Pflicht. Diese Schätzung berücksichtigt freiwillige Fortbildungen 
                       mit realistischer Teilnahmequote und umfasst 1-2 Tagesfortbildungen oder Online-Kurse pro Jahr.
                     </p>
                   </div>

                  <div>
                    <h4 className="font-medium text-primary">Reisekosten: 0,30 € pro Kilometer</h4>
                    <p className="mt-1 text-gray-400">
                      Die Reisekosten werden wie folgt berechnet:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-2">
                      <li>
                        Zahnärzte/innen: Individuelle Berechnung pro Person, da sie häufig separate Fortbildungen besuchen.
                      </li>
                      <li>
                        Assistenzkräfte: Gebündelte Berechnung in Gruppen von bis zu 5 Personen, da Fahrgemeinschaften 
                        gebildet werden können. Dies reduziert die Gesamtreisekosten erheblich.
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-primary">Crocodile Kosten</h4>
                    <p className="mt-1 text-gray-400">
                      Die Kosten für Crocodile setzen sich wie folgt zusammen:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-gray-400 space-y-2">
                      <li>
                        Grundpreis: 1.699 € pro Jahr für bis zu 20 Nutzer
                      </li>
                      <li>
                        Zusätzliche Nutzer: 50 € pro 10 weitere Nutzer
                      </li>
                      <li>
                        Inklusive unbegrenzter Fortbildungen für das gesamte Team
                      </li>
                      <li>
                        Keine zusätzlichen Reisekosten durch digitale Fortbildungen
                      </li>
                    </ul>
                  </div>

                  <p className="text-xs text-gray-500">
                    * Diese Schätzungen dienen als Ausgangspunkt. Tatsächliche Kosten können je nach individuellen 
                    Bedürfnissen, Praxisschwerpunkten und gewählten Fortbildungsformaten variieren.
                  </p>

                  <div className="space-y-2 border-t border-gray-700 pt-4">
                    <p className="text-xs text-gray-500">Quellen:</p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>
                        <a href="https://www.kzbv.de/vertragszahnarztliche-fortbildung.440.de.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                          KZBV - Vertragszahnärztliche Fortbildung
                        </a>
                      </li>
                      <li>
                        <a href="https://www.zaek-berlin.de/praxisteam/zfa-grundausbildung.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                          Zahnärztekammer Berlin - ZFA Grundausbildung
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </motion.div>
          ) : (
            <span className="ml-2 text-sm text-gray-400">Klicken für Details zu den Kostenberechnungen</span>
          )}
        </AnimatePresence>
      </div>
    </Alert>
  );
};