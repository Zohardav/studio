
"use client"

import React from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getLayersForStage, getThresholdForStage, getVisualLevel } from '@/lib/world-engine/stages';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Zap, Sparkles } from 'lucide-react';

export function WorldLibrary() {
  // Show all 64 visual milestones from the grid
  const visualLevels = Array.from({ length: 64 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 pb-12">
      {visualLevels.map((vLevel) => {
        // Map visual level back to a representative hydration stage (1-100)
        const hydrationStageId = Math.ceil((vLevel * 100) / 64);
        const layers = getLayersForStage(hydrationStageId);
        const threshold = getThresholdForStage(hydrationStageId);

        return (
          <motion.div 
            key={vLevel}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "50px" }}
            className="flex flex-col gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-[2.5rem] border-4 border-white shadow-xl hover:border-primary/20 transition-all group"
          >
            <div className="relative aspect-square w-full bg-gradient-to-b from-blue-50 to-white rounded-[2rem] overflow-hidden flex items-center justify-center border-2 border-primary/5">
              {layers.map((layer) => {
                const asset = PlaceHolderImages.find(a => a.id === layer.assetId);
                if (!asset) return null;
                return (
                  <div 
                    key={layer.id}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ zIndex: layer.z }}
                  >
                    <div 
                      className="relative w-full h-full p-4"
                      style={{ 
                        transform: `scale(${layer.scale}) translate(${layer.x || 0}px, ${layer.y || 0}px)` 
                      }}
                    >
                      <Image
                        src={asset.imageUrl}
                        alt={asset.description}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                );
              })}
              
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="bg-primary/80 backdrop-blur-md text-white font-black border-none px-3 shadow-lg">
                  LVL {vLevel}
                </Badge>
              </div>
            </div>

            <div className="space-y-1 px-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Hydration Mark</span>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-reward fill-reward" />
                  <span className="text-sm font-bold text-primary">{threshold}ml</span>
                </div>
              </div>
              <p className="text-[9px] font-bold text-muted-foreground leading-tight">
                {vLevel <= 8 && "Phase 1: Foundation. The soil awakens as the first sapling breaks through."}
                {vLevel > 8 && vLevel <= 16 && "Phase 2: Colonization. Grass begins to spread across the dry earth."}
                {vLevel > 16 && vLevel <= 24 && "Phase 3: Expansion. Early flowers bloom and the tree gains strength."}
                {vLevel > 24 && vLevel <= 32 && "Phase 4: Structuring. Stone pathways and decorative shrubs appear."}
                {vLevel > 32 && vLevel <= 40 && "Phase 5: Life Stream. A magical pond forms to nourish the world."}
                {vLevel > 40 && vLevel <= 48 && "Phase 6: Sanctuary. Comforts like benches and lanterns are added."}
                {vLevel > 48 && vLevel <= 56 && "Phase 7: Orchard. The tree matures into a fruit-bearing provider."}
                {vLevel > 56 && "Phase 8: Grand Ascension. The final sanctuary featuring the Crystal Fountain."}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
