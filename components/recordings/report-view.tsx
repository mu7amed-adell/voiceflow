'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Recording } from '@/lib/types/recording';
import { formatDuration } from '@/lib/utils/format';
import { 
  Copy, 
  Download, 
  BarChart3, 
  Clock, 
  TrendingUp,
  Users,
  Zap,
  Heart,
  Brain,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportViewProps {
  recording: Recording;
}

export function ReportView({ recording }: ReportViewProps) {
  const handleCopyReport = () => {
    if (recording.report?.content) {
      navigator.clipboard.writeText(recording.report.content);
      toast.success('Report copied to clipboard');
    }
  };

  const handleDownloadReport = () => {
    if (recording.report?.content) {
      const blob = new Blob([recording.report.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recording.title}-analysis-report.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    }
  };

  if (recording.status === 'processing') {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Generating analysis report...</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Advanced AI is analyzing conversation patterns and insights
          </p>
        </CardContent>
      </Card>
    );
  }

  if (recording.status === 'failed' || !recording.report) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 dark:text-red-400 text-xl">!</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Analysis report failed</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Unable to generate analysis report for this recording.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Mock analysis data for demonstration
  const analysisData = {
    speakingTime: 85,
    pauseFrequency: 12,
    wordsPerMinute: 145,
    sentimentScore: 0.3,
    confidenceLevel: 92,
    topicCoverage: 7,
    engagementScore: 78
  };

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
            <BarChart3 className="w-3 h-3 mr-1" />
            AI Analysis
          </Badge>
          <Badge variant="outline">
            {analysisData.confidenceLevel}% Confidence
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCopyReport}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Speaking Time</p>
              <p className="text-lg font-semibold">{analysisData.speakingTime}%</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">WPM</p>
              <p className="text-lg font-semibold">{analysisData.wordsPerMinute}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sentiment</p>
              <p className="text-lg font-semibold text-green-600">Positive</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Engagement</p>
              <p className="text-lg font-semibold">{analysisData.engagementScore}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-indigo-500" />
            Conversation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Speaking Patterns */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Speaking Patterns</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Speech Clarity</span>
                <span>{analysisData.confidenceLevel}%</span>
              </div>
              <Progress value={analysisData.confidenceLevel} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Speaking Time</span>
                <span>{analysisData.speakingTime}%</span>
              </div>
              <Progress value={analysisData.speakingTime} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Engagement Level</span>
                <span>{analysisData.engagementScore}%</span>
              </div>
              <Progress value={analysisData.engagementScore} className="h-2" />
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Key Insights</h4>
            
            <div className="grid gap-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Brain className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Clear Communication</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                    Your speech shows excellent clarity with {analysisData.confidenceLevel}% recognition confidence
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Optimal Pace</p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Speaking at {analysisData.wordsPerMinute} WPM - ideal for comprehension
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Users className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-800 dark:text-purple-200">Engagement Quality</p>
                  <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                    High engagement score indicates focused and purposeful communication
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 dark:text-slate-300">Recommendations</h4>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Continue with current speaking pace and clarity</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Consider adding more pauses for emphasis on key points</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Excellent emotional tone - maintain positive sentiment</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Brain className="w-5 h-5 mr-2 text-indigo-500" />
            Detailed Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border-l-4 border-indigo-500">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {recording.report.content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}