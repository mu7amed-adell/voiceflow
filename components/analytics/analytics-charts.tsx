'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity 
} from 'lucide-react';

interface AnalyticsChartsProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function AnalyticsCharts({ searchParams }: AnalyticsChartsProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setChartData({
        dailyRecordings: [
          { date: '2024-01-01', recordings: 12, duration: 145 },
          { date: '2024-01-02', recordings: 19, duration: 230 },
          { date: '2024-01-03', recordings: 8, duration: 98 },
          { date: '2024-01-04', recordings: 15, duration: 187 },
          { date: '2024-01-05', recordings: 22, duration: 276 },
          { date: '2024-01-06', recordings: 18, duration: 215 },
          { date: '2024-01-07', recordings: 25, duration: 312 }
        ],
        statusDistribution: [
          { name: 'Completed', value: 78, color: '#10b981' },
          { name: 'Processing', value: 12, color: '#f59e0b' },
          { name: 'Failed', value: 5, color: '#ef4444' },
          { name: 'Pending', value: 5, color: '#6b7280' }
        ],
        aiProviderUsage: [
          { provider: 'OpenAI', count: 45, percentage: 75 },
          { provider: 'Ollama', count: 15, percentage: 25 }
        ],
        confidenceScores: [
          { range: '90-100%', count: 42 },
          { range: '80-89%', count: 28 },
          { range: '70-79%', count: 15 },
          { range: '60-69%', count: 8 },
          { range: '<60%', count: 3 }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, [searchParams]);

  if (isLoading) {
    return (
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading analytics charts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
          Analytics Charts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recordings" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="recordings">
              <TrendingUp className="w-4 h-4 mr-2" />
              Recordings
            </TabsTrigger>
            <TabsTrigger value="status">
              <PieChartIcon className="w-4 h-4 mr-2" />
              Status
            </TabsTrigger>
            <TabsTrigger value="providers">
              <BarChart3 className="w-4 h-4 mr-2" />
              AI Providers
            </TabsTrigger>
            <TabsTrigger value="confidence">
              <Activity className="w-4 h-4 mr-2" />
              Confidence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recordings" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Daily Recording Activity</h3>
                <Badge variant="outline">Last 7 days</Badge>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.dailyRecordings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => [value, name === 'recordings' ? 'Recordings' : 'Duration (min)']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="recordings" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="status" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recording Status Distribution</h3>
                <Badge variant="outline">Current status</Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.statusDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {chartData.statusDistribution.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary">{item.value}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="providers" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI Provider Usage</h3>
                <Badge variant="outline">Analysis provider</Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.aiProviderUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="provider" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {chartData.aiProviderUsage.map((provider: any, index: number) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{provider.provider}</span>
                      <Badge variant="outline">{provider.percentage}%</Badge>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {provider.count}
                    </div>
                    <div className="text-sm text-slate-500">recordings processed</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="confidence" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Transcription Confidence Scores</h3>
                <Badge variant="outline">Accuracy distribution</Badge>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.confidenceScores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}