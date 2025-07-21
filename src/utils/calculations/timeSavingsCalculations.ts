
import type { TimeSavings } from '../../types';
import { calculateExtendedTimeSavings, type ExtendedTimeSavings } from './extendedTimeSavingsCalculations';
import {
  DENTIST_HOURLY_RATE,
  ASSISTANT_HOURLY_RATE,
  PREPARATION_TIME,
  ASSISTANTS_PER_CAR
} from './constants';
import { TIME_SAVINGS_CONSTANTS } from './timeSavingsConstants';

export const calculateTimeSavings = (
  dentists: number,
  assistants: number,
  travelTimeMinutes: number,
  traditionalDentistCME: any,
  traditionalAssistantCME: any
): TimeSavings => {
  const travelTimeHours = travelTimeMinutes / 60;
  
  // Realistische Berechnung für Zahnärzte (5 Stunden pro Einheit statt 8)
  const dentistTimePerSession = TIME_SAVINGS_CONSTANTS.CME_REQUIREMENTS.AVERAGE_SESSION_DURATION_HOURS + travelTimeHours + PREPARATION_TIME;
  const totalDentistHours = dentistTimePerSession * traditionalDentistCME.requiredSessions * dentists;
  
  // Berücksichtigung des Praxisausfall-Faktors (60% führen zu echtem Ausfall)
  const adjustedDentistHours = totalDentistHours * TIME_SAVINGS_CONSTANTS.PRACTICE_IMPACT_FACTOR;
  const dentistMonetaryValue = adjustedDentistHours * DENTIST_HOURLY_RATE;

  // Realistische Berechnung für Assistenzkräfte (5 Stunden pro Einheit statt 8)
  const assistantTimePerSession = TIME_SAVINGS_CONSTANTS.CME_REQUIREMENTS.AVERAGE_SESSION_DURATION_HOURS + travelTimeHours + PREPARATION_TIME;
  const totalAssistantHours = assistantTimePerSession * traditionalAssistantCME.requiredSessions * assistants;
  
  // Berücksichtigung des Praxisausfall-Faktors
  const adjustedAssistantHours = totalAssistantHours * TIME_SAVINGS_CONSTANTS.PRACTICE_IMPACT_FACTOR;
  const assistantMonetaryValue = adjustedAssistantHours * ASSISTANT_HOURLY_RATE;

  // Gesamte Reisezeit (konservativ berechnet)
  const totalTravelHours = travelTimeHours * 
    (traditionalDentistCME.requiredSessions * dentists + 
     traditionalAssistantCME.requiredSessions * Math.ceil(assistants / ASSISTANTS_PER_CAR)) *
    TIME_SAVINGS_CONSTANTS.PRACTICE_IMPACT_FACTOR; // Nur 60% führen zu echten Reisekosten

  return {
    totalHoursPerYear: adjustedDentistHours + adjustedAssistantHours,
    totalMonetaryValue: dentistMonetaryValue + assistantMonetaryValue,
    dentistHours: adjustedDentistHours,
    assistantHours: adjustedAssistantHours,
    travelHours: totalTravelHours,
    details: {
      perSession: {
        dentist: {
          trainingHours: TIME_SAVINGS_CONSTANTS.CME_REQUIREMENTS.AVERAGE_SESSION_DURATION_HOURS,
          travelHours: travelTimeHours,
          prepHours: PREPARATION_TIME,
          totalHours: dentistTimePerSession
        },
        assistant: {
          trainingHours: TIME_SAVINGS_CONSTANTS.CME_REQUIREMENTS.AVERAGE_SESSION_DURATION_HOURS,
          travelHours: travelTimeHours,
          prepHours: PREPARATION_TIME,
          totalHours: assistantTimePerSession
        }
      },
      monetaryValues: {
        dentist: dentistMonetaryValue,
        assistant: assistantMonetaryValue
      }
    }
  };
};

// Export the extended calculation function
export { calculateExtendedTimeSavings, type ExtendedTimeSavings };
