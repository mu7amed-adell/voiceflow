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
              <Card className="h-96 bg-gradient-to-br from-white/60 to-white/40 dark:from-slate-800/60 dark:to-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <path d="M12 19v4"/>
                        <path d="M8 23h8"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                      Select a Recording
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                      Choose a recording from your library to view detailed transcription, 
                      AI-generated summary, and comprehensive analysis
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Experience the future of voice analysis with cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎤"
              title="High-Quality Recording"
              description="Crystal-clear audio capture with real-time visualization and noise suppression"
            />
            <FeatureCard
              icon="🧠"
              title="AI-Powered Analysis"
              description="Advanced transcription, summarization, and insights using OpenAI or local Ollama"
            />
            <FeatureCard
              icon="🔒"
              title="Privacy First"
              description="Choose between cloud processing or completely private local AI analysis"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

// Import Card components
import { Card, CardContent } from '@/components/ui/card';