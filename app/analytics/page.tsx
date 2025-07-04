import { Suspense } from 'react';
import { AnalyticsOverview } from '@/components/analytics/analytics-overview';
import { AnalyticsCharts } from '@/components/analytics/analytics-charts';
import { AnalyticsFilters } from '@/components/analytics/analytics-filters';
import { AnalyticsTable } from '@/components/analytics/analytics-table';

export default function AnalyticsPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Comprehensive insights into your voice recordings and AI analysis performance
          </p>
        </div>

        <div className="space-y-8">
          {/* Filters */}
          <Suspense fallback={<div className="h-20 bg-white/40 dark:bg-slate-800/40 rounded-lg animate-pulse" />}>
            <AnalyticsFilters searchParams={searchParams} />
          </Suspense>

          {/* Overview Cards */}
          <Suspense fallback={<div className="h-32 bg-white/40 dark:bg-slate-800/40 rounded-lg animate-pulse" />}>
            <AnalyticsOverview searchParams={searchParams} />
          </Suspense>

          {/* Charts */}
          <Suspense fallback={<div className="h-96 bg-white/40 dark:bg-slate-800/40 rounded-lg animate-pulse" />}>
            <AnalyticsCharts searchParams={searchParams} />
          </Suspense>

          {/* Detailed Table */}
          <Suspense fallback={<div className="h-64 bg-white/40 dark:bg-slate-800/40 rounded-lg animate-pulse" />}>
            <AnalyticsTable searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}