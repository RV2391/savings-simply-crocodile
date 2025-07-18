import { calculateNearestInstitute } from '../dentalInstitutes';
import { 
  calculateAnnualCMERequirements, 
  TYPICAL_TRADITIONAL_UNIT, 
  TYPICAL_CROCODILE_UNIT 
} from '../cmeCalculations';
import { CalculationInputs } from './types';
import type { Results, TimeSavings, TimeSavingsDetails } from '../../types';
import { 
  DENTIST_ANNUAL_COST,
  ASSISTANT_ANNUAL_COST,
  ASSISTANTS_PER_CAR,
  BASE_USERS_INCLUDED,
  ADDITIONAL_USER_BLOCK_SIZE,
  COST_PER_ADDITIONAL_BLOCK_MONTHLY,
  BASE_PRICE,
  COST_PER_KM,
  MONTHS_PER_YEAR,
  DENTIST_HOURLY_RATE,
  ASSISTANT_HOURLY_RATE,
  PREPARATION_TIME
} from './constants';

const calculateCrocodileCosts = (teamSize: number): number => {
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
  
  const dentistTimePerSession = {
    trainingHours: 3,
    travelHours: travelTimeHours,
    prepHours: PREPARATION_TIME,
    totalHours: 3 + travelTimeHours + PREPARATION_TIME
  };

  const assistantTimePerSession = {
    trainingHours: 3,
    travelHours: travelTimeHours,
    prepHours: PREPARATION_TIME,
    totalHours: 3 + travelTimeHours + PREPARATION_TIME
  };

  const totalDentistHours = dentistTimePerSession.totalHours * traditionalDentistCME.requiredSessions * dentists;
  const totalAssistantHours = assistantTimePerSession.totalHours * traditionalAssistantCME.requiredSessions * assistants;
  
  const dentistMonetaryValue = totalDentistHours * DENTIST_HOURLY_RATE;
  const assistantMonetaryValue = totalAssistantHours * ASSISTANT_HOURLY_RATE;

  const totalTravelHours = travelTimeHours * 
    (traditionalDentistCME.requiredSessions * dentists + 
     traditionalAssistantCME.requiredSessions * Math.ceil(assistants / ASSISTANTS_PER_CAR));

  const details: TimeSavingsDetails = {
    perSession: {
      dentist: dentistTimePerSession,
      assistant: assistantTimePerSession
    },
    monetaryValues: {
      dentist: dentistMonetaryValue,
      assistant: assistantMonetaryValue
    }
  };

  return {
    totalHoursPerYear: totalDentistHours + totalAssistantHours,
    totalMonetaryValue: dentistMonetaryValue + assistantMonetaryValue,
    dentistHours: totalDentistHours,
    assistantHours: totalAssistantHours,
    travelHours: totalTravelHours,
    details
  };
};

export const calculateResults = async (inputs: CalculationInputs): Promise<Results> => {
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
      const service = new google.maps.DistanceMatrixService();
      const result = await service.getDistanceMatrix({
        origins: [{ lat: inputs.practiceLat, lng: inputs.practiceLng }],
        destinations: [{ lat: nearest.coordinates.lat, lng: nearest.coordinates.lng }],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      });

      if (result.rows[0]?.elements[0]?.status === "OK") {
        const element = result.rows[0].elements[0];
        
        const directionsService = new google.maps.DirectionsService();
        const directionsResult = await directionsService.route({
          origin: { lat: inputs.practiceLat, lng: inputs.practiceLng },
          destination: { lat: nearest.coordinates.lat, lng: nearest.coordinates.lng },
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
          optimizeWaypoints: true
        });

        let shortestRoute = directionsResult.routes[0];
        let shortestDistance = Number.MAX_VALUE;
        let shortestDuration = Number.MAX_VALUE;

        directionsResult.routes.forEach(route => {
          const distance = route.legs[0].distance.value;
          if (distance < shortestDistance) {
            shortestDistance = distance;
            shortestDuration = route.legs[0].duration.value;
            shortestRoute = route;
          }
        });

        const oneWayDistance = shortestDistance / 1000;
        const oneWayTime = shortestDuration / 60;
        
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
    nearestInstitute,
    timeSavings
  } as Results;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Export types for use in components
export type { CalculationInputs } from './types';
export type { Results } from '../../types';
