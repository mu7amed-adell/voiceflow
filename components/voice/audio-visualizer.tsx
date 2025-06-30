'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioData: number[];
  isRecording: boolean;
}

export function AudioVisualizer({ audioData, isRecording }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!isRecording || audioData.length === 0) {
      // Draw idle state
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      return;
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, '#1d4ed8');
    gradient.addColorStop(1, '#1e40af');

    // Draw waveform
    const barWidth = width / audioData.length;
    
    for (let i = 0; i < audioData.length; i++) {
      const barHeight = (audioData[i] / 255) * height * 0.8;
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  }, [audioData, isRecording]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={60} 
      className="w-full h-full rounded"
    />
  );
}