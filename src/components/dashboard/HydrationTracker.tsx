"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Droplets, Plus, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HydrationTrackerProps {
  currentAmount: number;
  goalAmount: number;
  progress: number;
  glassSize: number;
  onAddWater: (amount: number) => void;
  aiMessage?: string;
}

export function HydrationTracker({
  currentAmount,
  goalAmount,
  progress,
  glassSize,
  onAddWater,
  aiMessage
}: HydrationTrackerProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <motion.div 
          key={currentAmount}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block"
        >
          <h2 className="text-6xl font-headline font-black text-primary drop-shadow-sm">
            {currentAmount}<span className="text-xl font-headline font-bold text-muted-foreground/30 ml-1">ml</span>
          </h2>
        </motion.div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Daily Goal: {goalAmount}ml</p>
      </div>

      {/* Progress Bar */}
      <div className="relative px-2">
        <div className="h-6 w-full bg-secondary/80 rounded-full overflow-hidden border-2 border-white/50 shadow-inner">
          <motion.div 
            className="h-full water-pulse"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", damping: 12, stiffness: 50 }}
          />
        </div>
        <div className="flex justify-between mt-2 px-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{Math.round(progress)}% Nourished</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{Math.max(0, goalAmount - currentAmount)}ml Remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <Button 
          className="col-span-4 h-24 text-2xl font-black rounded-[2.5rem] bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 border-b-8 border-primary/20 active:border-b-2 active:translate-y-1 transition-all flex items-center justify-center gap-4 group"
          onClick={() => onAddWater(glassSize)}
        >
          <div className="bg-white/20 p-3 rounded-2xl group-hover:rotate-12 transition-transform">
            <Wand2 className="h-8 w-8 text-white" />
          </div>
          Nourish World
        </Button>
        <Button 
          variant="outline"
          className="h-24 w-full rounded-[2.5rem] border-4 border-primary/10 text-primary bg-white hover:bg-primary/5 active:scale-90 transition-all flex flex-col items-center justify-center gap-1"
          onClick={() => {
            const custom = prompt("Custom nourishment amount (ml)", glassSize.toString());
            if (custom) onAddWater(parseInt(custom));
          }}
        >
          <Plus className="h-7 w-7" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Extra</span>
        </Button>
      </div>

      <AnimatePresence>
        {aiMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pixel-card p-6 flex gap-4 items-center relative overflow-hidden group border-none bg-gradient-to-br from-white to-secondary/30"
          >
            <div className="absolute top-[-20%] right-[-10%] p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="h-24 w-24 text-reward" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-1">Sanctuary Spirit</p>
              <p className="text-sm text-foreground/80 font-bold leading-relaxed italic">
                "{aiMessage}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}