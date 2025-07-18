
import type { TimeSavings } from '../../types';
import { TIME_SAVINGS_CONSTANTS, DATA_SOURCES } from './timeSavingsConstants';
import {
  DENTIST_HOURLY_RATE,
  ASSISTANT_HOURLY_RATE,
  PREPARATION_TIME,
  ASSISTANTS_PER_CAR
} from './constants';

export interface ExtendedTimeSavings extends TimeSavings {
  practiceImpact: {
    closureHours: number;
    lostRevenue: number;
    reschedulingCosts: number;
    communicationCosts: number;
    permanentLoss: number;
    opportunityCosts: number;
    totalPracticeImpact: number;
  };
  breakdown: {
    traditionalCosts: {
      trainingTime: number;
      travelTime: number;
      preparationTime: number;
      practiceClosureImpact: number;
      organizationalCosts: number;
      totalTraditionalImpact: number;
    };
    crocodileCosts: {
      trainingTime: number;
      travelTime: number;
      preparationTime: number;
      practiceClosureImpact: number;
      organizationalCosts: number;
      totalCrocodileImpact: number;
    };
  };
  sources: typeof DATA_SOURCES;
}

export const calculateExtendedTimeSavings = (
  dentists: number,
  assistants: number,
  travelTimeMinutes: number,
  traditionalDentistCME: any,
  traditionalAssistantCME: any
): ExtendedTimeSavings => {
  const travelTimeHours = travelTimeMinutes / 60;
  
  // Traditionelle Fortbildung - Berechnung pro Session
  const traditionalDentistTimePerSession = 8 + travelTimeHours + PREPARATION_TIME;
  const traditionalAssistantTimePerSession = 8 + travelTimeHours + PREPARATION_TIME;
  
  // Crocodile Online-Fortbildung - Berechnung pro Session  
  const crocodileDentistTimePerSession = 3 + 0 + 0.5; // 3h Training + 0h Reise + 0.5h Prep
  const crocodileAssistantTimePerSession = 3 + 0 + 0.5;
  
  // Gesamte Zeitaufwände pro Jahr
  const traditionalDentistHours = traditionalDentistTimePerSession * traditionalDentistCME.requiredSessions * dentists;
  const traditionalAssistantHours = traditionalAssistantTimePerSession * traditionalAssistantCME.requiredSessions * assistants;
  
  const crocodileDentistHours = crocodileDentistTimePerSession * traditionalDentistCME.requiredSessions * dentists;
  const crocodileAssistantHours = crocodileAssistantTimePerSession * traditionalAssistantCME.requiredSessions * assistants;
  
  // Zeitersparnis berechnen
  const dentistHoursSaved = traditionalDentistHours - crocodileDentistHours;
  const assistantHoursSaved = traditionalAssistantHours - crocodileAssistantHours;
  const totalHoursSaved = dentistHoursSaved + assistantHoursSaved;
  
  // Praxisschließung und deren Auswirkungen
  const totalTraditionalSessions = traditionalDentistCME.requiredSessions * dentists + 
                                   traditionalAssistantCME.requiredSessions * Math.ceil(assistants / ASSISTANTS_PER_CAR);
  
  const practiceClosureHours = totalTraditionalSessions * TIME_SAVINGS_CONSTANTS.PRACTICE_CLOSURE_HOURS.FULL_DAY_TRADITIONAL;
  const affectedPatients = practiceClosureHours * TIME_SAVINGS_CONSTANTS.AVERAGE_PATIENTS_PER_HOUR;
  
  // Umsatzausfälle berechnen
  const lostRevenue = practiceClosureHours * TIME_SAVINGS_CONSTANTS.AVERAGE_PRACTICE_REVENUE_PER_HOUR;
  const permanentLoss = lostRevenue * TIME_SAVINGS_CONSTANTS.PERMANENT_LOSS_RATE;
  const recoverableRevenue = lostRevenue * TIME_SAVINGS_CONSTANTS.PATIENT_RETENTION_RATE;
  
  // Organisationskosten
  const reschedulingCosts = affectedPatients * TIME_SAVINGS_CONSTANTS.RESCHEDULING_COST_PER_APPOINTMENT;
  const communicationCosts = affectedPatients * TIME_SAVINGS_CONSTANTS.COMMUNICATION_COST_PER_PATIENT;
  
  // Opportunitätskosten
  const opportunityCosts = lostRevenue * (TIME_SAVINGS_CONSTANTS.OPPORTUNITY_COST_MULTIPLIER - 1);
  
  const totalPracticeImpact = permanentLoss + reschedulingCosts + communicationCosts + opportunityCosts;
  
  // Monetäre Bewertung der gesparten Zeit
  const dentistMonetaryValue = dentistHoursSaved * DENTIST_HOURLY_RATE;
  const assistantMonetaryValue = assistantHoursSaved * ASSISTANT_HOURLY_RATE;
  const totalMonetaryValue = dentistMonetaryValue + assistantMonetaryValue + totalPracticeImpact;
  
  // Detaillierte Kostenaufschlüsselung
  const traditionalCosts = {
    trainingTime: (traditionalDentistHours * DENTIST_HOURLY_RATE) + (traditionalAssistantHours * ASSISTANT_HOURLY_RATE),
    travelTime: (travelTimeHours * totalTraditionalSessions * DENTIST_HOURLY_RATE),
    preparationTime: (PREPARATION_TIME * totalTraditionalSessions * DENTIST_HOURLY_RATE),
    practiceClosureImpact: lostRevenue,
    organizationalCosts: reschedulingCosts + communicationCosts,
    totalTraditionalImpact: 0 // wird unten berechnet
  };
  traditionalCosts.totalTraditionalImpact = Object.values(traditionalCosts).reduce((sum, cost) => sum + cost, 0) - traditionalCosts.totalTraditionalImpact;
  
  const crocodileCosts = {
    trainingTime: (crocodileDentistHours * DENTIST_HOURLY_RATE) + (crocodileAssistantHours * ASSISTANT_HOURLY_RATE),
    travelTime: 0,
    preparationTime: (0.5 * (traditionalDentistCME.requiredSessions * dentists + traditionalAssistantCME.requiredSessions * assistants) * DENTIST_HOURLY_RATE),
    practiceClosureImpact: 0,
    organizationalCosts: 0,
    totalCrocodileImpact: 0 // wird unten berechnet
  };
  crocodileCosts.totalCrocodileImpact = Object.values(crocodileCosts).reduce((sum, cost) => sum + cost, 0) - crocodileCosts.totalCrocodileImpact;
  
  return {
    totalHoursPerYear: totalHoursSaved,
    totalMonetaryValue,
    dentistHours: dentistHoursSaved,
    assistantHours: assistantHoursSaved,
    travelHours: travelTimeHours * totalTraditionalSessions, // gesparte Reisezeit
    details: {
      perSession: {
        dentist: {
          trainingHours: 8,
          travelHours: travelTimeHours,
          prepHours: PREPARATION_TIME,
          totalHours: traditionalDentistTimePerSession
        },
        assistant: {
          trainingHours: 8,
          travelHours: travelTimeHours,
          prepHours: PREPARATION_TIME,
          totalHours: traditionalAssistantTimePerSession
        }
      },
      monetaryValues: {
        dentist: dentistMonetaryValue,
        assistant: assistantMonetaryValue
      }
    },
    practiceImpact: {
      closureHours: practiceClosureHours,
      lostRevenue,
      reschedulingCosts,
      communicationCosts,
      permanentLoss,
      opportunityCosts,
      totalPracticeImpact
    },
    breakdown: {
      traditionalCosts,
      crocodileCosts
    },
    sources: DATA_SOURCES
  };
};
