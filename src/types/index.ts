export interface AddressComponents {
  street?: string;
  city?: string;
  postalCode?: string;
}

export interface CalculatorData {
  teamSize: number;
  dentists: number;
  location?: string;
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
      isVoluntary?: boolean;
      participationRate?: number;
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
  researchHoursSaved?: number;
  details?: TimeSavingsDetails;
}

export interface OptimizationBreakdown {
  freeCoursesSavings: number;
  priceOptimizationSavings: number;
  researchTimeSaved: number;
  platformCost: number;
}

export interface Results {
  traditionalCostsDentists: number;
  traditionalCostsAssistants: number;
  totalTraditionalCosts: number;
  optimizedCosts: number;
  savings: number;
  savingsPercentage: number;
  timeSavings?: TimeSavings;
  optimizationBreakdown?: OptimizationBreakdown;
  nearestInstitute?: {
    name: string;
    distance: number;
    oneWayDistance: number;
    travelTime: number;
    oneWayTravelTime: number;
    travelCosts: number;
  };
}

declare global {
  interface Window {
    hbspt: any;
  }
}
