'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recording } from '@/lib/types/recording';
import { Copy, Download, Brain, CheckCircle, Target, Hash } from 'lucide-react';
import { toast } from 'sonner';

interface SummaryViewProps {
  recording: Recording;
}

export function SummaryView({ recording }: SummaryViewProps) {
  const handleCopySummary = () => {
    if (recording.summary?.content) {
      navigator.clipboard.writeText(recording.summary.content);
      toast.success('Summary copied to clipboard');
    }
  };

  const handleDownloadSummary = () => {
    if (recording.summary?.content) {
      const blob = new Blob([recording.summary.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.title}-summary.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Summary downloaded');
    }
  };

  if (recording.status === 'processing') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Generating summary...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            AI is analyzing your recording to extract key insights
          </p>
        </CardContent>
      </Card>
    );
  }

  if (recording.status === 'failed' || !recording.summary) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-xl">!</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Summary generation failed</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Unable to generate summary for this recording.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.1) return 'text-green-600 dark:text-green-400';
    if (score < -0.1) return 'text-red-600 dark:text-red-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  const getSentimentLabel = (score: number) => {
    if (score > 0.1) return 'Positive';
    if (score < -0.1) return 'Negative';
    return 'Neutral';
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
            <Brain className="w-3 h-3 mr-1" />
            AI Generated
          </Badge>
          {recording.summary.sentimentScore !== undefined && (
            <Badge variant="outline" className={getSentimentColor(recording.summary.sentimentScore)}>
              {getSentimentLabel(recording.summary.sentimentScore)}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopySummary}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadSummary}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Summary Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-500" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {recording.summary.content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Points */}
      {recording.summary.keyPoints && recording.summary.keyPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
              Key Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recording.summary.keyPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{point}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Topics */}
      {recording.summary.topics && recording.summary.topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Hash className="w-5 h-5 mr-2 text-blue-500" />
              Topics Discussed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {recording.summary.topics.map((topic: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {topic}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            Suggested Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Target className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">Follow up on key decisions</p>
                <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                  Review the main points discussed and create specific action items
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200">Share summary with stakeholders</p>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Distribute this summary to relevant team members or participants
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}