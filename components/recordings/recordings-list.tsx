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
  RefreshCw,
  Sparkles
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
    <Card className="h-full bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-xl font-bold">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Voice Library
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 px-3 py-1 font-medium">
              {displayCount}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              <RefreshCw className={`w-4 h-4 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
        
        {/* Error Display */}
        {error && (
          <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        )}
        
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search recordings and transcriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/70 dark:bg-slate-700/70 border-slate-200/50 dark:border-slate-600/50 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          
          <div className="flex space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 bg-white/70 dark:bg-slate-700/70 border-slate-200/50 dark:border-slate-600/50">
                  <Filter className="w-4 h-4 mr-2" />
                  {filterBy === 'all' ? 'All' : filterBy.charAt(0).toUpperCase() + filterBy.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                <DropdownMenuItem onClick={() => setFilterBy('all')}>
                  All ({statusCounts.all})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('completed')}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    Completed ({statusCounts.completed})
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('processing')}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    Processing ({statusCounts.processing})
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterBy('failed')}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    Failed ({statusCounts.failed})
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 bg-white/70 dark:bg-slate-700/70 border-slate-200/50 dark:border-slate-600/50">
                  {sortBy === 'newest' ? <SortDesc className="w-4 h-4 mr-2" /> : <SortAsc className="w-4 h-4 mr-2" />}
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
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
              <p className="font-medium">Loading your voice library...</p>
            </div>
          ) : !_hasHydrated ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <p className="font-medium">Initializing...</p>
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              {recordings.length === 0 ? (
                <div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-medium text-lg mb-2">Your voice library is empty</p>
                  <p className="text-sm">Start by recording your first voice note or uploading an audio file</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">No recordings found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 p-4">
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