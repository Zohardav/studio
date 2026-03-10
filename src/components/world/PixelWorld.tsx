
"use client"

import React, { useMemo } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sun, ArrowUpCircle, Zap } from 'lucide-react';
import { calculateStageId, getLayersForStage, getNextMilestoneInfo, getVisualLevel } from '@/lib/world-engine/stages';

interface PixelWorldProps {
  totalLifetimeMl: number;
  theme: string;
}

export function PixelWorld({ totalLifetimeMl, theme }: PixelWorldProps) {
  const stageId = useMemo(() => calculateStageId(totalLifetimeMl), [totalLifetimeMl]);
  const vLevel = useMemo(() => getVisualLevel(stageId), [stageId]);
  const layers = useMemo(() => getLayersForStage(stageId), [stageId]);
  const milestone = useMemo(() => getNextMilestoneInfo(stageId, totalLifetimeMl), [stageId, totalLifetimeMl]);

  return (
    <div className="relative w-full aspect-[4/5] flex items-center justify-center pixel-card p-6 overflow-hidden border-none shadow-2xl">
      {/* Dynamic background based on visual level */}
      <div className={`absolute inset-0 transition-all duration-2000 ${
        vLevel > 48 ? 'bg-gradient-to-b from-blue-200 to-green-100' : 
        vLevel > 24 ? 'bg-gradient-to-b from-blue-100 to-white' : 
        'bg-[#FDF6E3]' // Warm sandy background for early desert stages
      }`} />

      {/* Atmospheric Effects */}
      <div className="absolute top-10 left-0 right-0 flex justify-around px-8 opacity-40 pointer-events-none">
        <Sun className={`h-16 w-16 text-reward/60 animate-spin-slow transition-opacity duration-1000 ${vLevel > 16 ? 'opacity-100' : 'opacity-20'}`} />
        {vLevel > 48 && <Sparkles className="h-8 w-8 text-reward animate-bounce" />}
      </div>

      <AnimatePresence>
        {layers.map((layer) => {
          const asset = PlaceHolderImages.find(a => a.id === layer.assetId);
          if (!asset) return null;

          return (
            <motion.div
              key={`${layer.id}-${layer.assetId}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: layer.scale || 1, 
                y: layer.y || 0,
                x: layer.x || 0,
              }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`absolute flex items-center justify-center ${layer.animate ? 'animate-float-cozy' : ''}`}
              style={{ zIndex: layer.z }}
            >
              <div className="relative w-72 h-72">
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

      {/* UI Overlay: Evolution Goal */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-3xl p-3 flex items-center justify-between shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-2xl">
              <ArrowUpCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Target Milestone</span>
              <span className="text-xs font-bold text-foreground">Evolution {Math.ceil(vLevel / 8)}/8</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1 leading-none">Nourish Needed</span>
            <div className="flex items-center gap-1">
               <Zap className="h-3 w-3 text-reward fill-reward" />
               <span className="text-xs font-black text-primary">{milestone.remainingMl}ml</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          key={vLevel}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white/95 backdrop-blur-md px-6 py-2 rounded-full border-2 border-primary/10 shadow-xl flex items-center gap-3"
        >
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Sanctuary Level</span>
          <span className="text-xl font-headline font-bold text-primary">{vLevel}</span>
        </motion.div>
      </div>
    </div>
  );
}
