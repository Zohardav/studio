/**
 * @fileOverview Logic for the 64-stage visual progression engine (mapped from 100 hydration stages).
 */

import { WorldLayer } from './types';

const ML_PER_STAGE = 100;
const MAX_HYDRATION_STAGES = 100;
const VISUAL_LEVELS = 64;

/**
 * Calculates the current hydration stage ID (1-100) based on total lifetime milliliters.
 */
export function calculateStageId(totalMl: number): number {
  const stage = Math.floor(totalMl / ML_PER_STAGE) + 1;
  return Math.min(MAX_HYDRATION_STAGES, stage);
}

/**
 * Maps the 1-100 hydration stage to the 1-64 visual level.
 */
function getVisualLevel(stageId: number): number {
  return Math.floor(((stageId - 1) * VISUAL_LEVELS) / MAX_HYDRATION_STAGES) + 1;
}

/**
 * Calculates the total ML required for a specific stage ID.
 */
export function getThresholdForStage(stageId: number): number {
  return (stageId - 1) * ML_PER_STAGE;
}

/**
 * Returns the layers for a given stage to render in the PixelWorld component.
 * This logic follows the 8x8 grid progression:
 * 1-8: Dirt + Seed -> Sprout
 * 9-16: Grass growth
 * 17-24: Mushrooms & Ground cover
 * 25-32: Floral Bloom
 * 33-40: The Pond
 * 41-48: Bench & Lanterns
 * 49-56: The Fruit Orchard
 * 57-64: The Crystal Fountain
 */
export function getLayersForStage(stageId: number): WorldLayer[] {
  const visualLevel = getVisualLevel(stageId);
  const layers: WorldLayer[] = [];

  // 1. GROUND LAYER (Dirt -> Moist -> Lush)
  let groundAsset = "pixel-soil-dry";
  if (visualLevel > 8) groundAsset = "pixel-soil-moist";
  if (visualLevel > 16) groundAsset = "pixel-soil-lush";
  layers.push({ id: 'ground', assetId: groundAsset, scale: 1, y: 0, z: 1 });

  // 2. MAIN FEATURE (Seed -> Tree -> Fruit Tree -> Crystal)
  let featureAsset = "pixel-seed";
  let featureScale = 0.6 + (visualLevel / 64) * 0.4;
  
  if (visualLevel > 4) featureAsset = "pixel-sprout";
  if (visualLevel > 12) featureAsset = "pixel-tree-small";
  if (visualLevel > 48) featureAsset = "pixel-tree-mature"; // Representing the orange/fruit tree
  
  layers.push({ 
    id: 'main-feature', 
    assetId: featureAsset, 
    scale: featureScale, 
    y: -20, 
    z: 10 
  });

  // 3. SECONDARY FEATURES (Pond, Bench, Lantern)
  if (visualLevel > 32) {
    layers.push({ 
      id: 'pond', 
      assetId: "pixel-soil-moist", // Placeholder for pond water
      scale: 0.8, 
      x: 40, 
      y: 60, 
      z: 5,
      animate: true 
    });
  }

  // 4. DECORATIONS (Mushrooms, Flowers, Butterflies)
  if (visualLevel > 20) {
    layers.push({ 
      id: 'mushrooms', 
      assetId: "pixel-seed", // Placeholder for mushrooms
      scale: 0.3, 
      x: -60, 
      y: 30, 
      z: 8 
    });
  }

  if (visualLevel > 28) {
    layers.push({ 
      id: 'flowers', 
      assetId: "pixel-flower-blue", 
      scale: 0.4, 
      x: -40, 
      y: 45, 
      z: 12 
    });
  }

  if (visualLevel > 44) {
    layers.push({ 
      id: 'butterflies', 
      assetId: "pixel-butterfly", 
      scale: 0.4, 
      x: 0, 
      y: -120, 
      z: 50, 
      animate: true 
    });
  }

  // 5. FINAL ASCENSION (Crystal Fountain)
  if (visualLevel > 56) {
    layers.push({ 
      id: 'crystal', 
      assetId: "pixel-flower-gold", // Placeholder for the final crystal
      scale: 1.2, 
      y: -40, 
      z: 100, 
      animate: true 
    });
  }

  return layers;
}

/**
 * Returns info about the next major evolution milestone (every 10 stages).
 */
export function getNextMilestoneInfo(currentStage: number, totalMl: number) {
  const nextMilestoneStage = Math.ceil((currentStage + 0.1) / 10) * 10;
  const targetMl = getThresholdForStage(nextMilestoneStage);
  const remainingMl = Math.max(0, targetMl - totalMl);
  
  return {
    nextMilestoneStage,
    remainingMl,
    progressPercent: Math.min(100, (totalMl / targetMl) * 100)
  };
}
