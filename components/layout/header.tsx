'use client';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Bot, Brain, FileText, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                VoiceFlow AI - DMS
              </h1>
            </div>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/analytics">
            <Button 
              variant={isActive('/analytics') ? 'default' : 'ghost'} 
              size="sm" 
              className="text-slate-600 dark:text-slate-300"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">
            <Brain className="w-4 h-4 mr-2" />
            AI Models
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300">
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}