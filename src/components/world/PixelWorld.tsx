
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
      {/* Atmosphere based on progress */}
      <div className={`absolute inset-0 transition-all duration-2000 ${
        stageNumber > 48 ? 'bg-gradient-to-b from-blue-200 to-green-100' : 
        stageNumber > 24 ? 'bg-gradient-to-b from-blue-100 to-white' : 
        'bg-[#FDF6E3]'
      }`} />

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

      {/* UI Overlay: Evolution Goal */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-2xl border border-white/40 rounded-2xl p-2.5 flex items-center justify-between shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/20 rounded-xl">
              <ArrowUpCircle className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-primary uppercase tracking-widest leading-none mb-1">Milestone</span>
              <span className="text-[10px] font-bold text-foreground">Evolution {milestone.nextStage}/64</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1 leading-none">To Grow</span>
            <div className="flex items-center gap-1">
               <Zap className="h-2.5 w-2.5 text-reward fill-reward" />
               <span className="text-[10px] font-black text-primary">{milestone.remainingMl}ml</span>
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
