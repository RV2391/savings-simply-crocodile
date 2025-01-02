import {
  BASE_USERS_INCLUDED,
  ADDITIONAL_USER_BLOCK_SIZE,
  COST_PER_ADDITIONAL_BLOCK_MONTHLY,
  BASE_PRICE,
  MONTHS_PER_YEAR,
  COST_PER_KM,
  ASSISTANTS_PER_CAR
} from './constants';

export const calculateCrocodileCosts = (teamSize: number): number => {
  if (teamSize <= BASE_USERS_INCLUDED) {
    return BASE_PRICE;
  }
  
  const additionalUsers = teamSize - BASE_USERS_INCLUDED;
  const additionalBlocks = Math.ceil(additionalUsers / ADDITIONAL_USER_BLOCK_SIZE);
  const annualAdditionalCosts = additionalBlocks * COST_PER_ADDITIONAL_BLOCK_MONTHLY * MONTHS_PER_YEAR;
  return BASE_PRICE + annualAdditionalCosts;
};

export const calculateTravelCosts = (distance: number, dentists: number, assistants: number): number => {
  const dentistsCosts = distance * COST_PER_KM * dentists;
  const assistantGroups = Math.ceil(assistants / ASSISTANTS_PER_CAR);
  const assistantsCosts = distance * COST_PER_KM * assistantGroups;
  
  return Math.round(dentistsCosts + assistantsCosts);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};