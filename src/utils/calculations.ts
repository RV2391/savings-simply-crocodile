
import { calculateNearestInstitute } from './dentalInstitutes';
import { 
  calculateAnnualCMERequirements, 
  TYPICAL_TRADITIONAL_UNIT, 
  TYPICAL_CROCODILE_UNIT 
} from './cmeCalculations';
import { calculateDistanceViaBackend, calculateTravelTimeViaBackend } from './backendDistanceCalculations';

export interface NearestInstitute {
  name: string;
  distance: number;
  oneWayDistance: number;
  travelTime: number;
  oneWayTravelTime: number;
  travelCosts: number;
}

export interface CalculationInputs {
  teamSize: number;
  dentists: number;
  practiceLat?: number;
  practiceLng?: number;
  nearestInstituteLat?: number;
  nearestInstituteLng?: number;
}

export interface TimeSavings {
  totalHoursPerYear: number;
  totalMonetaryValue: number;
  dentistHours: number;
  assistantHours: number;
  travelHours: number;
}

export interface CalculationResults {
  traditionalCostsDentists: number;
  traditionalCostsAssistants: number;
  totalTraditionalCosts: number;
  crocodileCosts: number;
  savings: number;
  savingsPercentage: number;
  timeSavings?: TimeSavings;
  nearestInstitute?: NearestInstitute;
  cmeRequirements?: {
    traditional: {
      dentist: {
        totalPoints: number;
        totalHours: number;
        requiredSessions: number;
      };
      assistant: {
        totalPoints: number;
        totalHours: number;
        requiredSessions: number;
      };
    };
  };
}

const DENTIST_ANNUAL_COST = 1200;
const ASSISTANT_ANNUAL_COST = 280;
const BASE_USERS_INCLUDED = 20;
const ADDITIONAL_USER_BLOCK_SIZE = 10;
const COST_PER_ADDITIONAL_BLOCK_MONTHLY = 50;
const BASE_PRICE = 1699;
const COST_PER_KM = 0.30;
const ASSISTANTS_PER_CAR = 5;
const MONTHS_PER_YEAR = 12;
const DENTIST_HOURLY_RATE = 150;
const ASSISTANT_HOURLY_RATE = 35;
const PREPARATION_TIME = 1;

export const calculateCrocodileCosts = (teamSize: number): number => {
  if (teamSize <= BASE_USERS_INCLUDED) {
    return BASE_PRICE;
  }
  
  const additionalUsers = teamSize - BASE_USERS_INCLUDED;
  const additionalBlocks = Math.ceil(additionalUsers / ADDITIONAL_USER_BLOCK_SIZE);
  const annualAdditionalCosts = additionalBlocks * COST_PER_ADDITIONAL_BLOCK_MONTHLY * MONTHS_PER_YEAR;
  return BASE_PRICE + annualAdditionalCosts;
};

const calculateTravelCosts = (distance: number, dentists: number, assistants: number): number => {
  const dentistsCosts = distance * COST_PER_KM * dentists;
  const assistantGroups = Math.ceil(assistants / ASSISTANTS_PER_CAR);
  const assistantsCosts = distance * COST_PER_KM * assistantGroups;
  
  return Math.round(dentistsCosts + assistantsCosts);
};

const calculateTimeSavings = (
  dentists: number,
  assistants: number,
  travelTimeMinutes: number,
  traditionalDentistCME: any,
  traditionalAssistantCME: any
): TimeSavings => {
  const travelTimeHours = travelTimeMinutes / 60;
  
  const dentistTimePerSession = 8 + travelTimeHours + PREPARATION_TIME;
  const totalDentistHours = dentistTimePerSession * traditionalDentistCME.requiredSessions * dentists;
  const dentistMonetaryValue = totalDentistHours * DENTIST_HOURLY_RATE;

  const assistantTimePerSession = 8 + travelTimeHours + PREPARATION_TIME;
  const totalAssistantHours = assistantTimePerSession * traditionalAssistantCME.requiredSessions * assistants;
  const assistantMonetaryValue = totalAssistantHours * ASSISTANT_HOURLY_RATE;

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

export const calculateResults = async (inputs: CalculationInputs): Promise<CalculationResults> => {
  const assistants = inputs.teamSize - inputs.dentists;
  
  const traditionalDentistCME = calculateAnnualCMERequirements(
    true, 
    TYPICAL_TRADITIONAL_UNIT.duration,
    TYPICAL_TRADITIONAL_UNIT.hasExercises,
    TYPICAL_TRADITIONAL_UNIT.hasTest
  );
  
  const traditionalAssistantCME = calculateAnnualCMERequirements(
    false,
    TYPICAL_TRADITIONAL_UNIT.duration,
    TYPICAL_TRADITIONAL_UNIT.hasExercises,
    TYPICAL_TRADITIONAL_UNIT.hasTest
  );

  const traditionalCostsDentists = inputs.dentists * DENTIST_ANNUAL_COST;
  const traditionalCostsAssistants = assistants * ASSISTANT_ANNUAL_COST;

  let nearestInstitute;
  let timeSavings;

  if (inputs.practiceLat && inputs.practiceLng) {
    const nearest = await calculateNearestInstitute(inputs.practiceLat, inputs.practiceLng);
    
    try {
      const oneWayDistance = await calculateDistanceViaBackend(
        inputs.practiceLat, 
        inputs.practiceLng,
        nearest.coordinates.lat, 
        nearest.coordinates.lng
      );
      
      const oneWayTime = await calculateTravelTimeViaBackend(
        inputs.practiceLat, 
        inputs.practiceLng,
        nearest.coordinates.lat, 
        nearest.coordinates.lng
      );

      const roundTripDistance = oneWayDistance * 2;
      const roundTripTime = oneWayTime * 2;

      const dentistTrips = traditionalDentistCME.requiredSessions;
      const assistantGroups = Math.ceil(assistants / ASSISTANTS_PER_CAR);
      const assistantTrips = traditionalAssistantCME.requiredSessions * assistantGroups;
      
      const travelCosts = calculateTravelCosts(roundTripDistance, dentistTrips, assistantTrips);

      nearestInstitute = {
        name: nearest.name,
        oneWayDistance: oneWayDistance,
        distance: roundTripDistance,
        oneWayTravelTime: oneWayTime,
        travelTime: roundTripTime,
        travelCosts: Math.round(travelCosts)
      };

      timeSavings = calculateTimeSavings(
        inputs.dentists,
        assistants,
        roundTripTime,
        traditionalDentistCME,
        traditionalAssistantCME
      );
    } catch (error) {
      console.error('Error calculating backend distance:', error);
    }
  }

  const totalTraditionalCosts = traditionalCostsDentists + traditionalCostsAssistants + 
    (nearestInstitute?.travelCosts || 0);
  
  const crocodileCosts = calculateCrocodileCosts(inputs.teamSize);
  
  const savings = totalTraditionalCosts - crocodileCosts;
  const savingsPercentage = (savings / totalTraditionalCosts) * 100;

  return {
    traditionalCostsDentists,
    traditionalCostsAssistants,
    totalTraditionalCosts,
    crocodileCosts,
    savings,
    savingsPercentage,
    nearestInstitute,
    timeSavings,
    cmeRequirements: {
      traditional: {
        dentist: traditionalDentistCME,
        assistant: traditionalAssistantCME
      }
    }
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};
