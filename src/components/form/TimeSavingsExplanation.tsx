import { TimeSavings } from "@/types";

interface TimeSavingsExplanationProps {
  timeSavings: TimeSavings;
}

export const formatTimeSavingsExplanation = ({ timeSavings }: TimeSavingsExplanationProps): string => {
  return `
    Zeitersparnis-Analyse für Ihre Praxis:

    Pro Fortbildungseinheit:
    - Zahnärzte: ${timeSavings.details.perSession.dentist.totalHours.toFixed(1)} Stunden 
      (${timeSavings.details.perSession.dentist.trainingHours}h Fortbildung + 
      ${timeSavings.details.perSession.dentist.travelHours.toFixed(1)}h Reisezeit + 
      ${timeSavings.details.perSession.dentist.prepHours}h Vor-/Nachbereitung)
    
    - Assistenzkräfte: ${timeSavings.details.perSession.assistant.totalHours.toFixed(1)} Stunden
      (${timeSavings.details.perSession.assistant.trainingHours}h Fortbildung + 
      ${timeSavings.details.perSession.assistant.travelHours.toFixed(1)}h Reisezeit + 
      ${timeSavings.details.perSession.assistant.prepHours}h Vor-/Nachbereitung)

    Jährliche Gesamtersparnis:
    - Zahnärzte: ${Math.round(timeSavings.dentistHours)} Stunden (Wert: ${Math.round(timeSavings.details.monetaryValues.dentist)}€)
    - Assistenzkräfte: ${Math.round(timeSavings.assistantHours)} Stunden (Wert: ${Math.round(timeSavings.details.monetaryValues.assistant)}€)
    - Gesamte Reisezeit: ${Math.round(timeSavings.travelHours)} Stunden
    
    Monetärer Gesamtwert der Zeitersparnis: ${Math.round(timeSavings.totalMonetaryValue)}€ pro Jahr
  `;
};