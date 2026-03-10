/**
 * @fileOverview Logic for the 100-stage World Progression Engine.
 */

import { WorldStageDefinition, WorldLayer } from './types';

const ML_PER_STAGE = 100;
const MAX_STAGES = 100;

/**
 * Calculates the current stage ID (1-100) based on total lifetime milliliters.
 */
export function calculateStageId(totalMl: number): number {
  const stage = Math.floor(totalMl / ML_PER_STAGE) + 1;
  return Math.min(MAX_STAGES, stage);
}

/**
 * Calculates the total ML required for a specific stage ID.
 */
export function getThresholdForStage(stageId: number): number {
  return (stageId - 1) * ML_PER_STAGE;
}

/**
 * Returns the layers for a given stage to render in the PixelWorld component.
 */
export function getLayersForStage(stageId: number): WorldLayer[] {
  const layers: WorldLayer[] = [];

  // 1. GROUND LAYER
  let groundAsset = "pixel-soil-dry";
  if (stageId > 15) groundAsset = "pixel-soil-moist";
  if (stageId > 45) groundAsset = "pixel-soil-lush";
  layers.push({ id: 'ground', assetId: groundAsset, scale: 1, y: 0, z: 1 });

  // 2. MAIN FEATURE (The growing plant/tree)
  if (stageId >= 5) {
    let featureAsset = "pixel-seed";
    let featureScale = 0.6 + (stageId / 200);

    if (stageId > 25) featureAsset = "pixel-sprout";
    if (stageId > 55) featureAsset = "pixel-tree-small";
    if (stageId > 85) featureAsset = "pixel-tree-mature";

    layers.push({ 
      id: 'main-feature', 
      assetId: featureAsset, 
      scale: Math.min(1.2, featureScale), 
      y: -20, 
      z: 10 
    });
  }

  // 3. DECORATIONS (Flowers)
  if (stageId > 65) {
    layers.push({ 
      id: 'flower-blue', 
      assetId: "pixel-flower-blue", 
      scale: 0.4, 
      x: -70, 
      y: 40, 
      z: 5 
    });
  }
  if (stageId > 92) {
    layers.push({ 
      id: 'flower-gold', 
      assetId: "pixel-flower-gold", 
      scale: 0.5, 
      x: 80, 
      y: 35, 
      z: 6 
    });
  }

  // 4. INHABITANTS
  if (stageId > 80) {
    layers.push({ 
      id: 'butterfly', 
      assetId: "pixel-butterfly", 
      scale: 0.35, 
      x: Math.sin(stageId) * 50,
      y: -100,
      z: 20,
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
