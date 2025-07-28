
// Research-based constants for time savings calculations
// Sources: BZÄK, KZBV, Destatis, ZFA-Tarifverträge

export const TIME_SAVINGS_CONSTANTS = {
  // Durchschnittlicher Praxisumsatz pro Stunde (Quelle: ZWP-Online Praxismanagement-Studie 2023)
  AVERAGE_PRACTICE_REVENUE_PER_HOUR: 250,
  
  // Praxisschließungszeiten für verschiedene Fortbildungsformate
  PRACTICE_CLOSURE_HOURS: {
    FULL_DAY_TRADITIONAL: 8,    // Ganztägige Präsenzfortbildung
    HALF_DAY_TRADITIONAL: 4,    // Halbtägige Präsenzfortbildung
    AVERAGE_TRADITIONAL: 5,     // Durchschnittliche Präsenzfortbildung
    CROCODILE_ONLINE: 0         // Keine Praxisschließung bei Online-Fortbildung
  },
  
  // Praxisausfall-Faktoren (degressive Skalierung nach Teamgröße)
  PRACTICE_IMPACT_FACTORS: {
    SMALL_PRACTICE: 0.8,                 // 1-4 Mitarbeiter: 80% Ausfallwahrscheinlichkeit
    MEDIUM_PRACTICE: 0.5,                // 5-10 Mitarbeiter: 50% Ausfallwahrscheinlichkeit  
    LARGE_PRACTICE: 0.3,                 // 11+ Mitarbeiter: 30% Ausfallwahrscheinlichkeit
  },
  WEEKEND_TRAINING_RATE: 0.5,            // 50% der Fortbildungen finden am Wochenende statt
  
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
  
  // Konservative Stundensätze für Ausfallkosten (nicht Vollkosten)
  HOURLY_RATES: {
    DENTIST_OPPORTUNITY_COST: 80,          // Konservative Opportunitätskosten für Zahnarzt
    ZFA_OPPORTUNITY_COST: 20,              // Konservative Opportunitätskosten für ZFA
    PRACTICE_OVERHEAD_FACTOR: 1.2          // Reduzierter Faktor für Praxisnebenkosten
  },
  
  // Freiwillige Fortbildung für ZFA (keine gesetzliche Pflicht)
  ZFA_VOLUNTARY_TRAINING: {
    AVERAGE_HOURS_PER_YEAR: 8,             // Durchschnittlich 8 Stunden freiwillige Fortbildung pro Jahr
    PARTICIPATION_RATE: 0.7,               // 70% der ZFA nehmen an freiwilliger Fortbildung teil
  },
  
  // CME-Anforderungen (basierend auf § 95d SGB V)
  CME_REQUIREMENTS: {
    TOTAL_POINTS_PER_5_YEARS: 125,           // 125 CME-Punkte in 5 Jahren (§ 95d SGB V)
    AVERAGE_SESSION_DURATION_HOURS: 5,       // Durchschnittliche Dauer einer Präsenzfortbildung
    AVERAGE_CME_POINTS_PER_SESSION: 5,       // Durchschnittliche CME-Punkte pro Session
    MAX_CME_POINTS_PER_DAY: 8,               // Maximum CME-Punkte pro Tag
    ANNUAL_CME_REQUIREMENT: 25               // 125 Punkte ÷ 5 Jahre = 25 Punkte pro Jahr
  }
};

// Quellen für die verwendeten Daten
export const DATA_SOURCES = {
  PRACTICE_REVENUE: "ZWP-Online Praxismanagement-Studie 2023 - Stundensätze in der Zahnarztpraxis (https://www.zwp-online.info/zwpnews/wirtschaft-und-recht/praxismanagement/stundensatze-in-der-zahnarztpraxis)",
  HOURLY_RATES: "Verband medizinischer Fachberufe e.V. (VMF) - Vergütungstarifvertrag ZFA 2025 (https://www.vmf-online.de/zfa/zfa-tarife)",
  ZFA_SALARIES: "ZFA-Mal-Anders Gehaltsrechner 2025 basierend auf AAZ Tarifvertrag (https://www.zfa-mal-anders.de/karriere/zfa/gehalt)",
  ORGANIZATIONAL_COSTS: "Praxismanagement-Studien der Kassenzahnärztlichen Vereinigungen und ZWP-Online",
  PATIENT_BEHAVIOR: "Branchenanalysen zur Patientenbindung in Zahnarztpraxen (ZWP-Online, Dental-Wirtschaft)",
  OPPORTUNITY_COSTS: "Betriebswirtschaftliche Kennzahlen der Dentalbranche",
  CME_REQUIREMENTS: "§ 95d SGB V - Vertragszahnärzte müssen 125 CME-Punkte in 5 Jahren sammeln (https://www.zm-online.de/cme/cme-uebersicht, https://www.kzvlb.de/berufsausuebung/fortbildungspflicht)",
  PRACTICE_IMPACT: "Realistische Bewertung basierend auf Wochenend-/Abendfortbildungen (50% Weekend-Rate)",
  STATISTICS_SOURCE: "Bundeszahnärztekammer (BZÄK) - Daten und Zahlen (https://www.bzaek.de/ueber-uns/daten-und-zahlen/nachgezaehlt.html)",
  COST_STRUCTURE: "Statistisches Bundesamt - Kostenstruktur Zahnarztpraxen 2019",
  LEGAL_BASIS: "Sozialgesetzbuch (SGB V) § 95d - Fachliche Fortbildungspflicht für Vertragsärzte",
  KZV_SOURCES: "Kassenzahnärztliche Vereinigung - Fortbildungspflicht nach § 95d SGB V"
};
