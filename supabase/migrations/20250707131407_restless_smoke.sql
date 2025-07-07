/*
  # Add patient fields to recordings table

  1. New Columns
    - `patient_name` (text, patient's name)
    - `session_date` (date, session date)
    - `session_type` (text, type of session)

  2. Updates
    - Add new columns to existing recordings table
    - Create indexes for better performance on patient queries
*/

-- Add patient-related columns to recordings table
ALTER TABLE recordings 
ADD COLUMN IF NOT EXISTS patient_name text,
ADD COLUMN IF NOT EXISTS session_date date,
ADD COLUMN IF NOT EXISTS session_type text;

-- Create indexes for patient-related queries
CREATE INDEX IF NOT EXISTS recordings_patient_name_idx ON recordings(patient_name);
CREATE INDEX IF NOT EXISTS recordings_session_date_idx ON recordings(session_date DESC);
CREATE INDEX IF NOT EXISTS recordings_session_type_idx ON recordings(session_type);

-- Create composite index for patient + date queries
CREATE INDEX IF NOT EXISTS recordings_patient_date_idx ON recordings(patient_name, session_date DESC);