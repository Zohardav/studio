"use client"

import * as React from 'react';
import * as Tone from 'tone';

export const useAudio = (enabled: boolean) => {
  const playWaterLog = React.useCallback(() => {
    if (!enabled) return;
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.triggerAttackRelease(["C4", "E4", "G4"], "8n");
  }, [enabled]);

  const playAchievement = React.useCallback(() => {
    if (!enabled) return;
    const synth = new Tone.MonoSynth({
      oscillator: { type: "square" },
      envelope: { attack: 0.1 }
    }).toDestination();
    synth.triggerAttackRelease("C5", "4n");
    setTimeout(() => synth.triggerAttackRelease("G5", "2n"), 150);
  }, [enabled]);

  return { playWaterLog, playAchievement };
};