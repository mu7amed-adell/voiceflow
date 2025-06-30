'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TranscriptionView } from './transcription-view';
import { SummaryView } from './summary-view';
import { ReportView } from './report-view';
import { AudioPlayer } from './audio-player';
import { Recording } from '@/lib/types/recording';
import { formatDuration, formatFileSize, formatRelativeTime } from '@/lib/utils/format';
import { 
  X, 
  Download, 
  Share2, 
  Edit,
  Clock,
  FileAudio,
  Calendar,
  Mic2
} from 'lucide-react';

interface RecordingDetailProps {
  recording: Recording;
  onClose: () => void;
}

export function RecordingDetail({ recording, onClose }: RecordingDetailProps) {
  const handleDownload = () => {
    // Download functionality
    const a = document.createElement('a');
    a.href = recording.audioUrl;
    a.download = `${recording.title}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    <Card className="h-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate pr-4">
              {recording.title}
            </CardTitle>
            <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatRelativeTime(recording.createdAt)}
              </span>
              <Badge className={getStatusColor()}>
                {recording.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Audio Player */}
        <AudioPlayer audioUrl={recording.audioUrl} />

        {/* Recording Info */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-sm font-medium">{formatDuration(recording.duration)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <FileAudio className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-sm font-medium">{formatFileSize(recording.size)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">File Size</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <Mic2 className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-sm font-medium">WebM</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Format</p>
          </div>
        </div>

        <Separator />

        {/* Content Tabs */}
        <Tabs defaultValue="transcription" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transcription">Transcription</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="report">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transcription" className="mt-4">
            <TranscriptionView recording={recording} />
          </TabsContent>
          
          <TabsContent value="summary" className="mt-4">
            <SummaryView recording={recording} />
          </TabsContent>
          
          <TabsContent value="report" className="mt-4">
            <ReportView recording={recording} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}