
import { TimeSavings } from "@/types";

interface TimeSavingsExplanationProps {
  timeSavings: TimeSavings;
}

export const formatTimeSavingsExplanation = ({ timeSavings }: TimeSavingsExplanationProps): string => {
  return `
    DETAILLIERTE ZEITERSPARNIS-ANALYSE FÜR DEINE PRAXIS
    
    Berechnungsgrundlagen (konservative Schätzung basierend auf aktueller Rechtslage 2025):
    
    GESETZLICHE FORTBILDUNGSPFLICHT NACH § 95d SGB V:
    - NUR ZAHNÄRZTE haben gesetzliche CME-Pflicht: 25 Punkte/Jahr (125 in 5 Jahren)
    - ZFA haben KEINE gesetzliche Fortbildungspflicht
    - ZFA-Fortbildung ist freiwillig (ca. 30% Teilnahmequote)
    - Durchschnittlich 5 Präsenzveranstaltungen pro Jahr für Zahnärzte
    
    KONSERVATIVE OPPORTUNITÄTSKOSTEN:
    - Zahnarzt: 80€/Stunde (deutlich unter Marktpreis für konservative Schätzung)
    - ZFA: 20€/Stunde (nur bei freiwilliger Teilnahme)
    - Keine Umsatzverluste berücksichtigt, nur direkte Personalkosten
    - Berücksichtigung von Vertretungsmöglichkeiten je nach Praxisgröße
    
    DEGRESSIVE PRAXISAUSFALL-FAKTOREN:
    - Kleine Praxis (bis 4 MA): 85% Ausfallwahrscheinlichkeit
    - Mittlere Praxis (5-10 MA): 65% Ausfallwahrscheinlichkeit  
    - Große Praxis (10+ MA): 45% Ausfallwahrscheinlichkeit
    - Berücksichtigt bessere Vertretungsmöglichkeiten bei größeren Teams
    
    FORTBILDUNGSAUFWAND PRO TRADITIONELLER VERANSTALTUNG:
    - Zahnärzte: ${timeSavings.details.perSession.dentist.totalHours.toFixed(1)} Stunden
      → ${timeSavings.details.perSession.dentist.trainingHours}h Fortbildung
      → ${timeSavings.details.perSession.dentist.travelHours.toFixed(1)}h Reisezeit (Hin- und Rückfahrt)
      → ${timeSavings.details.perSession.dentist.prepHours}h Vor-/Nachbereitung
    
    ${timeSavings.details.perSession.assistant.isVoluntary ? `- ZFA (FREIWILLIG, ${Math.round(timeSavings.details.perSession.assistant.participationRate * 100)}% Teilnahme): ${timeSavings.details.perSession.assistant.totalHours.toFixed(1)} Stunden
      → ${timeSavings.details.perSession.assistant.trainingHours}h Fortbildung
      → ${timeSavings.details.perSession.assistant.travelHours.toFixed(1)}h Reisezeit (oft Fahrgemeinschaften)
      → ${timeSavings.details.perSession.assistant.prepHours}h Vor-/Nachbereitung` : ''}

    JÄHRLICHE GESAMTERSPARNIS (KONSERVATIVE BERECHNUNG):
    - Zahnärzte: ${Math.round(timeSavings.dentistHours)} Stunden (Opportunitätskosten: ${Math.round(timeSavings.details.monetaryValues.dentist)}€)
    ${timeSavings.assistantHours > 0 ? `- ZFA (freiwillig): ${Math.round(timeSavings.assistantHours)} Stunden (Opportunitätskosten: ${Math.round(timeSavings.details.monetaryValues.assistant)}€)` : ''}
    - Gesparte Reisezeit gesamt: ${Math.round(timeSavings.travelHours)} Stunden
    
    MONETÄRER GESAMTWERT: ${Math.round(timeSavings.totalMonetaryValue)}€ pro Jahr
    
    WICHTIGE HINWEISE:
    - Diese Berechnung verwendet bewusst KONSERVATIVE Werte
    - Tatsächliche Einsparungen können je nach Praxisorganisation höher sein
    - ZFA-Fortbildung ist gesetzlich NICHT verpflichtend
    - Praxisausfall-Faktoren berücksichtigen realistische Vertretungsmöglichkeiten
    - Nur direkte Opportunitätskosten, keine Umsatzverluste eingerechnet
    
    DATENQUELLEN:
    - § 95d SGB V - CME-Pflicht: https://www.zm-online.de/cme/cme-uebersicht
    - KZV Fortbildungspflicht: https://www.kzvlb.de/berufsausuebung/fortbildungspflicht
    - VMF Tarifvertrag ZFA 2025: https://www.vmf-online.de/zfa/zfa-tarife
    - ZWP-Online Praxismanagement: https://www.zwp-online.info/zwpnews/wirtschaft-und-recht/praxismanagement
    - BZÄK Daten und Zahlen: https://www.bzaek.de/ueber-uns/daten-und-zahlen/nachgezaehlt.html
    
    BERECHNUNGSHINWEISE:
    Diese Analyse basiert ausschließlich auf der gesetzlichen CME-Pflicht für Zahnärzte.
    Verwendet werden konservative, branchenübliche Werte und realistische Faktoren:
    - Degressive Skalierung nach Praxisgröße
    - Berücksichtigung von Vertretungsmöglichkeiten
    - Nur bei ZFA: Freiwillige Teilnahme ohne gesetzliche Verpflichtung
    - Konservative Opportunitätskosten ohne Umsatzverluste
    
    Alle Berechnungen folgen der aktuellen Rechtslage und verwenden konservative Marktdaten 2025.
  `;
};
