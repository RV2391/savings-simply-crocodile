export interface CalculationInputs {
  teamSize: number;
  dentists: number;
  assistants: number;
  cmePointCost: number;
  travelCosts: number;
  growthRate: number;
  practiceLat?: number;
  practiceLng?: number;
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
  };
}

const ASSISTANT_HOURS = 20;
const ASSISTANT_HOURLY_RATE = 30;
const CME_POINTS_REQUIRED = 50;
const AVERAGE_SPEED_KMH = 60; // Average travel speed in km/h
const BASE_USERS_INCLUDED = 20;
const ADDITIONAL_USER_BLOCK_SIZE = 10;
const COST_PER_ADDITIONAL_BLOCK = 50;
const BASE_PRICE = 1699;

export const calculateCrocodileCosts = (teamSize: number): number => {
  if (teamSize <= BASE_USERS_INCLUDED) {
    return BASE_PRICE;
  }
  
  const additionalUsers = teamSize - BASE_USERS_INCLUDED;
  const additionalBlocks = Math.ceil(additionalUsers / ADDITIONAL_USER_BLOCK_SIZE);
  return BASE_PRICE + (additionalBlocks * COST_PER_ADDITIONAL_BLOCK);
};

import { calculateNearestInstitute, calculateDistance } from './dentalInstitutes';

export const calculateResults = (inputs: CalculationInputs): CalculationResults => {
  const traditionalCostsDentists =
    inputs.dentists * CME_POINTS_REQUIRED * inputs.cmePointCost +
    inputs.dentists * inputs.travelCosts;

  const traditionalCostsAssistants =
    inputs.assistants * ASSISTANT_HOURS * ASSISTANT_HOURLY_RATE;

  const totalTraditionalCosts = traditionalCostsDentists + traditionalCostsAssistants;
  const crocodileCosts = calculateCrocodileCosts(inputs.teamSize);
  const savings = totalTraditionalCosts - crocodileCosts;
  const savingsPercentage = (savings / totalTraditionalCosts) * 100;

  let nearestInstitute;
  if (inputs.practiceLat && inputs.practiceLng) {
    const nearest = calculateNearestInstitute(inputs.practiceLat, inputs.practiceLng);
    const distance = calculateDistance(
      inputs.practiceLat,
      inputs.practiceLng,
      nearest.coordinates.lat,
      nearest.coordinates.lng
    );
    const travelTime = (distance / AVERAGE_SPEED_KMH) * 60; // Convert to minutes

    nearestInstitute = {
      name: nearest.name,
      distance: Math.round(distance),
      travelTime: Math.round(travelTime)
    };
  }

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
