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
  Mic, 
  Cloud, 
  Zap, 
  Shield, 
  Globe,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Users,
  Languages,
  Brain,
  Cpu
} from 'lucide-react';

interface TranscriptionProvider {
  id: 'openai' | 'gladia' | 'huggingface';
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  available: boolean;
  isCloud: boolean;
  accuracy: string;
  languages: string;
  speed: string;
  specialty?: string;
}

interface TranscriptionProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  disabled?: boolean;
}

export function TranscriptionProviderSelector({ 
  selectedProvider, 
  onProviderChange, 
  disabled 
}: TranscriptionProviderSelectorProps) {
  const [providers, setProviders] = useState<TranscriptionProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkProviders();
  }, []);

  const checkProviders = async () => {
    try {
      const response = await fetch('/api/transcription-providers');
      const data = await response.json();
      
      const providerList: TranscriptionProvider[] = [
        {
          id: 'openai',
          name: 'OpenAI Whisper',
          description: 'Industry-leading speech recognition with exceptional accuracy',
          icon: Mic,
          features: ['99%+ accuracy', 'Multi-language', 'Noise robust', 'Fast processing'],
          available: data.providers.openai,
          isCloud: true,
          accuracy: 'Excellent',
          languages: '50+ languages',
          speed: 'Fast'
        },
        {
          id: 'gladia',
          name: 'Gladia AI',
          description: 'Advanced transcription with speaker diarization and real-time processing',
          icon: Cloud,
          features: ['Speaker diarization', 'Real-time', 'Custom vocabulary', 'High accuracy'],
          available: data.providers.gladia,
          isCloud: true,
          accuracy: 'Very Good',
          languages: '100+ languages',
          speed: 'Very Fast'
        },
        {
          id: 'huggingface',
          name: 'Arabic Whisper',
          description: 'Specialized Arabic transcription with code-switching support',
          icon: Brain,
          features: ['Arabic specialized', 'Code-switching', 'Dialect support', 'Open source'],
          available: data.providers.huggingface,
          isCloud: true,
          accuracy: 'Excellent (Arabic)',
          languages: 'Arabic + English',
          speed: 'Medium',
          specialty: 'Arabic & Code-Switching'
        }
      ];
      
      setProviders(providerList);
      
      // Auto-select best available provider if current selection is not available
      if (!data.providers[selectedProvider]) {
        if (data.providers.gladia) {
          onProviderChange('gladia');
        } else if (data.providers.huggingface) {
          onProviderChange('huggingface');
        } else if (data.providers.openai) {
          onProviderChange('openai');
        }
      }
      
    } catch (error) {
      console.error('Failed to check transcription providers:', error);
      // Fallback to default providers if API fails
      const fallbackProviders: TranscriptionProvider[] = [
        {
          id: 'openai',
          name: 'OpenAI Whisper',
          description: 'Industry-leading speech recognition with exceptional accuracy',
          icon: Mic,
          features: ['99%+ accuracy', 'Multi-language', 'Noise robust', 'Fast processing'],
          available: false,
          isCloud: true,
          accuracy: 'Excellent',
          languages: '50+ languages',
          speed: 'Fast'
        },
        {
          id: 'gladia',
          name: 'Gladia AI',
          description: 'Advanced transcription with speaker diarization and real-time processing',
          icon: Cloud,
          features: ['Speaker diarization', 'Real-time', 'Custom vocabulary', 'High accuracy'],
          available: true,
          isCloud: true,
          accuracy: 'Very Good',
          languages: '100+ languages',
          speed: 'Very Fast'
        },
        {
          id: 'huggingface',
          name: 'Arabic Whisper',
          description: 'Specialized Arabic transcription with code-switching support',
          icon: Brain,
          features: ['Arabic specialized', 'Code-switching', 'Dialect support', 'Open source'],
          available: true,
          isCloud: true,
          accuracy: 'Excellent (Arabic)',
          languages: 'Arabic + English',
          speed: 'Medium',
          specialty: 'Arabic & Code-Switching'
        }
      ];
      setProviders(fallbackProviders);
      
      // Auto-select Gladia if current selection is not available
      if (selectedProvider === 'openai') {
        onProviderChange('gladia');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Checking transcription providers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Mic className="w-5 h-5 mr-2 text-blue-500" />
          Transcription Provider
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Transcription Provider:</label>
          <Select 
            value={selectedProvider} 
            onValueChange={onProviderChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue>
                {selectedProviderData ? (
                  <div className="flex items-center space-x-2">
                    <selectedProviderData.icon className="w-4 h-4" />
                    <span>{selectedProviderData.name}</span>
                    {selectedProviderData.specialty && (
                      <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                        {selectedProviderData.specialty}
                      </Badge>
                    )}
                    {selectedProviderData.available ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                ) : (
                  "Choose transcription provider"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem 
                  key={provider.id} 
                  value={provider.id}
                  disabled={!provider.available}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <provider.icon className="w-4 h-4" />
                    <span className="flex-1">{provider.name}</span>
                    {provider.specialty && (
                      <Badge variant="outline" className="text-xs">
                        Arabic
                      </Badge>
                    )}
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

        {/* Current Selection Details */}
        {selectedProviderData && (
          <div className={`p-3 rounded-lg border ${
            selectedProviderData.specialty 
              ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
              : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <selectedProviderData.icon className={`w-5 h-5 ${
                  selectedProviderData.specialty ? 'text-orange-500' : 'text-blue-500'
                }`} />
                <h4 className="font-medium">{selectedProviderData.name}</h4>
                <Badge variant="outline" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Cloud
                </Badge>
                {selectedProviderData.specialty && (
                  <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                    <Brain className="w-3 h-3 mr-1" />
                    {selectedProviderData.specialty}
                  </Badge>
                )}
              </div>
              {selectedProviderData.available ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
              {selectedProviderData.description}
            </p>

            {/* Provider Stats */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400">Accuracy</div>
                <div className="text-sm font-medium">{selectedProviderData.accuracy}</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400">Languages</div>
                <div className="text-sm font-medium">{selectedProviderData.languages}</div>
              </div>
              <div className="text-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400">Speed</div>
                <div className="text-sm font-medium">{selectedProviderData.speed}</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {selectedProviderData.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>

            {!selectedProviderData.available && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                {selectedProviderData.id === 'openai' && (
                  <p className="text-yellow-800 dark:text-yellow-200">
                    OpenAI API key not configured. Add OPENAI_API_KEY to your environment.
                  </p>
                )}
                {selectedProviderData.id === 'gladia' && (
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Gladia service temporarily unavailable. Check your internet connection.
                  </p>
                )}
                {selectedProviderData.id === 'huggingface' && (
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Hugging Face model temporarily unavailable. The model may be loading.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* All Providers Overview */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            Available Providers
          </h5>
          <div className="grid gap-2">
            {providers.map((provider) => {
              const IconComponent = provider.icon;
              
              return (
                <div
                  key={provider.id}
                  className={`p-3 rounded border text-sm transition-all cursor-pointer ${
                    selectedProvider === provider.id 
                      ? provider.specialty
                        ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/30'
                        : 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  } ${!provider.available ? 'opacity-50' : ''}`}
                  onClick={() => provider.available && onProviderChange(provider.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className={`w-4 h-4 ${
                        provider.specialty ? 'text-orange-500' : 'text-blue-500'
                      }`} />
                      <span className="font-medium">{provider.name}</span>
                      <Badge variant="outline" className="text-xs">Cloud</Badge>
                      {provider.specialty && (
                        <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                          Arabic
                        </Badge>
                      )}
                    </div>
                    {provider.available ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      <span>{provider.speed}</span>
                    </div>
                    <div className="flex items-center">
                      <Languages className="w-3 h-3 mr-1 text-slate-400" />
                      <span>{provider.languages}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1 text-slate-400" />
                      <span>{provider.accuracy}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Provider Comparison */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h5 className="font-medium text-sm mb-2">Provider Comparison</h5>
          <div className="space-y-2 text-xs">
            <div>
              <p className="font-medium text-blue-600 dark:text-blue-400">OpenAI Whisper:</p>
              <p className="text-slate-600 dark:text-slate-300">
                Best overall accuracy, proven reliability, wide language support
              </p>
            </div>
            <div>
              <p className="font-medium text-green-600 dark:text-green-400">Gladia AI:</p>
              <p className="text-slate-600 dark:text-slate-300">
                Advanced features like speaker diarization, real-time processing, custom vocabulary
              </p>
            </div>
            <div>
              <p className="font-medium text-orange-600 dark:text-orange-400">Arabic Whisper (Hugging Face):</p>
              <p className="text-slate-600 dark:text-slate-300">
                Specialized for Arabic language and code-switching scenarios, excellent for Arabic dialects
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}