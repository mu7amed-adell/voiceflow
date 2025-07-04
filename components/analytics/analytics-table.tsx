'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  MoreHorizontal,
  Play,
  Download,
  Trash2,
  Eye,
  Clock,
  Brain,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AnalyticsTableProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

interface Recording {
  id: string;
  title: string;
  duration: number;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed' | 'pending';
  aiProvider: 'openai' | 'ollama';
  confidence: number;
  fileSize: number;
  transcriptionLength: number;
}

export function AnalyticsTable({ searchParams }: AnalyticsTableProps) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      const mockRecordings: Recording[] = [
        {
          id: '1',
          title: 'Team Meeting - Q1 Planning',
          duration: 1847,
          createdAt: '2024-01-07T10:30:00Z',
          status: 'completed',
          aiProvider: 'openai',
          confidence: 94,
          fileSize: 2456789,
          transcriptionLength: 1250
        },
        {
          id: '2',
          title: 'Client Feedback Session',
          duration: 892,
          createdAt: '2024-01-07T14:15:00Z',
          status: 'completed',
          aiProvider: 'ollama',
          confidence: 87,
          fileSize: 1234567,
          transcriptionLength: 680
        },
        {
          id: '3',
          title: 'Daily Standup',
          duration: 456,
          createdAt: '2024-01-07T09:00:00Z',
          status: 'processing',
          aiProvider: 'openai',
          confidence: 0,
          fileSize: 567890,
          transcriptionLength: 0
        },
        {
          id: '4',
          title: 'Product Demo Rehearsal',
          duration: 1234,
          createdAt: '2024-01-06T16:45:00Z',
          status: 'completed',
          aiProvider: 'openai',
          confidence: 96,
          fileSize: 1876543,
          transcriptionLength: 980
        },
        {
          id: '5',
          title: 'User Interview #3',
          duration: 2145,
          createdAt: '2024-01-06T11:20:00Z',
          status: 'failed',
          aiProvider: 'ollama',
          confidence: 0,
          fileSize: 2987654,
          transcriptionLength: 0
        }
      ];
      setRecordings(mockRecordings);
      setIsLoading(false);
    }, 1000);
  }, [searchParams]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading recordings data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Recordings</span>
          <Badge variant="outline">{recordings.length} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recording</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>AI Provider</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recordings.map((recording) => (
                <TableRow key={recording.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{recording.title}</div>
                      {recording.transcriptionLength > 0 && (
                        <div className="text-xs text-slate-500">
                          {recording.transcriptionLength} characters transcribed
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(recording.status)}
                      <Badge variant="secondary" className={getStatusColor(recording.status)}>
                        {recording.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-sm">{formatDuration(recording.duration)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Brain className="w-3 h-3 text-purple-500" />
                      <span className="text-sm capitalize">{recording.aiProvider}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {recording.confidence > 0 ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-12 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${recording.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs">{recording.confidence}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatFileSize(recording.fileSize)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-500">{formatDate(recording.createdAt)}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Play className="w-4 h-4 mr-2" />
                          Play Audio
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}