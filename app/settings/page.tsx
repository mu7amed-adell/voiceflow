'use client';

import { Header } from '@/components/layout/header';
import { AIProviderSelector } from '@/components/voice/ai-provider-selector';
import { TranscriptionProviderSelector } from '@/components/voice/transcription-provider-selector';
import { useSettingsStore } from '@/lib/store/settings-store';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { 
    selectedProvider, 
    selectedTranscriptionProvider,
    setSelectedProvider,
    setSelectedTranscriptionProvider
  } = useSettingsStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-200">
            Settings
          </h1>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 space-y-8">
            
            {/* Transcription Provider Section */}
            <div id="transcription-provider">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Transcription Provider</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Choose your preferred speech-to-text service for converting audio to text.
              </p>
              <TranscriptionProviderSelector
                selectedProvider={selectedTranscriptionProvider}
                onProviderChange={setSelectedTranscriptionProvider}
              />
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700/50" />

            {/* AI Provider Section */}
            <div id="ai-provider">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">AI Analysis Provider</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Choose your preferred AI model for generating summaries and analysis reports.
              </p>
              <AIProviderSelector
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
              />
            </div>

            <Separator className="bg-slate-200 dark:bg-slate-700/50" />

            {/* Appearance Section */}
            <div id="appearance">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Appearance</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Customize the look and feel of the application.
              </p>
              <div className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700">
                Theme settings coming soon
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}