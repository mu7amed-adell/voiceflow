'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Brain, 
  Server, 
  Zap, 
  Shield, 
  Globe,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface AIProvider {
  id: 'openai' | 'ollama';
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  available: boolean;
  isLocal: boolean;
}

interface AIProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  disabled?: boolean;
}

export function AIProviderSelector({ selectedProvider, onProviderChange, disabled }: AIProviderSelectorProps) {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkProviders();
  }, []);

  const checkProviders = async () => {
    try {
      const response = await fetch('/api/ai-providers');
      const data = await response.json();
      
      const providerList: AIProvider[] = [
        {
          id: 'openai',
          name: 'OpenAI GPT-4',
          description: 'Advanced AI analysis with GPT-4 and Whisper transcription',
          icon: Brain,
          features: ['High accuracy', 'Advanced reasoning', 'Multi-language support', 'Whisper transcription'],
          available: data.providers.openai,
          isLocal: false
        },
        {
          id: 'ollama',
          name: 'Ollama Local',
          description: 'Privacy-focused local AI analysis with your own models',
          icon: Server,
          features: ['Complete privacy', 'No API costs', 'Offline capable', 'Customizable models'],
          available: data.providers.ollama,
          isLocal: true
        }
      ];
      
      setProviders(providerList);
    } catch (error) {
      console.error('Failed to check AI providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Checking AI providers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-500" />
          AI Analysis Provider
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select AI Provider:</label>
          <Select 
            value={selectedProvider} 
            onValueChange={onProviderChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose AI provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem 
                  key={provider.id} 
                  value={provider.id}
                  disabled={!provider.available}
                >
                  <div className="flex items-center space-x-2">
                    <provider.icon className="w-4 h-4" />
                    <span>{provider.name}</span>
                    {provider.available ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Provider Details */}
        <div className="grid gap-3">
          {providers.map((provider) => {
            const isSelected = selectedProvider === provider.id;
            const IconComponent = provider.icon;
            
            return (
              <div
                key={provider.id}
                className={`p-3 rounded-lg border transition-all ${
                  isSelected 
                    ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20' 
                    : 'border-slate-200 dark:border-slate-700'
                } ${!provider.available ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="w-5 h-5 text-purple-500" />
                    <h4 className="font-medium">{provider.name}</h4>
                    {provider.isLocal && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Local
                      </Badge>
                    )}
                    {!provider.isLocal && (
                      <Badge variant="outline" className="text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        Cloud
                      </Badge>
                    )}
                  </div>
                  {provider.available ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  {provider.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {provider.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {!provider.available && (
                  <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                    {provider.id === 'openai' && (
                      <p className="text-yellow-800 dark:text-yellow-200">
                        OpenAI API key not configured. Add OPENAI_API_KEY to your environment.
                      </p>
                    )}
                    {provider.id === 'ollama' && (
                      <p className="text-yellow-800 dark:text-yellow-200">
                        Ollama server not running. Start Ollama at localhost:11434 to enable local AI.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Performance Comparison */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h5 className="font-medium text-sm mb-2 flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            Quick Comparison
          </h5>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-medium text-blue-600 dark:text-blue-400">OpenAI GPT-4</p>
              <p className="text-slate-600 dark:text-slate-300">Best for accuracy and advanced analysis</p>
            </div>
            <div>
              <p className="font-medium text-green-600 dark:text-green-400">Ollama Local</p>
              <p className="text-slate-600 dark:text-slate-300">Best for privacy and cost control</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}