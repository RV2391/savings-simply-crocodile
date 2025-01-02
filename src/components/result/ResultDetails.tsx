import { formatCurrency } from "@/utils/calculations";
import type { NearestInstitute } from "@/utils/calculations";

interface ResultDetailsProps {
  traditionalCostsDentists: number;
  traditionalCostsAssistants: number;
  nearestInstitute?: NearestInstitute;
}

export const ResultDetails = ({
  traditionalCostsDentists,
  traditionalCostsAssistants,
  nearestInstitute
}: ResultDetailsProps) => {
  return (
    <>
      <div className="mt-6 space-y-2">
        <div className="text-xs text-gray-500">Aufschlüsselung bisheriger geschätzter Kosten:</div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Zahnärzte</span>
          <span className="font-medium text-white">
            {formatCurrency(traditionalCostsDentists)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Assistenzkräfte</span>
          <span className="font-medium text-white">
            {formatCurrency(traditionalCostsAssistants)}
          </span>
        </div>
        {nearestInstitute && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Reisekosten (0,30€/km)*</span>
              <span className="font-medium text-white">
                {formatCurrency(nearestInstitute.travelCosts)}
              </span>
            </div>
            <div className="text-xs text-gray-500 text-right">
              ({Math.round(nearestInstitute.distance)}km × 0,30€ × {traditionalCostsDentists / 1200} Zahnärzte + 
              {Math.round(nearestInstitute.distance)}km × 0,30€ × {Math.ceil((traditionalCostsAssistants / 280) / 5)} Fahrgemeinschaften)
            </div>
          </div>
        )}
      </div>

      {nearestInstitute && (
        <div className="mt-6 space-y-2 border-t border-gray-700 pt-4">
          <div className="text-xs text-gray-500">Nächstgelegenes Fortbildungsinstitut:</div>
          <div className="space-y-2 text-sm">
            <div className="font-medium text-white">{nearestInstitute.name}</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Entfernung (einfach)</span>
                <span className="font-medium text-white">{Math.round(nearestInstitute.oneWayDistance)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Entfernung (Hin- und Rückfahrt)</span>
                <span className="font-medium text-white">{Math.round(nearestInstitute.distance)} km</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Fahrzeit (einfach)</span>
                <span className="font-medium text-white">{Math.round(nearestInstitute.oneWayTravelTime)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fahrzeit (Hin- und Rückfahrt)</span>
                <span className="font-medium text-white">{Math.round(nearestInstitute.travelTime)} min</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
            <h4 className="text-sm font-medium text-primary mb-2">CME-Punkte Übersicht</h4>
            <p className="text-xs text-gray-400 mb-3">
              Zahnärzte müssen 125 CME-Punkte in 5 Jahren sammeln (∅ 25 Punkte/Jahr)
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Traditionelle Fortbildung</span>
                <span className="text-white">8 Punkte pro Tag</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Mit Crocodile</span>
                <span className="text-white">1-3 Punkte pro Einheit</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400 mb-2">
              Erhalten Sie Ihre persönliche 5-Jahres-CME-Strategie
            </p>
            <p className="text-xs text-gray-500">
              Inkl. Planung, Zeitmanagement und Kostenoptimierung
            </p>
          </div>
        </div>
      )}
    </>
  );
};