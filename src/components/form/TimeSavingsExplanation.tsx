
import { TimeSavings } from "@/types";

interface TimeSavingsExplanationProps {
  timeSavings: TimeSavings;
}

export const formatTimeSavingsExplanation = ({ timeSavings }: TimeSavingsExplanationProps): string => {
  return `
    Konservative Zeitersparnis-Analyse für Ihre Praxis:

    Berechnungsgrundlage (realistische Annahmen):
    - Durchschnittliche Präsenzfortbildung: 5 Stunden (statt 8h Ganztag)
    - Praxisausfall-Faktor: 60% (viele Fortbildungen finden am Wochenende statt)
    - CME-Punkte pro Session: ~5 Punkte (realistischer Durchschnitt)

    Pro traditioneller Fortbildungseinheit:
    - Zahnärzte: ${timeSavings.details.perSession.dentist.totalHours.toFixed(1)} Stunden 
      (${timeSavings.details.perSession.dentist.trainingHours}h Fortbildung + 
      ${timeSavings.details.perSession.dentist.travelHours.toFixed(1)}h Reisezeit + 
      ${timeSavings.details.perSession.dentist.prepHours}h Vor-/Nachbereitung)
    
    - Assistenzkräfte: ${timeSavings.details.perSession.assistant.totalHours.toFixed(1)} Stunden
      (${timeSavings.details.perSession.assistant.trainingHours}h Fortbildung + 
      ${timeSavings.details.perSession.assistant.travelHours.toFixed(1)}h Reisezeit + 
      ${timeSavings.details.perSession.assistant.prepHours}h Vor-/Nachbereitung)

    Jährliche Gesamtersparnis (konservativ berechnet):
    - Zahnärzte: ${Math.round(timeSavings.dentistHours)} Stunden (Wert: ${Math.round(timeSavings.details.monetaryValues.dentist)}€)
    - Assistenzkräfte: ${Math.round(timeSavings.assistantHours)} Stunden (Wert: ${Math.round(timeSavings.details.monetaryValues.assistant)}€)
    - Gesamte Reisezeit: ${Math.round(timeSavings.travelHours)} Stunden
    
    Monetärer Gesamtwert der Zeitersparnis: ${Math.round(timeSavings.totalMonetaryValue)}€ pro Jahr

    Hinweis: Diese Berechnung verwendet konservative Annahmen und berücksichtigt, dass nicht jede 
    Fortbildung zu einem vollständigen Praxisausfall führt (Wochenend-/Abendveranstaltungen).
  `;
};
