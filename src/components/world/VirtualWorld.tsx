"use client"

import React from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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
    <div className="relative group">
      <Card className="relative w-full aspect-[4/5] overflow-hidden border-none glass-morphism flex items-center justify-center p-6 rounded-[2.5rem]">
        {/* Background Atmosphere */}
        <div className={`absolute inset-0 transition-colors duration-1000 opacity-20 ${
          progress >= 100 ? 'bg-reward' : 'bg-primary'
        }`} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={`${theme}-${stage}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.1, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="relative w-full h-full flex flex-col items-center justify-center z-10"
          >
            {stageImage && (
              <div className="relative w-full h-full animate-float-subtle">
                 <Image 
                  src={stageImage.imageUrl} 
                  alt={stageImage.description}
                  fill
                  className="object-contain drop-shadow-2xl"
                  data-ai-hint={stageImage.imageHint}
                  priority
                />
                
                {/* Magical particles when thriving */}
                {progress >= 100 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Sparkles className="w-full h-full text-reward opacity-40 animate-pulse" />
                  </motion.div>
                )}
              </div>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Badge variant="outline" className="px-4 py-1 bg-white/50 dark:bg-black/50 backdrop-blur-md border-white/20 text-xs font-bold uppercase tracking-wider">
                  {theme === 'garden' ? 'My Secret Garden' : 'My Paradise Island'}
                </Badge>
              </motion.div>
              
              {progress >= 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-6 py-2 bg-reward text-white rounded-full font-bold shadow-lg reward-glow text-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  World Thriving!
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Ambient Waves */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-30 bg-gradient-to-t from-primary/20 to-transparent" />
      </Card>
      
      {/* Visual Feedback on edges */}
      <div className="absolute -inset-1 bg-gradient-to-tr from-primary/10 via-accent/10 to-reward/10 rounded-[2.6rem] blur-2xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
