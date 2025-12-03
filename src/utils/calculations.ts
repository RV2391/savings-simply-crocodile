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
  researchHoursSaved?: number;
  details?: any;
}

export interface OptimizationBreakdown {
  freeCoursesSavings: number;
  priceOptimizationSavings: number;
  researchTimeSaved: number;
  platformCost: number;
}

export interface CalculationResults {
  traditionalCostsDentists: number;
  traditionalCostsAssistants: number;
  totalTraditionalCosts: number;
  optimizedCosts: number;
  savings: number;
  savingsPercentage: number;
  timeSavings?: TimeSavings;
  nearestInstitute?: NearestInstitute;
  optimizationBreakdown?: OptimizationBreakdown;
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
const COST_PER_KM = 0.30;
const ASSISTANTS_PER_CAR = 5;
const DENTIST_HOURLY_RATE = 150;
const ASSISTANT_HOURLY_RATE = 35;
const PREPARATION_TIME = 1;

// KursRadar specific constants
const KURSRADAR_PLATFORM_COST = 0; // Free for practices
const FREE_COURSE_PERCENTAGE = 0.30; // 30% of courses are free/sponsored
const PRICE_OPTIMIZATION_FACTOR = 0.15; // 15% savings through price comparison
const RESEARCH_TIME_SAVED_HOURS = 10; // Hours saved per year through centralized search

export const calculateOptimizedCosts = (
  traditionalCosts: number,
  teamSize: number
): { optimizedCosts: number; breakdown: OptimizationBreakdown } => {
  // Savings through free/sponsored courses
  const freeCoursesSavings = traditionalCosts * FREE_COURSE_PERCENTAGE;
  
  // Savings through price comparison and transparency
  const remainingCosts = traditionalCosts - freeCoursesSavings;
  const priceOptimizationSavings = remainingCosts * PRICE_OPTIMIZATION_FACTOR;
  
  // Platform cost (free for practices)
  const platformCost = KURSRADAR_PLATFORM_COST;
  
  const optimizedCosts = traditionalCosts - freeCoursesSavings - priceOptimizationSavings + platformCost;
  
  return {
    optimizedCosts: Math.round(optimizedCosts),
    breakdown: {
      freeCoursesSavings: Math.round(freeCoursesSavings),
      priceOptimizationSavings: Math.round(priceOptimizationSavings),
      researchTimeSaved: RESEARCH_TIME_SAVED_HOURS,
      platformCost
    }
  };
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
    totalHoursPerYear: totalDentistHours + totalAssistantHours + RESEARCH_TIME_SAVED_HOURS,
    totalMonetaryValue: dentistMonetaryValue + assistantMonetaryValue,
    dentistHours: totalDentistHours,
    assistantHours: totalAssistantHours,
    travelHours: totalTravelHours,
    researchHoursSaved: RESEARCH_TIME_SAVED_HOURS
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
  
  const { optimizedCosts, breakdown } = calculateOptimizedCosts(totalTraditionalCosts, inputs.teamSize);
  
  const savings = totalTraditionalCosts - optimizedCosts;
  const savingsPercentage = (savings / totalTraditionalCosts) * 100;

  return {
    traditionalCostsDentists,
    traditionalCostsAssistants,
    totalTraditionalCosts,
    optimizedCosts,
    savings,
    savingsPercentage,
    nearestInstitute,
    timeSavings,
    optimizationBreakdown: breakdown,
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
