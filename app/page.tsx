'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { VoiceRecorder } from '@/components/voice/voice-recorder';
import { RecordingsList } from '@/components/recordings/recordings-list';
import { RecordingDetail } from '@/components/recordings/recording-detail';
import { useRecordingsStore } from '@/lib/store/recordings-store';

export default function Home() {
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const { recordings } = useRecordingsStore();

  const selectedRecordingData = selectedRecording 
    ? recordings.find(r => r.id === selectedRecording) 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recording Interface */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <VoiceRecorder />
            </div>
          </div>

          {/* Middle Column - Recordings List */}
          <div className="lg:col-span-1">
            <RecordingsList 
              onSelectRecording={setSelectedRecording}
              selectedRecording={selectedRecording}
            />
          </div>

          {/* Right Column - Recording Details */}
          <div className="lg:col-span-1">
            {selectedRecordingData ? (
              <RecordingDetail 
                recording={selectedRecordingData}
                onClose={() => setSelectedRecording(null)}
              />
            ) : (
              <div className="h-96 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <path d="M12 19v4"/>
                      <path d="M8 23h8"/>
                    </svg>
                  </div>
                  <p className="font-medium">Select a recording</p>
                  <p className="text-sm">Choose a recording to view transcription and analysis</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}