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

export interface Results {
  traditionalCostsDentists: number;
  traditionalCostsAssistants: number;
  totalTraditionalCosts: number;
  crocodileCosts: number;
  savings: number;
  savingsPercentage: number;
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