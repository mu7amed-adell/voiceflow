'use client';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Bot, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                VoiceFlow AI
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Intelligent Voice Analysis
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/settings" passHref>
            <Button
              variant={isActive('/settings') ? 'default' : 'ghost'}
              size="sm"
              className={`${
                isActive('/settings') 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}