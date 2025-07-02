'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Key,
  Upload,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

export function SupabaseSetupGuide() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    if (step < 6) {
      setCurrentStep(step + 1);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const migrationSQL = `/*
  # Create recordings table for VoiceFlow AI

  1. New Tables
    - recordings table with all necessary fields for audio processing
  2. Security
    - Enable RLS with public policies for demo
  3. Indexes
    - Performance indexes for common queries
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
CREATE POLICY "Allow public read access to recordings"
  ON recordings FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert access to recordings"
  ON recordings FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update access to recordings"
  ON recordings FOR UPDATE TO public USING (true);

CREATE POLICY "Allow public delete access to recordings"
  ON recordings FOR DELETE TO public USING (true);

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
  EXECUTE FUNCTION update_updated_at_column();`;

  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000`;

  const steps = [
    {
      id: 1,
      title: 'Create Supabase Project',
      description: 'Set up your Supabase project and get credentials',
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            First, you'll need to create a new Supabase project to store your recordings and data.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">1. Go to Supabase</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://supabase.com', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Supabase
              </Button>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <p>2. Click "Start your project"</p>
              <p>3. Sign up or log in to your account</p>
              <p>4. Create a new project with any name</p>
              <p>5. Wait for the project to be ready (~2 minutes)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Get API Credentials',
      description: 'Copy your project URL and API keys',
      icon: Key,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Once your project is ready, you'll need to get your API credentials.
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm font-medium mb-2">In your Supabase dashboard:</p>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <p>1. Go to Settings → API</p>
                <p>2. Copy your "Project URL"</p>
                <p>3. Copy your "anon public" key</p>
                <p>4. Copy your "service_role" key (keep this secret!)</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Set Environment Variables',
      description: 'Configure your local environment',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create a <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">.env.local</code> file in your project root with your credentials.
          </p>
          <div className="space-y-3">
            <div className="relative">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                {envTemplate}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(envTemplate, 'Environment template')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Replace the placeholder values with your actual Supabase credentials
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Run Database Migration',
      description: 'Create the recordings table and setup',
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Run this SQL in your Supabase SQL Editor to create the necessary tables.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium">1. Go to SQL Editor</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard/project/_/sql', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open SQL Editor
              </Button>
            </div>
            <div className="relative">
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                {migrationSQL}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(migrationSQL, 'Migration SQL')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              2. Paste the SQL and click "Run" to create the tables
            </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Create Storage Bucket',
      description: 'Set up file storage for audio recordings',
      icon: Upload,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create a storage bucket to store your audio recordings.
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm font-medium">1. Go to Storage</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard/project/_/storage/buckets', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Storage
              </Button>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
              <p>2. Click "Create a new bucket"</p>
              <p>3. Name it: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">audio-recordings</code></p>
              <p>4. Make it public (for demo purposes)</p>
              <p>5. Click "Create bucket"</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: 'Test Connection',
      description: 'Verify everything is working',
      icon: Play,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Run the setup script to test your connection and add sample data.
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm font-medium mb-2">Run in your terminal:</p>
              <code className="text-sm bg-slate-900 text-slate-100 px-2 py-1 rounded">
                npm run setup
              </code>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                This will test your connection and add sample recordings
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const isStepComplete = (stepId: number) => completedSteps.includes(stepId);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Supabase Setup Guide
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          Let's connect your VoiceFlow AI app to Supabase for real data storage and AI processing
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
              ${isStepComplete(step.id) 
                ? 'bg-green-500 border-green-500 text-white' 
                : currentStep === step.id 
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-600'
              }
            `}>
              {isStepComplete(step.id) ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-16 h-0.5 mx-2 transition-colors
                ${isStepComplete(step.id) ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step */}
      {currentStepData && (
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                  <currentStepData.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {currentStepData.description}
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                Step {currentStep} of {steps.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {currentStepData.content}
            
            <Separator className="my-4" />
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button 
                onClick={() => markStepComplete(currentStep)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {currentStep === steps.length ? 'Complete Setup' : 'Mark Complete & Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Steps Summary */}
      {completedSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Completed Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {steps
                .filter(step => isStepComplete(step.id))
                .map(step => (
                  <div key={step.id} className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Commands</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Check Environment</p>
              <code className="block text-xs bg-slate-900 text-slate-100 p-2 rounded">
                npm run setup:env
              </code>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Setup Supabase</p>
              <code className="block text-xs bg-slate-900 text-slate-100 p-2 rounded">
                npm run setup:supabase
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}