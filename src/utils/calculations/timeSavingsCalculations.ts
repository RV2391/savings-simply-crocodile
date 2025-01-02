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
  
  // Berechnung für Zahnärzte
  const dentistTimePerSession = 8 + travelTimeHours + PREPARATION_TIME;
  const totalDentistHours = dentistTimePerSession * traditionalDentistCME.requiredSessions * dentists;
  const dentistMonetaryValue = totalDentistHours * DENTIST_HOURLY_RATE;

  // Berechnung für Assistenzkräfte
  const assistantTimePerSession = 8 + travelTimeHours + PREPARATION_TIME;
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
    travelHours: totalTravelHours
  };
};