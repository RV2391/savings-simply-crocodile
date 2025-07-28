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
  details: TimeSavingsDetails;
}

export interface Results {
  traditionalCostsDentists: number;
  traditionalCostsAssistants: number;
  totalTraditionalCosts: number;
  crocodileCosts: number;
  savings: number;
  savingsPercentage: number;
  timeSavings?: TimeSavings;
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