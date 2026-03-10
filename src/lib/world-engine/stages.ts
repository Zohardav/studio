
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
 * Maps the 1-100 hydration stage to the 1-64 visual level from the grid.
 */
export function getVisualLevel(stageId: number): number {
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
 * Logic is based on the 8x8 grid progression:
 * 1-8: Foundation & Early Growth
 * 9-16: Grass Colonization
 * 17-24: Flora & Expansion
 * 25-32: Paths & Shrubs
 * 33-40: Water & Life
 * 41-48: Sanctuary Amenities (Bench/Lanterns)
 * 49-56: The Fruit Orchard
 * 57-64: The Grand Ascension (Crystal Fountain)
 */
export function getLayersForStage(stageId: number): WorldLayer[] {
  const v = getVisualLevel(stageId);
  const layers: WorldLayer[] = [];

  // --- 1. GROUND LAYER ---
  let groundAsset = "pixel-soil-dry";
  if (v > 8) groundAsset = "pixel-soil-moist";
  if (v > 16) groundAsset = "pixel-soil-lush";
  if (v > 48) groundAsset = "pixel-soil-dense";
  layers.push({ id: 'ground', assetId: groundAsset, scale: 1.2, y: 0, z: 1 });

  // --- 2. THE PATHWAY (Appears in Phase 4) ---
  if (v > 24) {
    layers.push({ id: 'path', assetId: 'pixel-path', scale: 1.1, y: 60, z: 2 });
  }

  // --- 3. THE WATER (Appears in Phase 5) ---
  if (v > 32) {
    layers.push({ id: 'pond', assetId: 'pixel-pond', scale: 0.9, x: 40, y: 40, z: 3, animate: true });
  }

  // --- 4. THE TREE (Evolves continuously) ---
  let treeAsset = "pixel-seed";
  let treeScale = 0.5;
  if (v > 4) { treeAsset = "pixel-sprout"; treeScale = 0.6; }
  if (v > 8) { treeAsset = "pixel-tree-small"; treeScale = 0.7; }
  if (v > 20) { treeAsset = "pixel-tree-mature"; treeScale = 1.0; }
  if (v > 48) { treeAsset = "pixel-tree-fruit"; treeScale = 1.2; }

  // Special: The fountain replaces the tree in the final phase
  if (v <= 56) {
    layers.push({ id: 'tree', assetId: treeAsset, scale: treeScale, y: -20, x: -20, z: 10 });
  } else {
    // Grand Fountain Phase
    layers.push({ id: 'fountain', assetId: 'pixel-fountain', scale: 1.3, y: -40, z: 100, animate: true });
  }

  // --- 5. DECORATIONS & AMENITIES ---
  // Flowers appear in Phase 3
  if (v > 16) {
    layers.push({ id: 'flora', assetId: 'pixel-flower-blue', scale: 0.4, x: -60, y: 40, z: 15 });
  }
  
  // Bench appears in Phase 6
  if (v > 40) {
    layers.push({ id: 'bench', assetId: 'pixel-bench', scale: 0.7, x: 30, y: 80, z: 20 });
  }

  // Lantern appears in Phase 6
  if (v > 44) {
    layers.push({ id: 'lantern', assetId: 'pixel-lantern', scale: 0.8, x: -80, y: 0, z: 25 });
  }

  // Butterflies & Sparkles in Final Phases
  if (v > 52) {
    layers.push({ id: 'butterflies', assetId: 'pixel-butterfly', scale: 0.5, x: 40, y: -100, z: 50, animate: true });
  }
  
  if (v > 60) {
    layers.push({ id: 'magic', assetId: 'pixel-flower-gold', scale: 0.6, x: -20, y: -140, z: 110, animate: true });
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
