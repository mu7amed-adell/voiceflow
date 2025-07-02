'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RecordingCard } from './recording-card';
import { useRecordingsStore } from '@/lib/store/recordings-store';
import { 
  Search, 
  Filter, 
  Calendar,
  Clock,
  SortAsc,
  SortDesc,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RecordingsListProps {
  onSelectRecording: (id: string) => void;
  selectedRecording: string | null;
}

type SortOption = 'newest' | 'oldest' | 'duration' | 'alphabetical';
type FilterOption = 'all' | 'completed' | 'processing' | 'failed';

export function RecordingsList({ onSelectRecording, selectedRecording }: RecordingsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  
  const { 
    recordings, 
    _hasHydrated, 
    isLoading, 
    error, 
    fetchRecordings 
  } = useRecordingsStore();

  // Fetch recordings on mount and when hydrated
  useEffect(() => {
    if (_hasHydrated) {
      fetchRecordings();
    }
  }, [_hasHydrated, fetchRecordings]);

  // Filter and sort recordings
  const filteredRecordings = recordings
    .filter(recording => {
      // Search filter
      const matchesSearch = recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recording.transcription?.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = filterBy === 'all' || recording.status === filterBy;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'duration':
          return b.duration - a.duration;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const statusCounts = {
    all: recordings.length,
    completed: recordings.filter(r => r.status === 'completed').length,
    processing: recordings.filter(r => r.status === 'processing').length,
    failed: recordings.filter(r => r.status === 'failed').length,
  };

  const displayCount = _hasHydrated ? filteredRecordings.length : 0;

  const handleRefresh = () => {
    fetchRecordings();
  };

  return (
    <Card className="h-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Recordings</span>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {displayCount}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
        
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search recordings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-slate-700/50"
            />
          </div>
          
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="w-4 h-4 mr-2" />
                  {filterBy === 'all' ? 'All' : filterBy.charAt(0).toUpperCase() + filterBy.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterBy('all')}>
                  All ({statusCounts.all})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('completed')}>
                  Completed ({statusCounts.completed})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('processing')}>
                  Processing ({statusCounts.processing})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('failed')}>
                  Failed ({statusCounts.failed})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  {sortBy === 'newest' ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('duration')}>
                  <Clock className="w-4 h-4 mr-2" />
                  By Duration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                  <SortAsc className="w-4 h-4 mr-2" />
                  Alphabetical
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          {isLoading && recordings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-medium">Loading recordings...</p>
            </div>
          ) : !_hasHydrated ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <p className="font-medium">Initializing...</p>
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              {recordings.length === 0 ? (
                <div>
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <p className="font-medium">No recordings yet</p>
                  <p className="text-sm">Start by creating your first voice recording</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">No recordings found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredRecordings.map((recording) => (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  isSelected={selectedRecording === recording.id}
                  onClick={() => onSelectRecording(recording.id)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}