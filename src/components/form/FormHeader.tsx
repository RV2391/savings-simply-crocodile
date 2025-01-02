export const FormHeader = () => {
  return (
    <div className="space-y-4 mb-8">
      <h3 className="text-2xl font-semibold text-white">
        Erhalten Sie Ihre persönliche Berechnung per E-Mail
      </h3>
      <p className="text-lg text-muted-foreground">
        Wir senden Ihnen die detaillierte Auswertung kostenlos zu.
      </p>
      <ul className="list-disc pl-6 space-y-2 text-sm text-gray-400">
        <li>Detaillierte Zeitersparnis-Analyse für Ihre Praxis</li>
        <li>Personalisierte 5-Jahres-CME-Strategie</li>
        <li>Konkrete Optimierungsvorschläge für Ihr Team</li>
        <li>Individuelle Handlungsempfehlungen</li>
      </ul>
    </div>
  );
};