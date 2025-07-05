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
  Mic2,
  Sparkles,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface RecordingDetailProps {
  recording: Recording;
  onClose: () => void;
}

export function RecordingDetail({ recording, onClose }: RecordingDetailProps) {
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = recording.audioUrl;
    a.download = `${recording.title}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Download started');
  };

  const handleReanalyze = async () => {
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
    <Card className="h-full bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl truncate pr-4 font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              {recording.title}
            </CardTitle>
            <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatRelativeTime(recording.createdAt)}
              </span>
              <Badge className={`${getStatusColor()} border-0 font-medium`}>
                {recording.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {(recording.status === 'completed' || recording.status === 'failed') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReanalyze}
                disabled={isReanalyzing}
                className="hover:bg-purple-100 dark:hover:bg-purple-900/30"
                title="Reanalyze with AI"
              >
                {isReanalyzing ? (
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-600" />
                )}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleDownload} className="hover:bg-green-100 dark:hover:bg-green-900/30">
              <Download className="w-4 h-4 text-green-600" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-blue-100 dark:hover:bg-blue-900/30">
              <Share2 className="w-4 h-4 text-blue-600" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
              <Edit className="w-4 h-4 text-slate-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-red-100 dark:hover:bg-red-900/30">
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Audio Player */}
        <AudioPlayer audioUrl={recording.audioUrl} />

        {/* Recording Info */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">{formatDuration(recording.duration)}</p>
            <p className="text-xs text-blue-600 dark:text-blue-300">Duration</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
            <FileAudio className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-semibold text-green-900 dark:text-green-100">{formatFileSize(recording.size)}</p>
            <p className="text-xs text-green-600 dark:text-green-300">File Size</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <Mic2 className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">WebM</p>
            <p className="text-xs text-purple-600 dark:text-purple-300">Format</p>
          </div>
        </div>

        <Separator className="bg-slate-200 dark:bg-slate-700" />

        {/* Content Tabs */}
        <Tabs defaultValue="transcription" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="transcription" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              Transcription
            </TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              Summary
            </TabsTrigger>
            <TabsTrigger value="report" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
              Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transcription" className="mt-6">
            <TranscriptionView recording={recording} />
          </TabsContent>
          
          <TabsContent value="summary" className="mt-6">
            <SummaryView recording={recording} />
          </TabsContent>
          
          <TabsContent value="report" className="mt-6">
            <ReportView recording={recording} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}