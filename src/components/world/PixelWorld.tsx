
"use client"

import React, { useMemo } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cloud, Sun, ArrowUpCircle, Zap } from 'lucide-react';
import { calculateStageId, getLayersForStage, getNextMilestoneInfo } from '@/lib/world-engine/stages';

interface PixelWorldProps {
  totalLifetimeMl: number;
  theme: string;
}

export function PixelWorld({ totalLifetimeMl, theme }: PixelWorldProps) {
  const stageId = useMemo(() => calculateStageId(totalLifetimeMl), [totalLifetimeMl]);
  const layers = useMemo(() => getLayersForStage(stageId), [stageId]);
  const milestone = useMemo(() => getNextMilestoneInfo(stageId, totalLifetimeMl), [stageId, totalLifetimeMl]);

  return (
    <div className="relative w-full aspect-[4/5] flex items-center justify-center pixel-card p-6 overflow-hidden">
      {/* Atmosphere Background */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        stageId > 70 ? 'bg-gradient-to-b from-blue-100 to-purple-100' : 'bg-gradient-to-b from-blue-50 to-white'
      }`} />

      {/* Weather effects */}
      <div className="absolute top-10 left-0 right-0 flex justify-around px-8 opacity-40">
        {stageId < 30 ? (
          <Cloud className="h-12 w-12 text-primary/40 animate-pulse" />
        ) : (
          <Sun className="h-16 w-16 text-reward/60 animate-spin-slow" />
        )}
        {stageId > 85 && <Sparkles className="h-8 w-8 text-reward animate-bounce" />}
      </div>

      <AnimatePresence>
        {layers.map((layer) => {
          const asset = PlaceHolderImages.find(a => a.id === layer.assetId);
          if (!asset) return null;

          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ 
                opacity: 1, 
                scale: layer.scale || 1, 
                y: layer.y || 0,
                x: layer.x || 0,
              }}
              exit={{ opacity: 0, scale: 1.2, y: -50 }}
              transition={{ type: "spring", damping: 15, stiffness: 80 }}
              className={`absolute flex items-center justify-center ${layer.animate ? 'animate-float-cozy' : ''}`}
              style={{ zIndex: layer.z }}
            >
              <div className="relative w-64 h-64">
                <Image
                  src={asset.imageUrl}
                  alt={asset.description}
                  fill
                  className="object-contain"
                  data-ai-hint={asset.imageHint}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Evolution Status Header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-3 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-2xl">
              <ArrowUpCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Target Evolution</span>
              <span className="text-xs font-bold text-foreground">Stage {milestone.nextMilestoneStage}</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1 leading-none">Nourishment Gap</span>
            <div className="flex items-center gap-1">
               <Zap className="h-3 w-3 text-reward fill-reward" />
               <span className="text-xs font-black text-primary">{milestone.remainingMl}ml</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          key={stageId}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border-2 border-primary/20 shadow-lg flex items-center gap-3"
        >
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Growth Stage</span>
          <span className="text-xl font-headline font-bold text-primary">{stageId}</span>
        </motion.div>
      </div>
      
      {/* Milestone Unlocked Notification */}
      {stageId % 10 === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-24 z-[100] pointer-events-none"
        >
          <div className="bg-reward text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl reward-glow border-2 border-white/50">
            MAJOR EVOLUTION!
          </div>
        </motion.div>
      )}
    </div>
  );
}
