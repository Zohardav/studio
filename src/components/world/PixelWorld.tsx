
"use client"

import React, { useMemo } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cloud, Sun, ArrowUpCircle } from 'lucide-react';

interface PixelWorldProps {
  growthScore: number;
  theme: string;
}

export function PixelWorld({ growthScore, theme }: PixelWorldProps) {
  // Logic for 100 stages of progression
  const stage = Math.min(100, Math.floor(growthScore));
  
  // Calculate next major milestone (every 10%)
  const nextMilestone = Math.ceil((stage + 1) / 10) * 10;
  const progressToMilestone = nextMilestone - growthScore;
  const mlToMilestone = Math.ceil(progressToMilestone * 100);

  const getLayers = useMemo(() => {
    const layers = [];
    
    // Ground Layer (0-100)
    let groundImg = "pixel-soil-dry";
    if (stage > 10) groundImg = "pixel-soil-moist";
    if (stage > 40) groundImg = "pixel-soil-lush";
    layers.push({ id: 'ground', img: groundImg, scale: 1, y: 0, z: 1 });

    // Main Feature (Seed -> Sprout -> Tree)
    if (stage > 5) {
      let featureImg = "pixel-seed";
      if (stage > 20) featureImg = "pixel-sprout";
      if (stage > 50) featureImg = "pixel-tree-small";
      if (stage > 80) featureImg = "pixel-tree-mature";
      layers.push({ id: 'feature', img: featureImg, scale: 0.8 + (stage / 200), y: -20, z: 10 });
    }

    // Secondary Features (Flowers)
    if (stage > 60) {
      layers.push({ id: 'flower-1', img: "pixel-flower-blue", scale: 0.4, x: -60, y: 40, z: 5 });
    }
    if (stage > 90) {
      layers.push({ id: 'flower-2', img: "pixel-flower-gold", scale: 0.5, x: 70, y: 30, z: 6 });
    }

    // Inhabitants
    if (stage > 75) {
      layers.push({ id: 'butterfly', img: "pixel-butterfly", scale: 0.3, animate: true, z: 20 });
    }

    return layers;
  }, [stage]);

  return (
    <div className="relative w-full aspect-[4/5] flex items-center justify-center pixel-card p-6 overflow-hidden">
      {/* Atmosphere Background */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        stage > 70 ? 'bg-gradient-to-b from-blue-100 to-purple-100' : 'bg-gradient-to-b from-blue-50 to-white'
      }`} />

      {/* Weather effects */}
      <div className="absolute top-10 left-0 right-0 flex justify-around px-8 opacity-40">
        {stage < 30 ? <Cloud className="h-12 w-12 text-primary/40 animate-pulse" /> : <Sun className="h-16 w-16 text-reward/60 animate-spin-slow" />}
        {stage > 85 && <Sparkles className="h-8 w-8 text-reward animate-bounce" />}
      </div>

      <AnimatePresence>
        {getLayers.map((layer) => {
          const asset = PlaceHolderImages.find(a => a.id === layer.img);
          if (!asset) return null;

          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ 
                opacity: 1, 
                scale: layer.scale || 1, 
                y: layer.y || 0,
                x: layer.x || 0,
              }}
              exit={{ opacity: 0, scale: 1.2, y: -50 }}
              transition={{ type: "spring", damping: 15, stiffness: 80 }}
              className={`absolute flex items-center justify-center ${layer.animate ? 'animate-float-cozy' : ''}`}
              style={{ zIndex: layer.z }}
            >
              <div className="relative w-64 h-64">
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

      {/* Evolution Status Header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-full px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/40 backdrop-blur-xl border border-white/20 rounded-3xl p-3 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-2xl">
              <ArrowUpCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Next Evolution</span>
              <span className="text-xs font-bold text-foreground">Stage {nextMilestone / 10}</span>
            </div>
          </div>
          <div className="text-right flex flex-col">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Needs</span>
            <span className="text-xs font-black text-primary">{mlToMilestone}ml</span>
          </div>
        </motion.div>
      </div>

      {/* Progress Label */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          key={stage}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border-2 border-primary/20 shadow-lg flex items-center gap-3"
        >
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">World Growth</span>
          <span className="text-xl font-headline font-bold text-primary">{stage}%</span>
        </motion.div>
      </div>
      
      {/* Stage Unlock Messages */}
      {stage % 10 === 0 && stage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 z-50 pointer-events-none"
        >
          <div className="bg-reward text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl reward-glow">
            Evolution Stage {stage / 10} Reached!
          </div>
        </motion.div>
      )}
    </div>
  );
}
