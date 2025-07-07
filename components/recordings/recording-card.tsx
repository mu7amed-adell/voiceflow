'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatDuration, formatFileSize, formatRelativeTime } from '@/lib/utils/format';
import { Recording } from '@/lib/types/recording';
import { useRecordingsStore } from '@/lib/store/recordings-store';
import { 
  Play, 
  Pause, 
  Trash2, 
  Download,
  Clock,
  FileAudio,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
  RefreshCw,
  User,
  Calendar,
  Stethoscope
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface RecordingCardProps {
  recording: Recording;
  isSelected: boolean;
  onClick: () => void;
}

export function RecordingCard({ recording, isSelected, onClick }: RecordingCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const { deleteRecording } = useRecordingsStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteRecording(recording.id);
    toast.success('Recording deleted');
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = recording.audioUrl;
    a.download = `${recording.title}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Download started');
  };

  const handleReanalyze = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReanalyzing(true);
    
    try {
      const response = await fetch(`/api/recordings/${recording.id}/reanalyze`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reanalyze recording');
      }

      toast.success('Reanalysis started', {
        description: 'Your recording is being processed again with the latest AI models'
      });
    } catch (error) {
      console.error('Error reanalyzing recording:', error);
      toast.error('Failed to reanalyze recording', {
        description: 'Please try again later'
      });
    } finally {
      setIsReanalyzing(false);
    }
  };

  const togglePlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const getStatusIcon = () => {
    switch (recording.status) {
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (recording.status) {
      case 'processing':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'completed':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'failed':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      default:
        return 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg' 
          : 'bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-700/80 dark:to-slate-700/60 hover:from-white/90 hover:to-white/70 dark:hover:from-slate-700/90 dark:hover:to-slate-700/70'
      } backdrop-blur-sm border border-white/20 dark:border-slate-600/50`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100 mb-2">
              {recording.title}
            </h3>
            
            {/* Patient Information */}
            {recording.patientName && (
              <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300 mb-2">
                <span className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {recording.patientName}
                </span>
                {recording.sessionType && (
                  <span className="flex items-center">
                    <Stethoscope className="w-3 h-3 mr-1" />
                    {recording.sessionType}
                  </span>
                )}
                {recording.sessionDate && (
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(recording.sessionDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDuration(recording.duration)}
              </span>
              <span className="flex items-center">
                <FileAudio className="w-3 h-3 mr-1" />
                {formatFileSize(recording.size)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-3">
            {getStatusIcon()}
            <Badge variant="secondary" className={`text-xs font-medium border-0 ${getStatusColor()}`}>
              {recording.status}
            </Badge>
          </div>
        </div>

        {/* Processing Progress */}
        {recording.status === 'processing' && (
          <div className="mb-4">
            <Progress value={65} className="h-2 bg-blue-100 dark:bg-blue-900" />
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
              AI is analyzing {recording.patientName ? `${recording.patientName}'s` : 'your'} recording...
            </p>
          </div>
        )}

        {/* Quick Preview */}
        {recording.status === 'completed' && recording.transcription && (
          <div className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
            "{recording.transcription.content.substring(0, 120)}..."
          </div>
        )}

        {/* Failed State */}
        {recording.status === 'failed' && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              Processing failed. Try reanalyzing this recording.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {formatRelativeTime(recording.createdAt)}
          </span>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayback}
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-blue-600" />
              ) : (
                <Play className="w-4 h-4 text-blue-600" />
              )}
            </Button>
            
            {(recording.status === 'completed' || recording.status === 'failed') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReanalyze}
                disabled={isReanalyzing}
                className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                title="Reanalyze with AI"
              >
                {isReanalyzing ? (
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-600" />
                )}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/30"
            >
              <Download className="w-4 h-4 text-green-600" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}