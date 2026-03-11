"use client"

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ArrowUpCircle, Zap, Loader2, ImageOff, Sparkles, Droplets } from 'lucide-react';

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

  const { data: stages, isLoading } = useCollection(stagesQuery);

  const { currentStage, nextStage } = useMemo(() => {
    if (!stages || stages.length === 0) return { currentStage: null, nextStage: null };
    
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

    return { currentStage: active, nextStage: next };
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
      }, 1470);
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [aiMessage]);

  return (
    <div className="relative w-full aspect-[4/5] flex flex-col pixel-card p-4 overflow-hidden border-none shadow-2xl">
      <div className="absolute inset-0 bg-[#f8f1de]" />

      {/* Evolution Milestone UI - Golden Theme */}
      <div className="relative z-50 w-full px-4 pt-4 mb-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex justify-between items-end px-1">
            <div className="flex items-center gap-2">
              <Star className="h-3 w-3 text-reward fill-reward" />
              <span className="text-[10px] font-black text-reward uppercase tracking-[0.2em]">Next Evolution: Stage {nextStage?.stageNumber || '?'}</span>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{remainingStars} stars left</span>
          </div>
          <div className="h-2 w-full bg-white/40 backdrop-blur-md rounded-full overflow-hidden border border-white/20 shadow-sm">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${evolutionProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-reward shadow-[0_0_10px_hsl(var(--reward)/0.3)]"
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -12, 0]
              }}
              exit={{ opacity: 0, scale: 1.1 }}
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
                <div className="w-24 h-24 rounded-full bg-white/40 border-4 border-dashed border-primary/20 flex items-center justify-center">
                  <Droplets className="h-10 w-10 text-primary/20" />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-4 bg-primary/5 rounded-full -z-10"
                />
              </div>
              <div className="space-y-2 px-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40">Level 0: The Void</h3>
                <p className="text-sm font-bold text-muted-foreground/60 max-w-[200px] leading-relaxed mx-auto">
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
              <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] border-2 border-white/40 shadow-2xl text-center max-w-[90%] pointer-events-none">
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-2">Sanctuary Spirit</p>
                <div className="relative h-12 flex items-center justify-center">
                  <p className="text-sm font-bold text-foreground leading-relaxed italic">
                    "{visibleMessage}"
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Level Badge */}
      <div className="relative z-50 mb-4 flex justify-center">
        <motion.div
          key={currentStage?.stageNumber || 0}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white/95 backdrop-blur-md px-5 py-2 rounded-full border-2 border-primary/10 shadow-lg flex items-center gap-2"
        >
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">SANCTUARY LVL</span>
          <span className="text-xl font-headline font-bold text-primary">{currentStage?.stageNumber || 0}</span>
        </motion.div>
      </div>
    </div>
  );
}
