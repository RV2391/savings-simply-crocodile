import { calculateNearestInstitute } from './dentalInstitutes';

export interface CalculationInputs {
  teamSize: number;
  dentists: number;
  practiceLat?: number;
  practiceLng?: number;
  nearestInstituteLat?: number;
  nearestInstituteLng?: number;
}

export interface CalculationResults {
  traditionalCostsDentists: number;
  traditionalCostsAssistants: number;
  totalTraditionalCosts: number;
  crocodileCosts: number;
  savings: number;
  savingsPercentage: number;
  nearestInstitute?: {
    name: string;
    distance: number;
    travelTime: number;
    travelCosts: number;
  };
}

const DENTIST_ANNUAL_COST = 1200;
const ASSISTANT_ANNUAL_COST = 280;
const BASE_USERS_INCLUDED = 20;
const ADDITIONAL_USER_BLOCK_SIZE = 10;
const COST_PER_ADDITIONAL_BLOCK = 50;
const BASE_PRICE = 1699;
const COST_PER_KM = 0.30;

export const calculateCrocodileCosts = (teamSize: number): number => {
  if (teamSize <= BASE_USERS_INCLUDED) {
    return BASE_PRICE;
  }
  
  const additionalUsers = teamSize - BASE_USERS_INCLUDED;
  const additionalBlocks = Math.ceil(additionalUsers / ADDITIONAL_USER_BLOCK_SIZE);
  return BASE_PRICE + (additionalBlocks * COST_PER_ADDITIONAL_BLOCK);
};

export const calculateResults = async (inputs: CalculationInputs): Promise<CalculationResults> => {
  const assistants = inputs.teamSize - inputs.dentists;
  
  const traditionalCostsDentists = inputs.dentists * DENTIST_ANNUAL_COST;
  const traditionalCostsAssistants = assistants * ASSISTANT_ANNUAL_COST;

  let nearestInstitute;
  if (inputs.practiceLat && inputs.practiceLng) {
    const nearest = calculateNearestInstitute(inputs.practiceLat, inputs.practiceLng);
    
    try {
      // Calculate distance using the Haversine formula as a fallback
      const R = 6371; // Earth's radius in kilometers
      const dLat = (nearest.coordinates.lat - inputs.practiceLat) * Math.PI / 180;
      const dLon = (nearest.coordinates.lng - inputs.practiceLng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(inputs.practiceLat * Math.PI / 180) * Math.cos(nearest.coordinates.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const oneWayDistance = R * c;
      
      // Estimate travel time based on average speed (60 km/h)
      const oneWayTimeHours = oneWayDistance / 60;
      const oneWayTimeMinutes = Math.round(oneWayTimeHours * 60);
      
      const roundTripDistance = oneWayDistance * 2;
      const roundTripTime = oneWayTimeMinutes * 2;
      const travelCosts = roundTripDistance * COST_PER_KM * inputs.teamSize;

      nearestInstitute = {
        name: nearest.name,
        distance: Math.round(roundTripDistance), // Round trip distance
        travelTime: roundTripTime, // Round trip time in minutes
        travelCosts: Math.round(travelCosts)
      };
    } catch (error) {
      console.error('Error calculating distance:', error);
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
    nearestInstitute
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};