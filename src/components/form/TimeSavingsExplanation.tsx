
import { TimeSavings } from "@/types";

interface TimeSavingsExplanationProps {
  timeSavings: TimeSavings;
}

export const formatTimeSavingsExplanation = ({ timeSavings }: TimeSavingsExplanationProps): string => {
  return `
    DETAILLIERTE ZEITERSPARNIS-ANALYSE FÜR IHRE PRAXIS
    
    Berechnungsgrundlagen (basierend auf Branchendaten 2024/2025):
    
    CME-PFLICHT NACH § 95d SGB V:
    - Vertragszahnärzte: 125 CME-Punkte in 5 Jahren (= 25 Punkte/Jahr)
    - Durchschnittlich 5 Fortbildungsveranstaltungen pro Jahr
    - Maximum 8 CME-Punkte pro Tag anrechenbar
    
    STUNDENSÄTZE UND GRUNDLAGEN:
    - Zahnarzt (angestellt): 65€/h brutto + 40% Praxisnebenkosten = 91€/h Gesamtkosten
    - ZFA: 16€/h brutto + 40% Praxisnebenkosten = 22,40€/h Gesamtkosten
    - Praxisumsatz: 250€/h (Quelle: ZWP-Online Praxismanagement-Studie 2023)
    - Praxisausfall-Faktor: 60% (berücksichtigt 50% Wochenendfortbildungen)
    
    FORTBILDUNGSAUFWAND PRO TRADITIONELLER VERANSTALTUNG:
    - Zahnärzte: ${timeSavings.details.perSession.dentist.totalHours.toFixed(1)} Stunden
      → ${timeSavings.details.perSession.dentist.trainingHours}h Fortbildung
      → ${timeSavings.details.perSession.dentist.travelHours.toFixed(1)}h Reisezeit (Hin- und Rückfahrt)
      → ${timeSavings.details.perSession.dentist.prepHours}h Vor-/Nachbereitung
    
    - ZFA/Assistenzkräfte: ${timeSavings.details.perSession.assistant.totalHours.toFixed(1)} Stunden
      → ${timeSavings.details.perSession.assistant.trainingHours}h Fortbildung
      → ${timeSavings.details.perSession.assistant.travelHours.toFixed(1)}h Reisezeit (oft Fahrgemeinschaften)
      → ${timeSavings.details.perSession.assistant.prepHours}h Vor-/Nachbereitung

    JÄHRLICHE GESAMTERSPARNIS:
    - Zahnärzte: ${Math.round(timeSavings.dentistHours)} Stunden (Kostenwert: ${Math.round(timeSavings.details.monetaryValues.dentist)}€)
    - ZFA/Assistenzkräfte: ${Math.round(timeSavings.assistantHours)} Stunden (Kostenwert: ${Math.round(timeSavings.details.monetaryValues.assistant)}€)
    - Gesparte Reisezeit gesamt: ${Math.round(timeSavings.travelHours)} Stunden
    
    MONETÄRER GESAMTWERT: ${Math.round(timeSavings.totalMonetaryValue)}€ pro Jahr
    
    DATENQUELLEN:
    - § 95d SGB V - CME-Pflicht: https://www.zm-online.de/cme/cme-uebersicht
    - KZV Fortbildungspflicht: https://www.kzvlb.de/berufsausuebung/fortbildungspflicht
    - VMF Tarifvertrag ZFA 2025: https://www.vmf-online.de/zfa/zfa-tarife
    - ZWP-Online Praxismanagement: https://www.zwp-online.info/zwpnews/wirtschaft-und-recht/praxismanagement/stundensatze-in-der-zahnarztpraxis
    - ZFA Gehaltsdaten 2025: https://www.zfa-mal-anders.de/karriere/zfa/gehalt
    - BZÄK Daten und Zahlen: https://www.bzaek.de/ueber-uns/daten-und-zahlen/nachgezaehlt.html
    
    BERECHNUNGSHINWEISE:
    Diese Analyse basiert auf der gesetzlichen CME-Pflicht von 125 Punkten in 5 Jahren (§ 95d SGB V).
    Verwendet werden konservative, branchenübliche Werte und realistische Faktoren wie:
    - 50% Wochenendfortbildungen (kein Praxisausfall)
    - Fahrgemeinschaften bei ZFA
    - Realistische CME-Verteilung: 25 Punkte/Jahr = ca. 5 Veranstaltungen
    - Praxisnebenkosten und Opportunitätskosten
    
    Alle Berechnungen basieren auf aktuellen Tarifverträgen und der gesetzlichen Fortbildungspflicht 2024/2025.
  `;
};
