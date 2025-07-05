'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioData: number[];
  isRecording: boolean;
}

export function AudioVisualizer({ audioData, isRecording }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
      gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.05)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (!isRecording || audioData.length === 0) {
        // Draw idle state with subtle animation
        const time = Date.now() * 0.002;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x < width; x += 2) {
          const y = height / 2 + Math.sin((x * 0.02) + time) * 3;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Draw active waveform
      const barCount = Math.min(audioData.length, 64);
      const barWidth = width / barCount;
      
      for (let i = 0; i < barCount; i++) {
        const barHeight = (audioData[i] / 255) * height * 0.8;
        const x = i * barWidth;
        const y = (height - barHeight) / 2;

        // Create gradient for each bar
        const barGradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        
        // Dynamic color based on amplitude
        const intensity = audioData[i] / 255;
        if (intensity > 0.7) {
          barGradient.addColorStop(0, '#ef4444');
          barGradient.addColorStop(1, '#dc2626');
        } else if (intensity > 0.4) {
          barGradient.addColorStop(0, '#f59e0b');
          barGradient.addColorStop(1, '#d97706');
        } else {
          barGradient.addColorStop(0, '#3b82f6');
          barGradient.addColorStop(1, '#1d4ed8');
        }

        ctx.fillStyle = barGradient;
        
        // Add rounded corners effect
        const radius = Math.min(barWidth / 4, 3);
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, barHeight, radius);
        ctx.fill();

        // Add glow effect for high amplitude
        if (intensity > 0.5) {
          ctx.shadowColor = intensity > 0.7 ? '#ef4444' : '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      if (isRecording) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioData, isRecording]);

  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={120} 
        className="w-full h-full rounded-lg"
        style={{ imageRendering: 'auto' }}
      />
      {!isRecording && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-2 opacity-60">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <path d="M12 19v4"/>
                <path d="M8 23h8"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ready to capture your voice</p>
          </div>
        </div>
      )}
    </div>
  );
}