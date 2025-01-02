import { TimeSavings } from './types';
import {
  DENTIST_HOURLY_RATE,
  ASSISTANT_HOURLY_RATE,
  PREPARATION_TIME,
  ASSISTANTS_PER_CAR
} from './constants';

export const calculateTimeSavings = (
  dentists: number,
  assistants: number,
  travelTimeMinutes: number,
  traditionalDentistCME: any,
  traditionalAssistantCME: any
): TimeSavings => {
  const travelTimeHours = travelTimeMinutes / 60;
  
  // Berechnung für Zahnärzte (3 Stunden pro Einheit statt 8)
  const dentistTimePerSession = 3 + travelTimeHours + PREPARATION_TIME; // Training + Reise + Vor/Nach
  const totalDentistHours = dentistTimePerSession * traditionalDentistCME.requiredSessions * dentists;
  const dentistMonetaryValue = totalDentistHours * DENTIST_HOURLY_RATE;

  // Berechnung für Assistenzkräfte (3 Stunden pro Einheit statt 8)
  const assistantTimePerSession = 3 + travelTimeHours + PREPARATION_TIME;
  const totalAssistantHours = assistantTimePerSession * traditionalAssistantCME.requiredSessions * assistants;
  const assistantMonetaryValue = totalAssistantHours * ASSISTANT_HOURLY_RATE;

  // Gesamte Reisezeit
  const totalTravelHours = travelTimeHours * 
    (traditionalDentistCME.requiredSessions * dentists + 
     traditionalAssistantCME.requiredSessions * Math.ceil(assistants / ASSISTANTS_PER_CAR));

  return {
    totalHoursPerYear: totalDentistHours + totalAssistantHours,
    totalMonetaryValue: dentistMonetaryValue + assistantMonetaryValue,
    dentistHours: totalDentistHours,
    assistantHours: totalAssistantHours,
    travelHours: totalTravelHours,
    details: {
      perSession: {
        dentist: {
          trainingHours: 3,
          travelHours: travelTimeHours,
          prepHours: PREPARATION_TIME,
          totalHours: dentistTimePerSession
        },
        assistant: {
          trainingHours: 3,
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