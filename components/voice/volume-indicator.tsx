'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface VolumeIndicatorProps {
  level: number; // 0-1
}

export function VolumeIndicator({ level }: VolumeIndicatorProps) {
  const percentage = level * 100;
  
  const getVolumeColor = () => {
    if (level < 0.1) return 'bg-gray-400';
    if (level < 0.3) return 'bg-yellow-400';
    if (level < 0.7) return 'bg-green-400';
    return 'bg-red-400';
  };

  const getVolumeIcon = () => {
    if (level < 0.1) return <VolumeX className="w-4 h-4 text-gray-400" />;
    return <Volume2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
  };

  return (
    <div className="flex items-center space-x-3">
      {getVolumeIcon()}
      <div className="flex-1">
        <Progress 
          value={percentage} 
          className="h-2" 
          style={{
            '--progress-background': level < 0.1 ? '#9ca3af' : 
                                   level < 0.3 ? '#fbbf24' : 
                                   level < 0.7 ? '#34d399' : '#ef4444'
          } as React.CSSProperties}
        />
      </div>
      <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-10">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}