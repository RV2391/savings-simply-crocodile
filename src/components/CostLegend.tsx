import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export const CostLegend = () => {
  return (
    <Alert className="mt-6 bg-[#1a1a1a] text-white border-gray-700">
      <InfoIcon className="h-4 w-4 text-primary" />
      <AlertDescription className="text-left text-sm">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-primary">Zahnärzte/innen: 1.200 € pro Jahr*</h4>
            <p className="mt-1 text-gray-400">
              Diese konservative Schätzung basiert auf den gesetzlichen Anforderungen von 125 Fortbildungspunkten in 5 Jahren 
              (durchschnittlich 25 Punkte pro Jahr) und beinhaltet Kosten für Selbststudium, Präsenzveranstaltungen, 
              Online-Fortbildungen und Fachmitgliedschaften.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-primary">Assistenzkräfte: 280 € pro Jahr*</h4>
            <p className="mt-1 text-gray-400">
              Diese Schätzung berücksichtigt den geringeren Umfang der Fortbildungspflicht und umfasst 1-2 
              Tagesfortbildungen oder Online-Kurse pro Jahr sowie Fachliteratur.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            * Diese Schätzungen dienen als Ausgangspunkt. Tatsächliche Kosten können je nach individuellen 
            Bedürfnissen, Praxisschwerpunkten und gewählten Fortbildungsformaten variieren.
          </p>

          <div className="space-y-2 border-t border-gray-700 pt-4">
            <p className="text-xs text-gray-500">Quellen:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>
                <a href="https://www.dentalxr.ai/blog/2022/fortbildungspunkte-zahnarzt/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  DentalXR.ai - Fortbildungspunkte für Zahnärzte
                </a>
              </li>
              <li>
                <a href="https://www.kzbv.de/vertragszahnarztliche-fortbildung.440.de.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  KZBV - Vertragszahnärztliche Fortbildung
                </a>
              </li>
              <li>
                <a href="https://www.zukunftzahn.de/fortbildung-zahngesundheit/fortbildungen-fuer-zahnaerzte/" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  ZukunftZahn - Fortbildungen für Zahnärzte
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
    </Alert>
  );
};