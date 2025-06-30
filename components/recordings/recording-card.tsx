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
  XCircle
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

  const togglePlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    // In a real app, you'd control audio playback here
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20' 
          : 'bg-white/60 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80'
      } backdrop-blur-sm border-slate-200/50 dark:border-slate-600/50`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate text-slate-900 dark:text-slate-100 mb-1">
              {recording.title}
            </h3>
            <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
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
          
          <div className="flex items-center space-x-1 ml-2">
            {getStatusIcon()}
            <Badge variant="secondary" className={`text-xs ${getStatusColor()}`}>
              {recording.status}
            </Badge>
          </div>
        </div>

        {/* Processing Progress */}
        {recording.status === 'processing' && (
          <div className="mb-3">
            <Progress value={65} className="h-1" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Processing transcription...
            </p>
          </div>
        )}

        {/* Quick Stats */}
        {recording.status === 'completed' && recording.transcription && (
          <div className="text-xs text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
            {recording.transcription.content.substring(0, 120)}...
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {formatRelativeTime(recording.createdAt)}
          </span>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayback}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}