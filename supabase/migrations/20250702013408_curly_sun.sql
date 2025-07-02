/*
  # Create recordings table for VoiceFlow AI

  1. New Tables
    - `recordings`
      - `id` (uuid, primary key)
      - `title` (text, recording title)
      - `duration` (integer, duration in seconds)
      - `created_at` (timestamptz, creation timestamp)
      - `audio_url` (text, URL to audio file in storage)
      - `file_size` (bigint, file size in bytes)
      - `status` (text, processing status)
      - Transcription fields:
        - `transcription_content` (text, transcribed text)
        - `transcription_confidence` (integer, confidence score)
        - `transcription_language` (text, detected language)
        - `transcription_speaker_count` (integer, number of speakers)
        - `transcription_timestamps` (jsonb, word-level timestamps)
      - Summary fields:
        - `summary_content` (text, AI-generated summary)
        - `summary_key_points` (text[], key points array)
        - `summary_topics` (text[], topics array)
        - `summary_sentiment_score` (numeric, sentiment score)
      - Report fields:
        - `report_content` (text, detailed analysis report)
        - `report_insights` (text[], insights array)
        - `report_metrics` (jsonb, analysis metrics)
        - `report_action_items` (text[], action items array)
        - `report_sentiment_analysis` (jsonb, sentiment analysis data)
      - `updated_at` (timestamptz, last update timestamp)

  2. Security
    - Enable RLS on `recordings` table
    - Add policies for public access (demo purposes)
    - In production, you would restrict access to authenticated users
*/

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  duration integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  audio_url text NOT NULL,
  file_size bigint NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Transcription fields
  transcription_content text,
  transcription_confidence integer,
  transcription_language text,
  transcription_speaker_count integer,
  transcription_timestamps jsonb,
  
  -- Summary fields
  summary_content text,
  summary_key_points text[],
  summary_topics text[],
  summary_sentiment_score numeric,
  
  -- Report fields
  report_content text,
  report_insights text[],
  report_metrics jsonb,
  report_action_items text[],
  report_sentiment_analysis jsonb,
  
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo purposes)
-- In production, you would restrict these to authenticated users
CREATE POLICY "Allow public read access to recordings"
  ON recordings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to recordings"
  ON recordings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to recordings"
  ON recordings
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access to recordings"
  ON recordings
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS recordings_created_at_idx ON recordings(created_at DESC);
CREATE INDEX IF NOT EXISTS recordings_status_idx ON recordings(status);
CREATE INDEX IF NOT EXISTS recordings_title_idx ON recordings USING gin(to_tsvector('english', title));

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_recordings_updated_at
  BEFORE UPDATE ON recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();