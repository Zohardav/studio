"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Droplets, Sparkles, Wand2, Star, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HydrationTrackerProps {
  currentGlasses: number;
  goalGlasses: number;
  totalStars: number;
  nextStageStars: number;
  dailyProgress: number;
  onAddGlass: () => void;
  aiMessage?: string;
}

export function HydrationTracker({
  currentGlasses,
  goalGlasses,
  totalStars,
  nextStageStars,
  dailyProgress,
  onAddGlass,
  aiMessage
}: HydrationTrackerProps) {
  const evolutionProgress = Math.min(100, (totalStars / nextStageStars) * 100);
  const isGoalReached = currentGlasses >= goalGlasses;

  return (
    <div className="space-y-8">
      {/* Daily Progress Card */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <motion.div 
            key={currentGlasses}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block"
          >
            <h2 className="text-6xl font-headline font-black text-primary drop-shadow-sm">
              {currentGlasses}<span className="text-xl font-headline font-bold text-muted-foreground/30 ml-1">/{goalGlasses}</span>
            </h2>
          </motion.div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Glasses Today</p>
        </div>

        <div className="relative px-2">
          <div className="h-4 w-full bg-secondary/80 rounded-full overflow-hidden border-2 border-white/50 shadow-inner">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgress}%` }}
              transition={{ type: "spring", damping: 15, stiffness: 60 }}
            />
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Daily Goal</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
              {isGoalReached ? "Satiated" : `${Math.max(0, goalGlasses - currentGlasses)} More to Go`}
            </span>
          </div>
        </div>
      </div>

      {/* Evolution Progress Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="pixel-card p-6 bg-gradient-to-br from-white/90 to-reward/5 border-none shadow-xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Star className="h-20 w-20 text-reward fill-reward" />
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-reward/10 rounded-xl">
            <Star className="h-5 w-5 text-reward fill-reward" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-reward uppercase tracking-[0.3em]">World Evolution</span>
            <span className="text-sm font-bold text-foreground/80">{totalStars} / {nextStageStars} Stars to Level Up</span>
          </div>
        </div>

        <div className="relative">
          <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden border border-white/40">
            <motion.div 
              className="h-full bg-reward shadow-[0_0_15px_rgba(242,209,126,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${evolutionProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="absolute -top-1 right-0">
             <Sparkles className="h-5 w-5 text-reward/40 animate-pulse" />
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <Button 
          className={`w-full h-24 text-2xl font-black rounded-[2.5rem] transition-all flex items-center justify-center gap-4 group relative overflow-hidden ${
            isGoalReached 
            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-80" 
            : "bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/30 border-b-8 border-primary/20 active:border-b-2 active:translate-y-1"
          }`}
          onClick={onAddGlass}
          disabled={isGoalReached}
        >
          <div className={`p-3 rounded-2xl transition-transform ${isGoalReached ? "bg-muted-foreground/20" : "bg-white/20 group-hover:rotate-12"}`}>
            {isGoalReached ? <CheckCircle2 className="h-8 w-8" /> : <Wand2 className="h-8 w-8" />}
          </div>
          <span className="relative z-10">
            {isGoalReached ? "Goal Fulfilled" : "Drink a Glass"}
          </span>
          {isGoalReached && (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 0.1 }} 
               className="absolute inset-0 bg-primary pointer-events-none" 
             />
          )}
        </Button>
        
        {isGoalReached && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
          >
            The sanctuary is glowing. Rest now, Guardian.
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {aiMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pixel-card p-6 flex gap-4 items-center relative overflow-hidden group border-none bg-gradient-to-br from-white to-secondary/30"
          >
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
