/**
 * @fileOverview Logic for the 64-stage visual progression engine (mapped from 100 hydration stages).
 * Updated to reflect the initial world state from user image.
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
 * Composition updated to match initial state: tree on right, rocks scattered.
 */
export function getLayersForStage(stageId: number): WorldLayer[] {
  const v = getVisualLevel(stageId);
  const layers: WorldLayer[] = [];

  // --- 1. GROUND LAYER ---
  let groundAsset = "pixel-soil-dry"; // Sandy soil base
  if (v > 8) groundAsset = "pixel-soil-moist";
  if (v > 16) groundAsset = "pixel-soil-lush";
  if (v > 48) groundAsset = "pixel-soil-dense";
  layers.push({ id: 'ground', assetId: groundAsset, scale: 1.2, y: 0, z: 1 });

  // --- 2. INITIAL DECOR (ROCKS & WEEDS) ---
  // In Phase 1, we match the photo: rocks on left/bottom
  if (v <= 24) {
    layers.push({ id: 'rocks-left', assetId: 'pixel-rocks', scale: 0.4, x: -100, y: -40, z: 5 });
    layers.push({ id: 'rocks-bottom', assetId: 'pixel-rocks', scale: 0.3, x: 20, y: 100, z: 6 });
  }

  // --- 3. THE PATHWAY (Appears in Phase 4) ---
  if (v > 24) {
    layers.push({ id: 'path', assetId: 'pixel-path', scale: 1.1, y: 60, z: 2 });
  }

  // --- 4. THE WATER (Appears in Phase 5) ---
  if (v > 32) {
    layers.push({ id: 'pond', assetId: 'pixel-pond', scale: 0.9, x: 40, y: 40, z: 3, animate: true });
  }

  // --- 5. THE TREE (Evolves continuously) ---
  // Initial state from photo: spindly tree on the upper right
  let treeAsset = "pixel-tree-small";
  let treeScale = 0.5;
  let treeX = 100; // Right side
  let treeY = -80; // Upper side

  if (v > 8) { 
    treeScale = 0.8; 
    treeX = 60; // Moves slightly inward as it grows
    treeY = -40;
  }
  if (v > 20) { 
    treeAsset = "pixel-tree-mature"; 
    treeScale = 1.0; 
    treeX = 0; // Centers as it becomes the focal point
    treeY = -20;
  }
  if (v > 48) { 
    treeAsset = "pixel-tree-fruit"; 
    treeScale = 1.2; 
    treeX = 0; 
    treeY = -20; 
  }

  // Final phase replaces tree with Fountain
  if (v <= 56) {
    layers.push({ id: 'tree', assetId: treeAsset, scale: treeScale, x: treeX, y: treeY, z: 10 });
  } else {
    layers.push({ id: 'fountain', assetId: 'pixel-fountain', scale: 1.3, y: -40, z: 100, animate: true });
  }

  // --- 6. EXTRA DECORATIONS ---
  // Flowers/Weeds
  if (v > 16) {
    layers.push({ id: 'flora', assetId: 'pixel-flower-blue', scale: 0.4, x: -60, y: 40, z: 15 });
  }
  
  // Bench
  if (v > 40) {
    layers.push({ id: 'bench', assetId: 'pixel-bench', scale: 0.7, x: 30, y: 80, z: 20 });
  }

  // Lantern
  if (v > 44) {
    layers.push({ id: 'lantern', assetId: 'pixel-lantern', scale: 0.8, x: -80, y: 0, z: 25 });
  }

  // Butterflies
  if (v > 52) {
    layers.push({ id: 'butterflies', assetId: 'pixel-butterfly', scale: 0.5, x: 40, y: -100, z: 50, animate: true });
  }
  
  // Magical Gold Flower
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
