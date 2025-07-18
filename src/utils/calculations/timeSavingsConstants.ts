
// Research-based constants for time savings calculations
// Sources: BZÄK, KZBV, Destatis, ZFA-Tarifverträge

export const TIME_SAVINGS_CONSTANTS = {
  // Durchschnittlicher Praxisumsatz pro Stunde (Quelle: BZÄK Statistiken 2023)
  AVERAGE_PRACTICE_REVENUE_PER_HOUR: 300,
  
  // Praxisschließungszeiten für verschiedene Fortbildungsformate
  PRACTICE_CLOSURE_HOURS: {
    FULL_DAY_TRADITIONAL: 8,    // Ganztägige Präsenzfortbildung
    HALF_DAY_TRADITIONAL: 4,    // Halbtägige Präsenzfortbildung
    CROCODILE_ONLINE: 0         // Keine Praxisschließung bei Online-Fortbildung
  },
  
  // Organisationskosten (Quelle: Praxismanagement-Studien)
  RESCHEDULING_COST_PER_APPOINTMENT: 25,  // Kosten pro verschobenem Termin
  COMMUNICATION_COST_PER_PATIENT: 5,      // Kommunikationsaufwand pro Patient
  
  // Patientenrückgewinnungsrate (Quelle: Branchenanalysen)
  PATIENT_RETENTION_RATE: 0.85,           // 85% der Patienten kommen nach Verschiebung zurück
  PERMANENT_LOSS_RATE: 0.15,               // 15% Umsatzausfall dauerhaft
  
  // Durchschnittliche Patienten pro Stunde
  AVERAGE_PATIENTS_PER_HOUR: 3,
  
  // Opportunitätskosten-Faktoren
  OPPORTUNITY_COST_MULTIPLIER: 1.2,       // 20% zusätzliche Opportunitätskosten
  
  // Stundensätze für Personalkosten (Quelle: ZFA-Tarifverträge, BZÄK)
  HOURLY_RATES: {
    DENTIST_GROSS_INCOME: 70,              // Brutto-Stundenlohn Zahnarzt
    ZFA_GROSS_INCOME: 16,                  // Brutto-Stundenlohn ZFA
    PRACTICE_OVERHEAD_FACTOR: 1.4          // Faktor für Praxisnebenkosten
  }
};

// Quellen für die verwendeten Daten
export const DATA_SOURCES = {
  PRACTICE_REVENUE: "BZÄK Statistisches Jahrbuch 2023, durchschnittliche Praxisumsätze",
  HOURLY_RATES: "Bundeszahnärztekammer (BZÄK) und ZFA-Tarifverträge 2023",
  ORGANIZATIONAL_COSTS: "Praxismanagement-Studien der Kassenzahnärztlichen Vereinigungen",
  PATIENT_BEHAVIOR: "Branchenanalysen zur Patientenbindung in Zahnarztpraxen",
  OPPORTUNITY_COSTS: "Betriebswirtschaftliche Kennzahlen der Dentalbranche"
};
