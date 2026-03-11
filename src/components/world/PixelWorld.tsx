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

  // Handle message updates
  useEffect(() => {
    if (aiMessage) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      setVisibleMessage(aiMessage);
      
      timeoutRef.current = setTimeout(() => {
        setVisibleMessage(null);
      }, 1470); // Reduced by 30% from 2100ms
    }
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [aiMessage]);

  return (
    <div className="relative w-full aspect-square flex items-center justify-center pixel-card p-4 overflow-hidden border-none shadow-2xl">
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
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Glimpsing the Sanctuary...</span>
          </motion.div>
        ) : currentStage?.imageUrl ? (
          <motion.div
            key={currentStage.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -12, 0] // Jumping/Floating animation
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
                You better start drinking water if you want to grow something!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivation Pop-up - Stable box, animated text */}
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

      {/* Evolution Milestone UI */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/50 backdrop-blur-xl border border-white/30 rounded-xl py-2 px-4 flex items-center justify-between shadow-md opacity-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-reward/20 rounded-lg">
              <ArrowUpCircle className="h-4 w-4 text-reward" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-reward uppercase tracking-widest leading-none mb-0.5">Next Evolution</span>
              <span className="text-[10px] font-bold text-foreground leading-none">Stage {nextStage?.stageNumber || '???'}</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest mb-0.5 leading-none">Requirements</span>
            <div className="flex items-center gap-1 leading-none">
               <Star className="h-3 w-3 text-reward fill-reward" />
               <span className="text-[10px] font-black text-primary leading-none">{nextStage ? remainingStars : '---'} Stars</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Level Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
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
