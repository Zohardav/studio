
/**
 * @fileOverview Logic for mapping hydration to world stages.
 */

export const MAX_STAGES = 64;
export const ML_PER_STAGE = 100;

export function calculateStageNumber(totalMl: number): number {
  const stage = Math.floor(totalMl / ML_PER_STAGE) + 1;
  return Math.min(MAX_STAGES, stage);
}

export function getThresholdForStage(stageNumber: number): number {
  return (stageNumber - 1) * ML_PER_STAGE;
}

export function getNextMilestoneInfo(stageNumber: number, totalMl: number) {
  const nextTarget = Math.min(MAX_STAGES, stageNumber + 1);
  const targetMl = getThresholdForStage(nextTarget);
  const remainingMl = Math.max(0, targetMl - totalMl);
  
  return {
    nextStage: nextTarget,
    remainingMl,
    progressPercent: Math.min(100, (totalMl / targetMl) * 100)
  };
}
