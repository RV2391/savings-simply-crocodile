import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const CostLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Alert className="mt-6 bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
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
                     <h4 className="font-montserrat font-medium text-primary">Zahnärzte/innen: 1.200 € pro Jahr*</h4>
                     <p className="mt-1 text-muted-foreground font-roboto">
                       Diese konservative Schätzung basiert auf den gesetzlichen Anforderungen von 125 Fortbildungspunkten in 5 Jahren 
                       (durchschnittlich 25 Punkte pro Jahr nach § 95d SGB V) und beinhaltet Kosten für Selbststudium, Präsenzveranstaltungen, 
                       Online-Fortbildungen und Fachmitgliedschaften.
                     </p>
                   </div>
                   
                   <div>
                     <h4 className="font-montserrat font-medium text-primary">Assistenzkräfte: Freiwillige Fortbildung*</h4>
                     <p className="mt-1 text-muted-foreground font-roboto">
                       ZFA haben keine gesetzliche CME-Pflicht. Diese Schätzung berücksichtigt freiwillige Fortbildungen 
                       mit realistischer Teilnahmequote und umfasst 1-2 Tagesfortbildungen oder Online-Kurse pro Jahr.
                     </p>
                   </div>

                  <div>
                    <h4 className="font-montserrat font-medium text-primary">Reisekosten: 0,30 € pro Kilometer</h4>
                    <p className="mt-1 text-muted-foreground font-roboto">
                      Die Reisekosten werden wie folgt berechnet:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-muted-foreground font-roboto space-y-2">
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
                    <h4 className="font-montserrat font-medium text-primary">Ersparnis mit KursRadar</h4>
                    <p className="mt-1 text-muted-foreground font-roboto">
                      KursRadar ist für Praxen kostenlos. Die Ersparnis entsteht durch:
                    </p>
                    <ul className="list-disc pl-4 mt-2 text-muted-foreground font-roboto space-y-2">
                      <li>
                        <strong>30% kostenlose Kurse:</strong> Gesponserte Webinare und kostenfreie Angebote auf der Plattform
                      </li>
                      <li>
                        <strong>15% Preisoptimierung:</strong> Durch Preisvergleich und Transparenz finden Sie günstigere Alternativen
                      </li>
                      <li>
                        <strong>Weniger Reisekosten:</strong> Mehr Online-Optionen durch bessere Übersicht
                      </li>
                      <li>
                        <strong>Zeitersparnis:</strong> Keine stundenlange Recherche auf verschiedenen Websites
                      </li>
                    </ul>
                  </div>

                  <p className="text-xs text-muted-foreground/70 font-roboto">
                    * Diese Schätzungen dienen als Ausgangspunkt. Tatsächliche Kosten können je nach individuellen 
                    Bedürfnissen, Praxisschwerpunkten und gewählten Fortbildungsformaten variieren.
                  </p>

                  <div className="space-y-2 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground/70 font-roboto">Quellen:</p>
                    <ul className="text-xs text-muted-foreground/70 font-roboto space-y-1">
                      <li>
                        <a href="https://www.kzbv.de/vertragszahnarztliche-fortbildung.440.de.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          KZBV - Vertragszahnärztliche Fortbildung
                        </a>
                      </li>
                      <li>
                        <a href="https://www.zaek-berlin.de/praxisteam/zfa-grundausbildung.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          Zahnärztekammer Berlin - ZFA Grundausbildung
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </motion.div>
          ) : (
            <span className="ml-2 text-sm text-muted-foreground font-roboto">Klicken für Details zu den Kostenberechnungen</span>
          )}
        </AnimatePresence>
      </div>
    </Alert>
  );
};
