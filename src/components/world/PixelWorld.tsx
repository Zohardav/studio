"use client"

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUpCircle, Zap, Loader2, ImageOff } from 'lucide-react';
import { calculateStageNumber, getNextMilestoneInfo } from '@/lib/world-engine/stages';

interface PixelWorldProps {
  totalLifetimeMl: number;
}

export function PixelWorld({ totalLifetimeMl }: PixelWorldProps) {
  const stageNumber = useMemo(() => calculateStageNumber(totalLifetimeMl), [totalLifetimeMl]);
  const milestone = useMemo(() => getNextMilestoneInfo(stageNumber, totalLifetimeMl), [stageNumber, totalLifetimeMl]);

  const firestore = useFirestore();
  const stageDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'worldStages', stageNumber.toString());
  }, [firestore, stageNumber]);

  const { data: stageData, isLoading } = useDoc(stageDocRef);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center pixel-card p-4 overflow-hidden border-none shadow-2xl">
      {/* Default stage background */}
      <div className="absolute inset-0 bg-[#f8f1de]" />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2 z-10"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Glimpsing the World...</span>
          </motion.div>
        ) : stageData?.imageUrl ? (
          <motion.div
            key={stageData.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full h-full z-10"
          >
            <Image
              src={stageData.imageUrl}
              alt={`World Stage ${stageNumber}`}
              fill
              className="object-contain pixelated"
              style={{ imageRendering: 'pixelated' }}
              priority
            />
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 z-10 text-muted-foreground/30"
          >
            <ImageOff className="h-16 w-16" />
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest">Uncharted Territory</p>
              <p className="text-[10px] font-bold">Upload Stage {stageNumber} in Codex</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay: Evolution Goal (Thinner and 50% transparent) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl py-1.5 px-3 flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 bg-primary/20 rounded-lg">
              <ArrowUpCircle className="h-3 w-3 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[7px] font-black text-primary uppercase tracking-widest leading-none mb-0.5">Milestone</span>
              <span className="text-[9px] font-bold text-foreground leading-none">Evolution {milestone.nextStage}/64</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-widest mb-0.5 leading-none">To Grow</span>
            <div className="flex items-center gap-1 leading-none">
               <Zap className="h-2.5 w-2.5 text-reward fill-reward" />
               <span className="text-[9px] font-black text-primary leading-none">{milestone.remainingMl}ml</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          key={stageNumber}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full border-2 border-primary/10 shadow-lg flex items-center gap-2"
        >
          <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">LVL</span>
          <span className="text-lg font-headline font-bold text-primary">{stageNumber}</span>
        </motion.div>
      </div>
    </div>
  );
}
