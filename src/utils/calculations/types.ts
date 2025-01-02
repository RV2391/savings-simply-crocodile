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

export interface TimeSavingsDetails {
  perSession: {
    dentist: {
      trainingHours: number;
      travelHours: number;
      prepHours: number;
      totalHours: number;
    };
    assistant: {
      trainingHours: number;
      travelHours: number;
      prepHours: number;
      totalHours: number;
    };
  };
  monetaryValues: {
    dentist: number;
    assistant: number;
  };
}

export interface TimeSavings {
  totalHoursPerYear: number;
  totalMonetaryValue: number;
  dentistHours: number;
  assistantHours: number;
  travelHours: number;
  details: TimeSavingsDetails;
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