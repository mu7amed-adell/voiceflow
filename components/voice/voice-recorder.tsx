'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AudioVisualizer } from './audio-visualizer';
import { VolumeIndicator } from './volume-indicator';
import { useRecordingsStore } from '@/lib/store/recordings-store';
import { useSettingsStore } from '@/lib/store/settings-store';
import { formatDuration } from '@/lib/utils/format';
import { 
  Mic, 
  Square, 
  Pause, 
  Play,
  Save,
  Trash2,
  Upload,
  Loader2,
  Sparkles,
  FileAudio,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped' | 'uploading';

interface PatientDetails {
  name: string;
  date: string;
  sessionType: string;
}

export function VoiceRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioData, setAudioData] = useState<number[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    name: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    sessionType: 'Consultation'
  });
  
  const { selectedProvider: selectedAIProvider, selectedTranscriptionProvider } = useSettingsStore();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addRecording, isLoading, error } = useRecordingsStore();

  const generatePatientRecordingTitle = useCallback(() => {
    const { name, date, sessionType } = patientDetails;
    
    if (!name.trim()) {
      return `Recording ${new Date().toLocaleString()}`;
    }
    
    const patientName = name.trim().replace(/\s+/g, '_');
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).replace(':', '');
    
    return `${patientName}_${sessionType}_${formattedDate}_${timestamp}`;
  }, [patientDetails]);

  const updateAudioVisualization = useCallback(() => {
    if (analyserRef.current && recordingState === 'recording') {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setAudioLevel(average / 255);
      
      // Create visualization data (take every 4th sample for smoother animation)
      const visualData = [];
      for (let i = 0; i < bufferLength; i += 4) {
        visualData.push(dataArray[i]);
      }
      setAudioData(visualData.slice(0, 64));
      
      animationRef.current = requestAnimationFrame(updateAudioVisualization);
    }
  }, [recordingState]);

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
      
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;

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
      chunksRef.current = [];
      
      // Start timer
      intervalRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Start audio visualization
      updateAudioVisualization();
      
      toast.success('Recording started', {
        description: 'Speak clearly into your microphone'
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording', {
        description: 'Please check microphone permissions'
      });
    }
  }, [updateAudioVisualization]);

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
      setAudioLevel(0);
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

      updateAudioVisualization();
      toast.info('Recording resumed');
    }
  }, [recordingState, updateAudioVisualization]);

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

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast.error('Invalid file type', {
          description: 'Please select an audio file'
        });
        return;
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File too large', {
          description: 'Please select a file smaller than 50MB'
        });
        return;
      }

      setUploadedFile(file);
      toast.success('Audio file selected', {
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`
      });
    }
  }, []);

  const uploadAudioFile = useCallback(async () => {
    if (!uploadedFile) return;

    // Validate patient details
    if (!patientDetails.name.trim()) {
      toast.error('Patient name required', {
        description: 'Please enter the patient name before processing'
      });
      return;
    }

    setRecordingState('uploading');
    
    try {
      const title = generatePatientRecordingTitle();
      
      // Estimate duration (rough calculation based on file size)
      const estimatedDuration = Math.round(uploadedFile.size / (128 * 1024 / 8)); // Assuming 128kbps
      
      const formData = new FormData();
      formData.append('audio', uploadedFile);
      formData.append('title', title);
      formData.append('duration', estimatedDuration.toString());
      formData.append('aiProvider', selectedAIProvider);
      formData.append('transcriptionProvider', selectedTranscriptionProvider);
      formData.append('patientName', patientDetails.name);
      formData.append('sessionDate', patientDetails.date);
      formData.append('sessionType', patientDetails.sessionType);

      const response = await fetch('/api/upload-recording', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      const data = await response.json();
      
      // Add to store
      await addRecording(uploadedFile, title, estimatedDuration);
      
      // Reset state
      setUploadedFile(null);
      setRecordingState('idle');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast.success('Audio uploaded successfully!', {
        description: `Processing ${patientDetails.name}'s ${patientDetails.sessionType.toLowerCase()}`
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setRecordingState('idle');
      toast.error('Failed to upload audio', {
        description: 'Please try again'
      });
    }
  }, [uploadedFile, selectedAIProvider, selectedTranscriptionProvider, addRecording, patientDetails, generatePatientRecordingTitle]);

  const saveRecording = useCallback(async () => {
    if (chunksRef.current.length > 0) {
      // Validate patient details
      if (!patientDetails.name.trim()) {
        toast.error('Patient name required', {
          description: 'Please enter the patient name before saving'
        });
        return;
      }

      setRecordingState('uploading');
      
      try {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const title = generatePatientRecordingTitle();
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('title', title);
        formData.append('duration', duration.toString());
        formData.append('aiProvider', selectedAIProvider);
        formData.append('transcriptionProvider', selectedTranscriptionProvider);
        formData.append('patientName', patientDetails.name);
        formData.append('sessionDate', patientDetails.date);
        formData.append('sessionType', patientDetails.sessionType);

        const response = await fetch('/api/upload-recording', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload recording');
        }

        await addRecording(audioBlob, title, duration);
        
        chunksRef.current = [];
        setRecordingState('idle');
        setDuration(0);
        
        toast.success('Recording saved successfully!', {
          description: `Processing ${patientDetails.name}'s ${patientDetails.sessionType.toLowerCase()}`
        });
      } catch (error) {
        console.error('Error saving recording:', error);
        setRecordingState('stopped');
        toast.error('Failed to save recording', {
          description: 'Please try again'
        });
      }
    }
  }, [duration, selectedAIProvider, selectedTranscriptionProvider, addRecording, patientDetails, generatePatientRecordingTitle]);

  const discardRecording = useCallback(() => {
    chunksRef.current = [];
    setRecordingState('idle');
    setDuration(0);
    setAudioLevel(0);
    setAudioData([]);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      case 'recording': return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'paused': return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
      case 'stopped': return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'uploading': return 'bg-gradient-to-r from-purple-500 to-purple-600';
      default: return 'bg-gradient-to-r from-slate-400 to-slate-500';
    }
  };

  const getStatusText = () => {
    switch (recordingState) {
      case 'uploading': return 'Processing';
      case 'idle': return 'Ready to Record';
      default: return recordingState.charAt(0).toUpperCase() + recordingState.slice(1);
    }
  };

  return (
    <Card className="w-full bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-xl font-bold">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Mic className="w-6 h-6" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Voice Studio
            </span>
          </div>
          <Badge variant="outline" className={`${getStatusColor()} text-white border-transparent px-4 py-1 font-medium`}>
            <div className="flex items-center space-x-2">
              {recordingState === 'recording' && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
              <span>{getStatusText()}</span>
            </div>
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* Patient Details Form */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Patient Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientName" className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Patient Name *
              </Label>
              <Input
                id="patientName"
                type="text"
                placeholder="Enter patient name"
                value={patientDetails.name}
                onChange={(e) => setPatientDetails(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/70 dark:bg-slate-700/70 border-blue-200 dark:border-blue-700 focus:border-blue-500"
                disabled={recordingState === 'recording' || recordingState === 'uploading'}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessionDate" className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Session Date
              </Label>
              <Input
                id="sessionDate"
                type="date"
                value={patientDetails.date}
                onChange={(e) => setPatientDetails(prev => ({ ...prev, date: e.target.value }))}
                className="bg-white/70 dark:bg-slate-700/70 border-blue-200 dark:border-blue-700 focus:border-blue-500"
                disabled={recordingState === 'recording' || recordingState === 'uploading'}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="sessionType" className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Session Type
              </Label>
              <select
                id="sessionType"
                value={patientDetails.sessionType}
                onChange={(e) => setPatientDetails(prev => ({ ...prev, sessionType: e.target.value }))}
                className="w-full px-3 py-2 bg-white/70 dark:bg-slate-700/70 border border-blue-200 dark:border-blue-700 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                disabled={recordingState === 'recording' || recordingState === 'uploading'}
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Therapy">Therapy Session</option>
                <option value="Assessment">Assessment</option>
                <option value="Treatment">Treatment</option>
                <option value="Review">Review</option>
                <option value="Emergency">Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          {patientDetails.name && (
            <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Recording will be saved as:</strong> {generatePatientRecordingTitle()}
              </p>
            </div>
          )}
        </div>

        {/* Audio Visualizer */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
            <AudioVisualizer 
              audioData={audioData} 
              isRecording={recordingState === 'recording'} 
            />
          </div>
          {recordingState === 'recording' && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-2 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>LIVE</span>
              </div>
            </div>
          )}
        </div>

        {/* Volume Indicator */}
        <VolumeIndicator level={audioLevel} />

        {/* Duration and Progress */}
        {(recordingState !== 'idle' || uploadedFile) && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-lg">
                {uploadedFile ? uploadedFile.name : formatDuration(duration)}
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {uploadedFile 
                  ? `${(uploadedFile.size / 1024 / 1024).toFixed(1)} MB`
                  : `${Math.round((chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0) / 1024 / 1024) * 100) / 100} MB`
                }
              </span>
            </div>
            {recordingState === 'recording' && (
              <Progress value={(duration % 60) / 60 * 100} className="h-2 bg-slate-200 dark:bg-slate-700" />
            )}
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex flex-col space-y-4">
          {recordingState === 'idle' && !uploadedFile && (
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={startRecording}
                disabled={isLoading || !patientDetails.name.trim()}
                className="h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
              
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={!patientDetails.name.trim()}
                />
                <Button 
                  variant="outline"
                  disabled={!patientDetails.name.trim()}
                  className="w-full h-14 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Audio
                </Button>
              </div>
            </div>
          )}

          {!patientDetails.name.trim() && recordingState === 'idle' && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                Please enter patient name before recording or uploading audio
              </p>
            </div>
          )}

          {uploadedFile && recordingState === 'idle' && (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3">
                  <FileAudio className="w-8 h-8 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">{uploadedFile.name}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB • Ready to process for {patientDetails.name}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={uploadAudioFile}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Process Recording
                </Button>
                <Button 
                  onClick={discardRecording}
                  variant="outline"
                  className="h-12 px-6 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {recordingState === 'recording' && (
            <div className="flex space-x-3">
              <Button 
                onClick={pauseRecording}
                variant="outline"
                className="flex-1 h-12 border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
              <Button 
                onClick={stopRecording}
                className="flex-1 h-12 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop
              </Button>
            </div>
          )}

          {recordingState === 'paused' && (
            <div className="flex space-x-3">
              <Button 
                onClick={resumeRecording}
                className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
              <Button 
                onClick={stopRecording}
                className="flex-1 h-12 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop
              </Button>
            </div>
          )}

          {recordingState === 'stopped' && (
            <div className="flex space-x-3">
              <Button 
                onClick={saveRecording}
                disabled={isLoading}
                className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg"
              >
                <Save className="w-5 h-5 mr-2" />
                Save & Process
              </Button>
              <Button 
                onClick={discardRecording}
                variant="outline"
                disabled={isLoading}
                className="h-12 px-6 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          )}

          {recordingState === 'uploading' && (
            <Button 
              disabled
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold"
            >
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing {patientDetails.name}'s {patientDetails.sessionType.toLowerCase()}...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}