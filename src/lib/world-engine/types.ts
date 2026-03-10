/**
 * @fileOverview Types for the World Progression Engine.
 */

export type WorldLayer = {
  id: string;
  assetId: string;
  scale: number;
  x?: number;
  y?: number;
  z: number;
  animate?: boolean;
};

export type WorldStageDefinition = {
  id: number;
  name: string;
  thresholdMl: number;
  layers: WorldLayer[];
};

export type WorldTheme = 'garden' | 'island' | 'sanctuary';
