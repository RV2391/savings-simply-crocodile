
export interface CMEUnit {
  duration: number; // in minutes
  hasExercises: boolean;
  hasTest: boolean;
}

export interface CMECalculationResult {
  totalPoints: number;
  totalHours: number;
  requiredSessions: number;
}

const MINUTES_PER_POINT = 45;
const MAX_POINTS_PER_DAY = 8;
const EXERCISE_BONUS_POINTS = 2;
const TEST_BONUS_POINTS = 1;

export const calculateCMEPoints = (unit: CMEUnit): number => {
  // Basis-Punkte aus der Dauer
  let points = Math.floor(unit.duration / MINUTES_PER_POINT);
  
  // Bonus-Punkte
  if (unit.hasExercises) points += EXERCISE_BONUS_POINTS;
  if (unit.hasTest) points += TEST_BONUS_POINTS;
  
  // Maximale Punkte pro Tag begrenzen
  return Math.min(points, MAX_POINTS_PER_DAY);
};

export const calculateAnnualCMERequirements = (
  isDentist: boolean,
  averageSessionDuration: number = 300, // 5 Stunden in Minuten (realistischer)
  includesExercises: boolean = false,
  includesTest: boolean = false
): CMECalculationResult => {
  const requiredPoints = isDentist ? 25 : 24; // Zahnärzte: 25 Punkte (125/5 Jahre), Assistenz: 24 Punkte
  
  const pointsPerSession = calculateCMEPoints({
    duration: averageSessionDuration,
    hasExercises: includesExercises,
    hasTest: includesTest
  });

  const requiredSessions = Math.ceil(requiredPoints / pointsPerSession);
  const totalHours = (averageSessionDuration * requiredSessions) / 60;

  return {
    totalPoints: requiredPoints,
    totalHours: totalHours,
    requiredSessions: requiredSessions
  };
};

// Beispiel für eine typische Fortbildungseinheit bei Crocodile
export const TYPICAL_CROCODILE_UNIT: CMEUnit = {
  duration: 45, // 45 Minuten pro Einheit
  hasExercises: true,
  hasTest: true
};

// Beispiel für eine typische traditionelle Präsenz-Fortbildung (realistischer)
export const TYPICAL_TRADITIONAL_UNIT: CMEUnit = {
  duration: 300, // 5 Stunden (statt 8)
  hasExercises: true,
  hasTest: false
};
