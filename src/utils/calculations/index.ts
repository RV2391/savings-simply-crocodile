import { calculateNearestInstitute } from '../dentalInstitutes';
import { calculateAnnualCMERequirements, TYPICAL_TRADITIONAL_UNIT } from '../cmeCalculations';
import { calculateCrocodileCosts, calculateTravelCosts, formatCurrency } from './costCalculations';
import { calculateTimeSavings } from './timeSavingsCalculations';
import { DENTIST_ANNUAL_COST, ASSISTANT_ANNUAL_COST } from './constants';
import type { CalculationInputs, CalculationResults, NearestInstitute } from './types';

export type { CalculationInputs, CalculationResults, NearestInstitute };
export { formatCurrency };

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
    timeSavings,
    cmeRequirements: {
      traditional: {
        dentist: traditionalDentistCME,
        assistant: traditionalAssistantCME
      }
    }
  };
};