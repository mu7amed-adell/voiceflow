'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Filter, 
  Calendar as CalendarIcon, 
  Download,
  RefreshCw,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface AnalyticsFiltersProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function AnalyticsFilters({ searchParams }: AnalyticsFiltersProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [status, setStatus] = useState<string>('all');
  const [aiProvider, setAIProvider] = useState<string>('all');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const activeFilters = [
    status !== 'all' && { key: 'status', value: status, label: `Status: ${status}` },
    aiProvider !== 'all' && { key: 'aiProvider', value: aiProvider, label: `AI: ${aiProvider}` },
    dateRange.from && { key: 'dateRange', value: 'custom', label: `Date: ${format(dateRange.from, 'MMM dd')}${dateRange.to ? ` - ${format(dateRange.to, 'MMM dd')}` : ''}` }
  ].filter(Boolean);

  const clearFilter = (filterKey: string) => {
    switch (filterKey) {
      case 'status':
        setStatus('all');
        break;
      case 'aiProvider':
        setAIProvider('all');
        break;
      case 'dateRange':
        setDateRange({});
        break;
    }
  };

  const clearAllFilters = () => {
    setStatus('all');
    setAIProvider('all');
    setDateRange({});
  };

  const exportData = () => {
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  return (
    <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters:</span>
            </div>

            {/* Date Range Filter */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                    ) : (
                      format(dateRange.from, 'MMM dd')
                    )
                  ) : (
                    'Date Range'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range || {});
                    if (range?.from && range?.to) {
                      setIsCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {/* Status Filter */}
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* AI Provider Filter */}
            <Select value={aiProvider} onValueChange={setAIProvider}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="AI Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="ollama">Ollama</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <span className="text-sm text-slate-500">Active filters:</span>
            {activeFilters.map((filter: any) => (
              <Badge 
                key={filter.key} 
                variant="secondary" 
                className="flex items-center space-x-1"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => clearFilter(filter.key)}
                  className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}