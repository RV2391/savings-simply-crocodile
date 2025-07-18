
import { useCallback } from 'react';

interface GTMEvent {
  event: string;
  calculator_usage?: string;
  calculator_team_size?: number;
  calculator_dentists_count?: number;
  calculator_location_provided?: boolean;
  [key: string]: any;
}

export const useGTMTracking = () => {
  const trackEvent = useCallback((eventData: GTMEvent) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      console.log('GTM Event:', eventData);
      window.dataLayer.push(eventData);
    }
  }, []);

  const trackCalculatorInteraction = useCallback((action: string, additionalData?: Record<string, any>) => {
    trackEvent({
      event: 'calculator_interaction',
      calculator_usage: action,
      ...additionalData
    });
  }, [trackEvent]);

  const trackTeamSizeChange = useCallback((teamSize: number) => {
    trackCalculatorInteraction('team_size_changed', {
      calculator_team_size: teamSize
    });
  }, [trackCalculatorInteraction]);

  const trackDentistsCountChange = useCallback((dentistsCount: number) => {
    trackCalculatorInteraction('dentists_count_changed', {
      calculator_dentists_count: dentistsCount
    });
  }, [trackCalculatorInteraction]);

  const trackLocationProvided = useCallback(() => {
    trackCalculatorInteraction('location_provided', {
      calculator_location_provided: true
    });
  }, [trackCalculatorInteraction]);

  const trackCalculationCompleted = useCallback((savings: number, teamSize: number, dentistsCount: number, hasLocation: boolean) => {
    trackCalculatorInteraction('calculation_completed', {
      calculator_team_size: teamSize,
      calculator_dentists_count: dentistsCount,
      calculator_location_provided: hasLocation,
      savings_amount: savings
    });
  }, [trackCalculatorInteraction]);

  return {
    trackEvent,
    trackCalculatorInteraction,
    trackTeamSizeChange,
    trackDentistsCountChange,
    trackLocationProvided,
    trackCalculationCompleted
  };
};
