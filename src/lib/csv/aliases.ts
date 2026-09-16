/**
 * Alias lists for WHOOP's CSV export headers. These are matched via
 * normalizeHeader() (case/whitespace/punctuation-insensitive), so listing
 * one canonical wording usually also catches minor variants.
 *
 * Assumed headers, based on WHOOP's public "Data Export" CSVs (not
 * officially documented by WHOOP — verify against a real export and extend
 * these lists if a field comes back empty):
 *   physiological_cycles.csv, sleeps.csv, workouts.csv, journal_entries.csv
 */

export type CycleField =
  | 'id'
  | 'cycleStart'
  | 'cycleEnd'
  | 'recoveryScore'
  | 'restingHeartRate'
  | 'hrv'
  | 'skinTemp'
  | 'spo2'
  | 'strain'
  | 'energyExpended'
  | 'respiratoryRate'

export const CYCLE_ALIASES: Record<CycleField, string[]> = {
  id: ['Cycle id', 'Cycle ID'],
  cycleStart: ['Cycle start time', 'Cycle start', 'From'],
  cycleEnd: ['Cycle end time', 'Cycle end', 'To'],
  recoveryScore: ['Recovery score %', 'Recovery score', 'Recovery'],
  restingHeartRate: ['Resting heart rate (bpm)', 'Resting heart rate'],
  hrv: [
    'Heart rate variability (ms)',
    'Heart rate variability',
    'HRV (ms)',
    'HRV',
  ],
  skinTemp: ['Skin temp (celsius)', 'Skin temp', 'Skin temperature (celsius)'],
  spo2: ['Blood oxygen %', 'Blood oxygen', 'SpO2 %', 'SpO2'],
  strain: ['Day Strain', 'Strain'],
  energyExpended: ['Energy burned (cal)', 'Energy burned', 'Calories'],
  respiratoryRate: ['Respiratory rate (rpm)', 'Respiratory rate'],
}

export type SleepField =
  | 'id'
  | 'cycleStart'
  | 'cycleEnd'
  | 'sleepOnset'
  | 'wakeOnset'
  | 'isNap'
  | 'performance'
  | 'efficiency'
  | 'consistency'
  | 'respiratoryRate'
  | 'inBedMinutes'
  | 'awakeMinutes'
  | 'lightMinutes'
  | 'deepMinutes'
  | 'remMinutes'
  | 'needMinutes'
  | 'debtMinutes'
  | 'disturbanceCount'

export const SLEEP_ALIASES: Record<SleepField, string[]> = {
  id: ['Sleep id', 'Sleep ID'],
  cycleStart: ['Cycle start time', 'Cycle start'],
  cycleEnd: ['Cycle end time', 'Cycle end'],
  sleepOnset: ['Sleep onset', 'Onset'],
  wakeOnset: ['Wake onset', 'Wake time'],
  isNap: ['Nap'],
  performance: ['Sleep performance %', 'Sleep performance'],
  efficiency: ['Sleep efficiency %', 'Sleep efficiency'],
  consistency: ['Sleep consistency %', 'Sleep consistency'],
  respiratoryRate: ['Respiratory rate (rpm)', 'Respiratory rate'],
  inBedMinutes: ['In bed duration (min)', 'Time in bed (min)', 'In bed duration'],
  awakeMinutes: ['Awake duration (min)', 'Awake duration'],
  lightMinutes: ['Light sleep duration (min)', 'Light sleep duration'],
  deepMinutes: [
    'Deep (SWS) duration (min)',
    'Deep sleep duration (min)',
    'Deep (SWS) duration',
  ],
  remMinutes: ['REM duration (min)', 'REM duration'],
  needMinutes: ['Sleep need (min)', 'Sleep need'],
  debtMinutes: ['Sleep debt (min)', 'Sleep debt'],
  disturbanceCount: ['Sleep disturbances', 'Disturbances', 'Disturbance count'],
}

export type WorkoutField =
  | 'id'
  | 'sport'
  | 'start'
  | 'end'
  | 'durationMinutes'
  | 'strain'
  | 'averageHeartRate'
  | 'maxHeartRate'
  | 'energyExpended'
  | 'distanceMeters'
  | 'altitudeGainMeters'
  | 'zone1Minutes'
  | 'zone2Minutes'
  | 'zone3Minutes'
  | 'zone4Minutes'
  | 'zone5Minutes'

export const WORKOUT_ALIASES: Record<WorkoutField, string[]> = {
  id: ['Workout id', 'Activity id', 'Workout ID'],
  sport: ['Sport name', 'Activity name', 'Sport'],
  start: ['Workout start time', 'Start time', 'Start'],
  end: ['Workout end time', 'End time', 'End'],
  durationMinutes: ['Duration (min)', 'Duration'],
  strain: ['Activity Strain', 'Strain'],
  averageHeartRate: ['Average HR (bpm)', 'Average heart rate (bpm)', 'Average HR'],
  maxHeartRate: ['Max HR (bpm)', 'Max heart rate (bpm)', 'Max HR'],
  energyExpended: ['Energy burned (cal)', 'Calories'],
  distanceMeters: ['Distance (meters)', 'Distance (m)', 'Distance'],
  altitudeGainMeters: ['Altitude gain (meters)', 'Altitude gain (m)', 'Altitude gain'],
  zone1Minutes: ['HR Zone 1 (min)', 'HR Zone 1 %', 'Zone 1 duration (min)'],
  zone2Minutes: ['HR Zone 2 (min)', 'HR Zone 2 %', 'Zone 2 duration (min)'],
  zone3Minutes: ['HR Zone 3 (min)', 'HR Zone 3 %', 'Zone 3 duration (min)'],
  zone4Minutes: ['HR Zone 4 (min)', 'HR Zone 4 %', 'Zone 4 duration (min)'],
  zone5Minutes: ['HR Zone 5 (min)', 'HR Zone 5 %', 'Zone 5 duration (min)'],
}

export type JournalField =
  | 'id'
  | 'cycleStart'
  | 'cycleEnd'
  | 'questionText'
  | 'answeredYes'
  | 'notes'

export const JOURNAL_ALIASES: Record<JournalField, string[]> = {
  id: ['Journal entry id', 'Entry id'],
  cycleStart: ['Cycle start time', 'Cycle start'],
  cycleEnd: ['Cycle end time', 'Cycle end'],
  questionText: ['Question text', 'Question'],
  answeredYes: ['Answered yes', 'Answer'],
  notes: ['Notes'],
}
