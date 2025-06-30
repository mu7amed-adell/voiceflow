'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AudioVisualizer } from './audio-visualizer';
import { VolumeIndicator } from './volume-indicator';
import { useRecordingsStore } from '@/lib/store/recordings-store';
import { formatDuration } from '@/lib/utils/format';
import { 
  Mic, 
  Square, 
  Pause, 
  Play,
  Save,
  Trash2,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export function VoiceRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  const { addRecording } = useRecordingsStore();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioData = () => {
        if (analyserRef.current && recordingState === 'recording') {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(average / 255);
          setAudioData(Array.from(dataArray).slice(0, 64));
          animationRef.current = requestAnimationFrame(updateAudioData);
        }
      };

      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start(100);
      setRecordingState('recording');
      setDuration(0);
      
      // Start timer
      intervalRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Start audio visualization
      updateAudioData();
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  }, [recordingState]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      toast.info('Recording paused');
    }
  }, [recordingState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      
      intervalRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      const updateAudioData = () => {
        if (analyserRef.current && recordingState === 'recording') {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
          setAudioLevel(average / 255);
          setAudioData(Array.from(dataArray).slice(0, 64));
          animationRef.current = requestAnimationFrame(updateAudioData);
        }
      };
      
      updateAudioData();
      toast.info('Recording resumed');
    }
  }, [recordingState]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
      mediaRecorderRef.current.stop();
      setRecordingState('stopped');
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
      
      setAudioLevel(0);
      setAudioData([]);
      
      toast.success('Recording stopped');
    }
  }, [recordingState]);

  const saveRecording = useCallback(() => {
    if (chunksRef.current.length > 0) {
      const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const recording = {
        id: Date.now().toString(),
        title: `Recording ${new Date().toLocaleString()}`,
        duration,
        createdAt: new Date(),
        audioUrl,
        size: audioBlob.size,
        status: 'processing' as const,
        transcription: null,
        summary: null,
        report: null
      };

      addRecording(recording);
      
      // Simulate processing with delay
      setTimeout(() => {
        useRecordingsStore.getState().updateRecordingStatus(recording.id, 'completed');
      }, 2000);
      
      // Reset state
      chunksRef.current = [];
      setRecordingState('idle');
      setDuration(0);
      
      toast.success('Recording saved successfully!');
    }
  }, [duration, addRecording]);

  const discardRecording = useCallback(() => {
    chunksRef.current = [];
    setRecordingState('idle');
    setDuration(0);
    setAudioLevel(0);
    setAudioData([]);
    toast.info('Recording discarded');
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  const getStatusColor = () => {
    switch (recordingState) {
      case 'recording': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      case 'stopped': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Voice Recorder</span>
          <Badge variant="outline" className={`${getStatusColor()} text-white border-transparent`}>
            {recordingState === 'idle' ? 'Ready' : recordingState.charAt(0).toUpperCase() + recordingState.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Audio Visualizer */}
        <div className="h-24 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 flex items-center justify-center">
          <AudioVisualizer 
            audioData={audioData} 
            isRecording={recordingState === 'recording'} 
          />
        </div>

        {/* Volume Indicator */}
        <VolumeIndicator level={audioLevel} />

        {/* Duration and Progress */}
        {(recordingState !== 'idle') && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{formatDuration(duration)}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {Math.round((chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0) / 1024 / 1024) * 100) / 100} MB
              </span>
            </div>
            {recordingState === 'recording' && (
              <Progress value={(duration % 60) / 60 * 100} className="h-1" />
            )}
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex flex-col space-y-3">
          {recordingState === 'idle' && (
            <Button 
              onClick={startRecording}
              className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </Button>
          )}

          {recordingState === 'recording' && (
            <div className="flex space-x-2">
              <Button 
                onClick={pauseRecording}
                variant="outline"
                className="flex-1 h-12"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
              <Button 
                onClick={stopRecording}
                variant="destructive"
                className="flex-1 h-12"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop
              </Button>
            </div>
          )}

          {recordingState === 'paused' && (
            <div className="flex space-x-2">
              <Button 
                onClick={resumeRecording}
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
              <Button 
                onClick={stopRecording}
                variant="destructive"
                className="flex-1 h-12"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop
              </Button>
            </div>
          )}

          {recordingState === 'stopped' && (
            <div className="flex space-x-2">
              <Button 
                onClick={saveRecording}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Recording
              </Button>
              <Button 
                onClick={discardRecording}
                variant="destructive"
                size="lg"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Recording Tips */}
        {recordingState === 'idle' && (
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <p>💡 <strong>Tips for better recordings:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Find a quiet environment</li>
              <li>Speak clearly and at normal pace</li>
              <li>Keep microphone 6-12 inches away</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}