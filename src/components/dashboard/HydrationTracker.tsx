"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Plus, Sparkles, MessageSquareHeart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <motion.div 
          key={currentAmount}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block"
        >
          <h2 className="text-6xl font-headline font-bold text-primary">
            {currentAmount}<span className="text-2xl font-normal text-muted-foreground/60 ml-2">ml</span>
          </h2>
        </motion.div>
        <p className="text-muted-foreground font-medium">Daily Target: {goalAmount}ml</p>
      </div>

      <div className="relative px-2">
        <div className="h-4 w-full bg-secondary/50 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="h-full bg-primary relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-wave" />
          </motion.div>
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <span>{Math.round(progress)}% Complete</span>
          <span>{Math.max(0, goalAmount - currentAmount)}ml Remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <Button 
          className="col-span-4 h-20 text-xl font-bold rounded-[2rem] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
          onClick={() => onAddWater(glassSize)}
        >
          <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          Log {glassSize}ml
        </Button>
        <Button 
          variant="outline"
          className="h-20 w-full rounded-[2rem] border-2 border-primary/20 text-primary hover:bg-primary/5 active:scale-95 transition-all flex flex-col gap-1"
          onClick={() => {
            const custom = prompt("Custom amount (ml)", glassSize.toString());
            if (custom) onAddWater(parseInt(custom));
          }}
        >
          <Plus className="h-6 w-6" />
          <span className="text-[10px] font-bold">Custom</span>
        </Button>
      </div>

      <AnimatePresence>
        {aiMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-morphism p-5 rounded-[2rem] flex gap-4 items-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="h-12 w-12 text-accent" />
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
              <MessageSquareHeart className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-0.5 relative z-10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Hydro Helper</p>
              <p className="text-sm text-foreground/90 font-medium leading-relaxed italic">
                "{aiMessage}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
