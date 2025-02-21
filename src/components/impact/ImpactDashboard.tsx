
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImpactCard } from "./ImpactCard";
import { ImpactMetrics } from "@/types/impact";
import { formatMinutesToHours } from "@/utils/timeFormat";

interface ImpactDashboardProps {
  metrics: ImpactMetrics;
}

export const ImpactDashboard = ({ metrics }: ImpactDashboardProps) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Impact Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ImpactCard
          title="Einsparungen (letzte 30 Tage)"
          value={metrics.savings.last30Days}
          subValue={metrics.savings.total}
          description="Gesamte Kosteneinsparungen durch Crocodile"
          trend={10}
          isCurrency={true}
        />

        <ImpactCard
          title="Fortbildungen abgeschlossen"
          value={metrics.completedCourses.last30Days}
          subValue={metrics.completedCourses.total}
          description="Anzahl der erfolgreich abgeschlossenen Fortbildungen"
          trend={5}
        />

        <ImpactCard
          title="Lernzeit (letzte 30 Tage)"
          value={formatMinutesToHours(metrics.watchTime.last30Days)}
          subValue={formatMinutesToHours(metrics.watchTime.total)}
          description="Gesamte investierte Lernzeit"
          trend={8}
        />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Tipps zur Nutzungsoptimierung</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2">Fortbildungsplanung optimieren</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Erstellen Sie einen monatlichen Fortbildungsplan</li>
                <li>Nutzen Sie die Teamkalender-Funktion</li>
                <li>Setzen Sie realistische Ziele pro Mitarbeiter</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-2">Engagement steigern</h4>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Richten Sie regelmäßige Team-Meetings ein</li>
                <li>Feiern Sie Fortbildungserfolge</li>
                <li>Nutzen Sie die Zertifikate-Funktion</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
