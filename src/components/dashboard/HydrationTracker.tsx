
"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2, Star, CheckCircle2, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { Language, translations } from '@/lib/translations';

interface HydrationTrackerProps {
  currentGlasses: number;
  goalGlasses: number;
  totalStars: number;
  nextStageStars: number;
  dailyProgress: number;
  onAddGlass: () => void;
  language?: Language;
}

const GlassWaterIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15.2 22H8.8c-.41 0-.78-.26-.92-.63L5 2h14l-2.88 19.37a1 1 0 0 1-.92.63Z" />
    <path d="M6 12h12" />
  </svg>
);

export function HydrationTracker({
  currentGlasses,
  goalGlasses,
  totalStars,
  nextStageStars,
  dailyProgress,
  onAddGlass,
  language = 'en'
}: HydrationTrackerProps) {
  const [cooldown, setCooldown] = useState(0);
  const isGoalReached = currentGlasses >= goalGlasses;
  const isCooldownActive = cooldown > 0;
  const t = translations[language];
  const isRtl = language === 'he';

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleAddClick = () => {
    if (!isGoalReached && !isCooldownActive) {
      onAddGlass();
      setCooldown(10);
    }
  };

  return (
    <div className="space-y-8">
      {/* Daily Progress Card */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <motion.div 
            key={currentGlasses}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="p-2.5 bg-primary/10 rounded-2xl border-2 border-primary/20 shadow-sm">
              <GlassWaterIcon className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-6xl font-headline font-black text-primary drop-shadow-sm">
              {currentGlasses}<span className="text-xl font-headline font-bold text-muted-foreground/30 ml-1">/{goalGlasses}</span>
            </h2>
          </motion.div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">{t.glassesToday}</p>
        </div>

        <div className="relative px-2">
          <div className="h-4 w-full bg-secondary/80 rounded-full overflow-hidden border-2 border-white/50 shadow-inner">
            <motion.div 
              className={`h-full bg-primary ${isRtl ? 'origin-right' : 'origin-left'}`}
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgress}%` }}
              transition={{ type: "spring", damping: 15, stiffness: 60 }}
            />
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">{t.dailyGoal}</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
              {isGoalReached ? t.satiated : `${Math.max(0, goalGlasses - currentGlasses)} ${t.moreToGo}`}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          className={`w-full h-24 text-2xl font-black rounded-[2.5rem] transition-all flex items-center justify-center gap-4 group relative overflow-hidden ${
            (isGoalReached || isCooldownActive)
            ? "bg-muted text-muted-foreground cursor-not-allowed opacity-80" 
            : "bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/30 border-b-8 border-primary/20 active:border-b-2 active:translate-y-1"
          }`}
          onClick={handleAddClick}
          disabled={isGoalReached || isCooldownActive}
        >
          <div className={`p-3 rounded-2xl transition-transform ${isGoalReached || isCooldownActive ? "bg-muted-foreground/20" : "bg-white/20 group-hover:rotate-12"}`}>
            {isGoalReached ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : isCooldownActive ? (
              <Timer className="h-8 w-8 animate-pulse" />
            ) : (
              <Wand2 className="h-8 w-8" />
            )}
          </div>
          <span className="relative z-10">
            {isGoalReached ? t.goalFulfilled : isCooldownActive ? `${isRtl ? 'המתנה' : t.wait} ${cooldown}s` : t.drinkGlass}
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
            {t.restNow}
          </motion.p>
        )}

        {isCooldownActive && !isGoalReached && (
          <motion.p 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-[10px] font-black uppercase tracking-widest text-primary/60"
          >
            {t.absorbing}
          </motion.p>
        )}
      </div>
    </div>
  );
}
