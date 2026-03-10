
/**
 * @fileOverview Logic for the 64-stage visual progression engine mapped to the 8x8 pixel art grid.
 */

import { WorldLayer } from './types';

const ML_PER_STAGE = 100;
const MAX_HYDRATION_STAGES = 100;
const VISUAL_LEVELS = 64;

export function calculateStageId(totalMl: number): number {
  const stage = Math.floor(totalMl / ML_PER_STAGE) + 1;
  return Math.min(MAX_HYDRATION_STAGES, stage);
}

export function getVisualLevel(stageId: number): number {
  return Math.floor(((stageId - 1) * VISUAL_LEVELS) / MAX_HYDRATION_STAGES) + 1;
}

export function getThresholdForStage(stageId: number): number {
  return (stageId - 1) * ML_PER_STAGE;
}

/**
 * Maps the 64 levels to the visual content of the 8x8 grid.
 */
export function getLayersForStage(stageId: number): WorldLayer[] {
  const v = getVisualLevel(stageId);
  const layers: WorldLayer[] = [];

  // --- PHASE 1: DESERT AWAKENING (Rows 1-2: Levels 1-16) ---
  let groundAsset = "pixel-soil-dry";
  if (v > 12) groundAsset = "pixel-soil-moist";
  if (v > 24) groundAsset = "pixel-soil-lush";
  layers.push({ id: 'ground', assetId: groundAsset, scale: 1.2, y: 0, z: 1 });

  // Initial rocks from the first tile
  if (v < 32) {
    layers.push({ id: 'rocks-left', assetId: 'pixel-rocks', scale: 0.4, x: -100, y: -40, z: 5 });
  }

  // --- TREE EVOLUTION (Positioned top-right initially as per Tile 1) ---
  let treeAsset = "pixel-tree-small";
  let treeScale = 0.4;
  let treeX = 80;
  let treeY = -100;

  if (v > 8) { treeScale = 0.6; treeX = 70; treeY = -80; }
  if (v > 16) { treeAsset = "pixel-tree-mature"; treeScale = 0.9; treeX = 0; treeY = -40; }
  if (v > 48) { treeAsset = "pixel-tree-fruit"; treeScale = 1.1; treeX = 0; treeY = -40; }

  // The fountain replaces the tree in the final row (Row 8)
  if (v <= 56) {
    layers.push({ id: 'main-tree', assetId: treeAsset, scale: treeScale, x: treeX, y: treeY, z: 10 });
  } else {
    layers.push({ id: 'fountain', assetId: 'pixel-fountain', scale: 1.3, y: -40, z: 100, animate: true });
  }

  // --- PHASE 2: THE PATH (Rows 3-4: Levels 17-32) ---
  if (v > 16) {
    layers.push({ id: 'path', assetId: 'pixel-path', scale: 1.1, y: 60, z: 2 });
  }

  // --- PHASE 3: WATER SOURCE (Row 5: Levels 33-40) ---
  if (v > 32) {
    layers.push({ id: 'pond', assetId: 'pixel-pond', scale: 0.8, x: 50, y: 30, z: 3, animate: true });
  }

  // --- PHASE 4: SANCTUARY DECOR (Row 6: Levels 41-48) ---
  if (v > 40) {
    layers.push({ id: 'bench', assetId: 'pixel-bench', scale: 0.7, x: -40, y: 80, z: 20 });
    layers.push({ id: 'lantern', assetId: 'pixel-lantern', scale: 0.8, x: -90, y: 10, z: 25 });
  }

  // --- PHASE 5: BLOOM & LIFE (Rows 7-8: Levels 49-64) ---
  if (v > 48) {
    layers.push({ id: 'flowers', assetId: 'pixel-flower-variety', scale: 0.6, y: 50, z: 15 });
    layers.push({ id: 'butterflies', assetId: 'pixel-butterfly', scale: 0.5, x: 60, y: -80, z: 50, animate: true });
  }

  return layers;
}

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
