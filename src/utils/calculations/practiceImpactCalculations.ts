import { TIME_SAVINGS_CONSTANTS } from './timeSavingsConstants';

/**
 * Berechnet den realistischen Praxisausfall-Faktor basierend auf der Teamgröße
 * Grundlage: Degressive Skalierung - größere Praxen haben bessere Vertretungsmöglichkeiten
 */
export const calculatePracticeImpactFactor = (totalTeamSize: number): number => {
  const { PRACTICE_IMPACT_FACTORS } = TIME_SAVINGS_CONSTANTS;
  
  if (totalTeamSize <= 4) {
    return PRACTICE_IMPACT_FACTORS.SMALL_PRACTICE;
  } else if (totalTeamSize <= 10) {
    return PRACTICE_IMPACT_FACTORS.MEDIUM_PRACTICE;
  } else {
    return PRACTICE_IMPACT_FACTORS.LARGE_PRACTICE;
  }
};

/**
 * Berechnet die realistischen ZFA-Fortbildungsanforderungen
 * ZFA haben keine gesetzliche CME-Pflicht, nur freiwillige Weiterbildung
 */
export const calculateZFATrainingRequirements = (assistants: number) => {
  const { ZFA_VOLUNTARY_TRAINING } = TIME_SAVINGS_CONSTANTS;
  
  const participatingAssistants = Math.round(assistants * ZFA_VOLUNTARY_TRAINING.PARTICIPATION_RATE);
  const totalVoluntaryHours = participatingAssistants * ZFA_VOLUNTARY_TRAINING.AVERAGE_HOURS_PER_YEAR;
  
  return {
    participatingAssistants,
    totalVoluntaryHours,
    averageHoursPerParticipant: ZFA_VOLUNTARY_TRAINING.AVERAGE_HOURS_PER_YEAR
  };
};

/**
 * Gibt eine transparente Aufschlüsselung der Berechnungsgrundlagen zurück
 */
export const getCalculationTransparency = (dentists: number, assistants: number, totalTeamSize: number) => {
  const practiceImpactFactor = calculatePracticeImpactFactor(totalTeamSize);
  const zfaTraining = calculateZFATrainingRequirements(assistants);
  
  let practiceSize: 'small' | 'medium' | 'large';
  if (totalTeamSize <= 4) {
    practiceSize = 'small';
  } else if (totalTeamSize <= 10) {
    practiceSize = 'medium';
  } else {
    practiceSize = 'large';
  }
  
  return {
    practiceSize,
    practiceImpactFactor,
    mandatoryTraining: {
      dentists: dentists,
      assistants: 0, // Keine gesetzliche Pflicht für ZFA
    },
    voluntaryTraining: {
      zfaParticipating: zfaTraining.participatingAssistants,
      zfaTotal: assistants
    },
    notes: {
      legalBasis: "Nur Zahnärzte haben gesetzliche CME-Pflicht nach § 95d SGB V",
      conservativeCalculation: "Konservative Schätzung mit reduzierten Opportunitätskosten",
      practiceImpactReason: `${Math.round(practiceImpactFactor * 100)}% Ausfallwahrscheinlichkeit aufgrund ${practiceSize === 'small' ? 'geringer' : practiceSize === 'medium' ? 'mittlerer' : 'hoher'} Praxisgröße und Vertretungsmöglichkeiten`
    }
  };
};