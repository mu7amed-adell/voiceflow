'use client';

import { Header } from '@/components/layout/header';
import { AIProviderSelector } from '@/components/voice/ai-provider-selector';
import { useSettingsStore } from '@/lib/store/settings-store';

export default function SettingsPage() {
  const { selectedProvider, setSelectedProvider } = useSettingsStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-200">
            Settings
          </h1>
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 space-y-8">
            <div id="ai-provider">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">AI Provider</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Choose your preferred AI model for transcription analysis.
              </p>
              <AIProviderSelector
                selectedProvider={selectedProvider}
                onProviderChange={setSelectedProvider}
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700/50"></div>

            <div id="appearance">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Appearance</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Customize the look and feel of the application.
              </p>
              <div className="h-32 bg-slate-100 dark:bg-slate-800/50 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-300 dark:border-slate-700">
                Placeholder for Appearance Settings
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}