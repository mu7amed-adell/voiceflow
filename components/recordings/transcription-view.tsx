'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recording } from '@/lib/types/recording';
import { Copy, Download, Search, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface TranscriptionViewProps {
  recording: Recording;
}

export function TranscriptionView({ recording }: TranscriptionViewProps) {
  const handleCopyTranscription = () => {
    if (recording.transcription?.content) {
      navigator.clipboard.writeText(recording.transcription.content);
      toast.success('Transcription copied to clipboard');
    }
  };

  const handleDownloadTranscription = () => {
    if (recording.transcription?.content) {
      const blob = new Blob([recording.transcription.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.title}-transcription.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Transcription downloaded');
    }
  };

  if (recording.status === 'processing') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Processing transcription...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Our AI agents are converting your speech to text
          </p>
        </CardContent>
      </Card>
    );
  }

  if (recording.status === 'failed' || !recording.transcription) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-xl">!</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Transcription failed</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Unable to process this recording. Please try re-recording.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            <Search className="w-3 h-3 mr-1" />
            {recording.transcription.confidence || 95}% Confidence
          </Badge>
          <Badge variant="outline">
            <Volume2 className="w-3 h-3 mr-1" />
            {recording.transcription.language || 'English'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyTranscription}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadTranscription}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Transcription Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Search className="w-5 h-5 mr-2 text-blue-500" />
            Transcription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4 border-blue-500">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {recording.transcription.content}
              </p>
            </div>
          </div>

          {/* Word-level timestamps (if available) */}
          {recording.transcription.timestamps && (
            <div className="mt-6">
              <h4 className="font-medium text-sm text-slate-600 dark:text-slate-300 mb-3">
                Timestamped Segments
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {recording.transcription.timestamps.map((segment: any, index: number) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-sm"
                  >
                    <span className="text-blue-500 font-mono text-xs">
                      {Math.floor(segment.start / 60)}:{(segment.start % 60).toFixed(1).padStart(4, '0')}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {segment.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speaker Information */}
          {recording.transcription.speakerCount && recording.transcription.speakerCount > 1 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Multi-speaker detected:</strong> {recording.transcription.speakerCount} speakers identified
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}