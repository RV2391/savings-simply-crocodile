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
    oneWayDistance: number;
    travelTime: number;
    oneWayTravelTime: number;
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
const ASSISTANTS_PER_CAR = 5;

export const calculateCrocodileCosts = (teamSize: number): number => {
  if (teamSize <= BASE_USERS_INCLUDED) {
    return BASE_PRICE;
  }
  
  const additionalUsers = teamSize - BASE_USERS_INCLUDED;
  const additionalBlocks = Math.ceil(additionalUsers / ADDITIONAL_USER_BLOCK_SIZE);
  return BASE_PRICE + (additionalBlocks * COST_PER_ADDITIONAL_BLOCK);
};

const calculateTravelCosts = (distance: number, dentists: number, assistants: number): number => {
  // Zahnärzte fahren einzeln
  const dentistsCosts = distance * COST_PER_KM * dentists;
  
  // Assistenten fahren in Gruppen von bis zu 5 Personen
  const assistantGroups = Math.ceil(assistants / ASSISTANTS_PER_CAR);
  const assistantsCosts = distance * COST_PER_KM * assistantGroups;
  
  return Math.round(dentistsCosts + assistantsCosts);
};

export const calculateResults = async (inputs: CalculationInputs): Promise<CalculationResults> => {
  const assistants = inputs.teamSize - inputs.dentists;
  
  const traditionalCostsDentists = inputs.dentists * DENTIST_ANNUAL_COST;
  const traditionalCostsAssistants = assistants * ASSISTANT_ANNUAL_COST;

  let nearestInstitute;
  if (inputs.practiceLat && inputs.practiceLng) {
    const nearest = calculateNearestInstitute(inputs.practiceLat, inputs.practiceLng);
    
    try {
      const service = new google.maps.DistanceMatrixService();
      const result = await service.getDistanceMatrix({
        origins: [{ lat: inputs.practiceLat, lng: inputs.practiceLng }],
        destinations: [{ lat: nearest.coordinates.lat, lng: nearest.coordinates.lng }],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      });

      if (result.rows[0]?.elements[0]?.status === "OK") {
        const element = result.rows[0].elements[0];
        const oneWayDistance = element.distance.value / 1000; // Meter in Kilometer umrechnen
        const oneWayTime = element.duration.value / 60; // Sekunden in Minuten umrechnen
        
        const roundTripDistance = oneWayDistance * 2; // Hin- und Rückfahrt
        const roundTripTime = oneWayTime * 2; // Hin- und Rückfahrt
        const travelCosts = calculateTravelCosts(roundTripDistance, inputs.dentists, assistants);

        nearestInstitute = {
          name: nearest.name,
          oneWayDistance: oneWayDistance,
          distance: roundTripDistance,
          oneWayTravelTime: oneWayTime,
          travelTime: roundTripTime,
          travelCosts
        };
      }
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