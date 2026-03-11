
"use client"

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Loader2, ImageOff, Sparkles, Droplets } from 'lucide-react';

interface PixelWorldProps {
  totalStars: number;
  aiMessage?: string;
}

export function PixelWorld({ totalStars, aiMessage }: PixelWorldProps) {
  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const firestore = useFirestore();
  
  const stagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'worldStages'), orderBy('requiredStars', 'asc'));
  }, [firestore]);

  const { data: stages } = useCollection(stagesQuery);

  const { currentStage, nextStage, isLoading } = useMemo(() => {
    if (!stages || stages.length === 0) return { currentStage: null, nextStage: null, isLoading: true };
    
    let active = null;
    let next = stages[0] || null;

    for (let i = 0; i < stages.length; i++) {
      if (totalStars >= stages[i].requiredStars) {
        active = stages[i];
        next = stages[i + 1] || null;
      } else {
        break;
      }
    }

    return { currentStage: active, nextStage: next, isLoading: false };
  }, [stages, totalStars]);

  const remainingStars = nextStage ? Math.max(0, nextStage.requiredStars - totalStars) : 0;
  const evolutionProgress = nextStage 
    ? Math.min(100, (totalStars / nextStage.requiredStars) * 100)
    : 100;

  // Handle message updates
  useEffect(() => {
    if (aiMessage) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      setVisibleMessage(aiMessage);
      
      timeoutRef.current = setTimeout(() => {
        setVisibleMessage(null);
      }, 3000);
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [aiMessage]);

  return (
    <div className="relative w-full aspect-[16/12] flex flex-col mb-8">
      {/* Main Sanctuary Card Container */}
      <div className="relative flex-1 flex flex-col pixel-card p-4 overflow-hidden border-none shadow-2xl">
        <div className="absolute inset-0 bg-[#f8f1de]" />

        {/* Evolution Milestone UI - Compact glass box */}
        <div className="relative z-50 w-full px-2 pt-1 mb-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/50 backdrop-blur-xl p-2 px-4 rounded-[1.5rem] border-2 border-white/30 shadow-xl space-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-reward/10 rounded-full border border-reward/20">
                  <Star className="h-3 w-3 text-reward fill-reward" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[6px] font-black text-reward uppercase tracking-[0.2em] leading-tight">Next Evolution</span>
                  <span className="text-[10px] font-bold text-foreground">Stage {nextStage?.stageNumber || '?'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[6px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-tight">Requirements</span>
                <div className="flex items-center gap-1">
                  <Star className="h-2 w-2 text-reward fill-reward" />
                  <span className="text-[9px] font-black text-reward">{remainingStars} Stars</span>
                </div>
              </div>
            </div>
            
            <div className="h-1 w-full bg-white/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${evolutionProgress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-reward shadow-[0_0_8px_hsl(var(--reward)/0.3)]"
              />
            </div>
          </motion.div>
        </div>

        <div className="relative flex-1 w-full flex items-center justify-center">
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
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Glimpsing the Sanctuary...</span>
              </motion.div>
            ) : currentStage?.imageUrl ? (
              <motion.div
                key={currentStage.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1.1,
                  y: [0, -12, 0]
                }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ 
                  opacity: { duration: 0.8 },
                  scale: { duration: 0.8 },
                  y: { 
                    repeat: Infinity, 
                    duration: 5, 
                    ease: "easeInOut" 
                  }
                }}
                className="relative w-full h-full z-10"
              >
                <Image
                  src={currentStage.imageUrl}
                  alt={`World Stage ${currentStage.stageNumber}`}
                  fill
                  className="object-contain pixelated"
                  style={{ imageRendering: 'pixelated' }}
                  priority
                />
              </motion.div>
            ) : (
              <motion.div 
                key="empty-level-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-6 z-10 text-center"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/40 border-4 border-dashed border-primary/20 flex items-center justify-center">
                    <Droplets className="h-8 w-8 text-primary/20" />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -inset-4 bg-primary/5 rounded-full -z-10"
                  />
                </div>
                <div className="space-y-1 px-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Level 0: The Void</h3>
                  <p className="text-xs font-bold text-muted-foreground/60 max-w-[180px] leading-relaxed mx-auto">
                    Drink water to grow your sanctuary!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Motivation Pop-up */}
          <AnimatePresence>
            {visibleMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: "spring", damping: 30, stiffness: 200 }}
                className="absolute inset-0 flex items-center justify-center z-[60] px-8 pointer-events-none"
              >
                <div className="bg-white/70 backdrop-blur-xl p-4 rounded-[2rem] border-2 border-white/40 shadow-2xl text-center max-w-[90%] pointer-events-none">
                  <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mb-1">Sanctuary Spirit</p>
                  <div className="relative min-h-[40px] flex items-center justify-center">
                    <p className="text-xs font-bold text-foreground leading-relaxed italic">
                      "{visibleMessage}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Level Badge - Overlapping the bottom boundary */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-[60] flex justify-center">
        <motion.div
          key={currentStage?.stageNumber || 0}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full border-2 border-primary/10 shadow-lg flex items-center gap-2"
        >
          <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">SANCTUARY LVL</span>
          <span className="text-lg font-headline font-bold text-primary">{currentStage?.stageNumber || 0}</span>
        </motion.div>
      </div>
    </div>
  );
}
