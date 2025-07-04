import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { 
  Mic, 
  Clock, 
  Brain, 
  TrendingUp,
  Users,
  FileAudio,
  Zap,
  Target
} from 'lucide-react';

interface AnalyticsOverviewProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getAnalyticsData() {
  try {
    // Get total recordings
    const { data: recordings, error } = await supabase
      .from('recordings')
      .select('*');

    if (error) throw error;

    const totalRecordings = recordings?.length || 0;
    const completedRecordings = recordings?.filter(r => r.status === 'completed').length || 0;
    const processingRecordings = recordings?.filter(r => r.status === 'processing').length || 0;
    const totalDuration = recordings?.reduce((sum, r) => sum + (r.duration || 0), 0) || 0;
    const totalSize = recordings?.reduce((sum, r) => sum + (r.file_size || 0), 0) || 0;

    // Calculate averages
    const avgDuration = totalRecordings > 0 ? Math.round(totalDuration / totalRecordings) : 0;
    const avgConfidence = recordings?.filter(r => r.transcription_confidence)
      .reduce((sum, r, _, arr) => sum + (r.transcription_confidence || 0) / arr.length, 0) || 0;

    // Calculate trends (mock data for demo)
    const weeklyGrowth = 12.5;
    const successRate = totalRecordings > 0 ? (completedRecordings / totalRecordings) * 100 : 0;

    return {
      totalRecordings,
      completedRecordings,
      processingRecordings,
      totalDuration,
      totalSize,
      avgDuration,
      avgConfidence,
      weeklyGrowth,
      successRate
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      totalRecordings: 0,
      completedRecordings: 0,
      processingRecordings: 0,
      totalDuration: 0,
      totalSize: 0,
      avgDuration: 0,
      avgConfidence: 0,
      weeklyGrowth: 0,
      successRate: 0
    };
  }
}

export async function AnalyticsOverview({ searchParams }: AnalyticsOverviewProps) {
  const data = await getAnalyticsData();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const cards = [
    {
      title: 'Total Recordings',
      value: data.totalRecordings.toLocaleString(),
      icon: Mic,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      trend: `+${data.weeklyGrowth}%`,
      trendColor: 'text-green-600'
    },
    {
      title: 'Completed Analysis',
      value: data.completedRecordings.toLocaleString(),
      icon: Brain,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      trend: `${data.successRate.toFixed(1)}% success rate`,
      trendColor: 'text-green-600'
    },
    {
      title: 'Total Duration',
      value: formatDuration(data.totalDuration),
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      trend: `${formatDuration(data.avgDuration)} avg`,
      trendColor: 'text-slate-600'
    },
    {
      title: 'Storage Used',
      value: formatFileSize(data.totalSize),
      icon: FileAudio,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      trend: `${data.totalRecordings} files`,
      trendColor: 'text-slate-600'
    },
    {
      title: 'Avg Confidence',
      value: `${data.avgConfidence.toFixed(1)}%`,
      icon: Target,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      trend: 'Transcription accuracy',
      trendColor: 'text-slate-600'
    },
    {
      title: 'Processing Queue',
      value: data.processingRecordings.toLocaleString(),
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      trend: 'Currently processing',
      trendColor: 'text-slate-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        
        return (
          <Card key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <IconComponent className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {card.value}
                </div>
                <div className="flex items-center space-x-2">
                  {card.trend.includes('+') && (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  )}
                  <span className={`text-xs ${card.trendColor}`}>
                    {card.trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}