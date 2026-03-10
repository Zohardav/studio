"use client"

import React from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface VirtualWorldProps {
  progress: number;
  theme: 'garden' | 'island' | 'room';
}

export function VirtualWorld({ progress, theme }: VirtualWorldProps) {
  const getStage = () => {
    if (progress < 30) return 0;
    if (progress < 70) return 1;
    return 2;
  };

  const stage = getStage();
  const themeKey = theme === 'garden' ? 'garden' : 'island';
  const stageImage = PlaceHolderImages.find(img => img.id === `${themeKey}-stage-${stage + 1}`);

  return (
    <Card className="relative w-full aspect-square overflow-hidden border-none bg-secondary/30 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${theme}-${stage}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full h-full flex flex-col items-center justify-center"
        >
          {stageImage && (
            <div className="relative w-full h-full animate-float">
               <Image 
                src={stageImage.imageUrl} 
                alt={stageImage.description}
                fill
                className="object-contain rounded-2xl shadow-xl"
                data-ai-hint={stageImage.imageHint}
              />
            </div>
          )}
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
              Stage {stage + 1}
            </Badge>
            {progress >= 100 && (
              <Badge variant="default" className="bg-accent text-accent-foreground animate-pulse">
                Thriving!
              </Badge>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute bottom-0 w-[200%] h-[10%] bg-primary/20 animate-wave rounded-full blur-xl" />
      </div>
    </Card>
  );
}