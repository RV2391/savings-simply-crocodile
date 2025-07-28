
import type { TimeSavings } from '../../types';
import { calculateExtendedTimeSavings, type ExtendedTimeSavings } from './extendedTimeSavingsCalculations';
import {
  DENTIST_HOURLY_RATE,
  ASSISTANT_HOURLY_RATE,
  PREPARATION_TIME,
  ASSISTANTS_PER_CAR
} from './constants';
import { TIME_SAVINGS_CONSTANTS } from './timeSavingsConstants';
import { calculatePracticeImpactFactor, calculateZFATrainingRequirements } from './practiceImpactCalculations';

export const calculateTimeSavings = (
  dentists: number,
  assistants: number,
  travelTimeMinutes: number,
  traditionalDentistCME: any,
  traditionalAssistantCME: any
): TimeSavings => {
  const travelTimeHours = travelTimeMinutes / 60;
  const totalTeamSize = dentists + assistants;
  
  // Degressive Skalierung: größere Praxen haben bessere Vertretungsmöglichkeiten
  const practiceImpactFactor = calculatePracticeImpactFactor(totalTeamSize);
  
  // Realistische Berechnung für Zahnärzte (gesetzliche CME-Pflicht)
  const dentistTimePerSession = TIME_SAVINGS_CONSTANTS.CME_REQUIREMENTS.AVERAGE_SESSION_DURATION_HOURS + travelTimeHours + PREPARATION_TIME;
  const totalDentistHours = dentistTimePerSession * traditionalDentistCME.requiredSessions * dentists;
  
  // Angepasster Praxisausfall-Faktor basierend auf Teamgröße
  const adjustedDentistHours = totalDentistHours * practiceImpactFactor;
  const dentistMonetaryValue = adjustedDentistHours * DENTIST_HOURLY_RATE;

  // ZFA haben KEINE gesetzliche CME-Pflicht - nur freiwillige Fortbildung
  const zfaTraining = calculateZFATrainingRequirements(assistants);
  const averageSessionDurationForZFA = TIME_SAVINGS_CONSTANTS.CME_REQUIREMENTS.AVERAGE_SESSION_DURATION_HOURS;
  const totalZFAVoluntaryHours = zfaTraining.totalVoluntaryHours + (zfaTraining.participatingAssistants * travelTimeHours);
  
  // Deutlich reduzierte Berechnung für freiwillige ZFA-Fortbildung
  const adjustedAssistantHours = totalZFAVoluntaryHours * practiceImpactFactor;
  const assistantMonetaryValue = adjustedAssistantHours * ASSISTANT_HOURLY_RATE;

  // Gesamte Reisezeit (nur für tatsächlich verpflichtete Fortbildungen)
  const totalTravelHours = travelTimeHours * 
    (traditionalDentistCME.requiredSessions * dentists + 
     Math.ceil(zfaTraining.participatingAssistants / ASSISTANTS_PER_CAR)) *
    practiceImpactFactor;

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
          trainingHours: averageSessionDurationForZFA,
          travelHours: travelTimeHours,
          prepHours: PREPARATION_TIME,
          totalHours: averageSessionDurationForZFA + travelTimeHours + PREPARATION_TIME,
          isVoluntary: true,
          participationRate: TIME_SAVINGS_CONSTANTS.ZFA_VOLUNTARY_TRAINING.PARTICIPATION_RATE
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
