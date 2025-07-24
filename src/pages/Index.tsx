import { CostCalculator } from "@/components/CostCalculator";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="container py-12">
        <div className="mb-12 text-center">
          <img 
            src="/lovable-uploads/818d3c15-58b1-498e-a2af-fa2546da9b70.png" 
            alt="Crocodile Logo" 
            className="mx-auto mb-8 h-24 w-24 sm:h-32 sm:w-32"
          />
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Kostenrechner für Fortbildungen
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Berechne dein Einsparpotenzial durch digitale Fortbildungen
          </p>
          <div className="mt-6 mx-auto max-w-2xl text-left bg-[#2a2a2a] p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-3">So nutzt du den Kalkulator:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Gib die Größe deines Teams ein (Gesamtzahl der Mitarbeiter)</li>
              <li>Trage die Anzahl der Zahnärzte in deiner Praxis ein</li>
              <li>Optional für eine noch genauere Berechnung: Gib deine Praxisadresse ein und wähle einen Vorschlag aus der Liste. Die Adressdaten werden nur zur Berechnung verwendet und nicht gespeichert.</li>
              <li>Der Kalkulator berechnet automatisch:
                <ul className="list-disc list-inside ml-6 mt-1 text-gray-500">
                  <li>Deine aktuellen Fortbildungskosten</li>
                  <li>Die Kosten mit Crocodile</li>
                  <li>Dein jährliches Einsparpotenzial</li>
                  <li>Reisekosten zum nächstgelegenen Fortbildungsinstitut</li>
                </ul>
              </li>
              <li>Optional: Gib deine E-Mail-Adresse und Praxisname ein, um eine detaillierte Aufschlüsselung der Zeitersparnis-Analyse per E-Mail zu erhalten. Die E-Mail enthält alle Berechnungsgrundlagen, Stundensätze und Quellen.</li>
            </ol>
          </div>
        </div>
        <CostCalculator />
      </div>
    </div>
  );
};

export default Index;