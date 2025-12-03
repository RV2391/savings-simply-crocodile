import { CostCalculator } from "@/components/CostCalculator";
import { GTMDebugger } from "@/components/GTMDebugger";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="mb-12 text-center">
          <h1 className="font-montserrat text-4xl font-bold text-foreground sm:text-5xl">
            <span className="text-primary">Kurs</span>Radar Kostenrechner
          </h1>
          <p className="mt-4 text-lg text-muted-foreground font-roboto">
            Berechne dein Einsparpotenzial durch optimierte Fortbildungsplanung
          </p>
          <div className="mt-6 mx-auto max-w-2xl text-left bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="font-montserrat text-xl font-semibold text-card-foreground mb-3">So nutzt du den Kalkulator:</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground font-roboto">
              <li>Gib die Größe deines Teams ein (Gesamtzahl der Mitarbeiter)</li>
              <li>Trage die Anzahl der Zahnärzte in deiner Praxis ein</li>
              <li>Optional: Gib deine Praxisadresse ein für eine genauere Berechnung der Reisekosten</li>
              <li>Der Kalkulator berechnet automatisch:
                <ul className="list-disc list-inside ml-6 mt-1 text-muted-foreground/80">
                  <li>Deine aktuellen Fortbildungskosten</li>
                  <li>Optimierte Kosten mit KursRadar</li>
                  <li>Dein jährliches Einsparpotenzial</li>
                  <li>Eingesparte Zeit durch weniger Recherche</li>
                </ul>
              </li>
              <li>Optional: Fordere eine detaillierte Analyse per E-Mail an</li>
            </ol>
          </div>
        </div>
        <CostCalculator />
      </div>
      <GTMDebugger />
    </div>
  );
};

export default Index;
