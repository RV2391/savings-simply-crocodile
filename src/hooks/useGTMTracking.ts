
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
      console.log('🏷️ GTM Event:', eventData);
      
      // Enhanced debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`GTM: ${eventData.event}`);
        console.log('Event Data:', eventData);
        console.log('DataLayer before push:', [...window.dataLayer]);
        window.dataLayer.push(eventData);
        console.log('DataLayer after push:', [...window.dataLayer]);
        console.groupEnd();
      } else {
        window.dataLayer.push(eventData);
      }
    } else {
      console.warn('⚠️ GTM: dataLayer not available');
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

  const trackCalculationCompleted = useCallback((
    savings: number, 
    teamSize: number, 
    dentistsCount: number, 
    hasLocation: boolean,
    timeSavingsHours?: number,
    timeSavingsValue?: number
  ) => {
    trackCalculatorInteraction('calculation_completed', {
      calculator_team_size: teamSize,
      calculator_dentists_count: dentistsCount,
      calculator_location_provided: hasLocation,
      savings_amount: Math.round(savings),
      time_savings_hours: timeSavingsHours && !isNaN(timeSavingsHours) ? Math.round(timeSavingsHours * 10) / 10 : 0,
      time_savings_value: timeSavingsValue && !isNaN(timeSavingsValue) ? Math.round(timeSavingsValue) : 0
    });
  }, [trackCalculatorInteraction]);

  const trackTimeSavingsViewed = useCallback((
    timeSavingsHours: number,
    timeSavingsValue: number,
    teamSize: number
  ) => {
    trackEvent({
      event: 'time_savings_viewed',
      time_savings_hours: Math.round(timeSavingsHours * 10) / 10,
      time_savings_value: Math.round(timeSavingsValue),
      calculator_team_size: teamSize
    });
  }, [trackEvent]);

  const trackFormStart = useCallback(() => {
    trackEvent({
      event: 'form_start',
      form_type: 'calculator_results'
    });
  }, [trackEvent]);

  const trackFormFieldComplete = useCallback((fieldName: string) => {
    trackEvent({
      event: 'form_field_complete',
      form_type: 'calculator_results',
      field_name: fieldName
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackCalculatorInteraction,
    trackTeamSizeChange,
    trackDentistsCountChange,
    trackLocationProvided,
    trackCalculationCompleted,
    trackTimeSavingsViewed,
    trackFormStart,
    trackFormFieldComplete
  };
};
