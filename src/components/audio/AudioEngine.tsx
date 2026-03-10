"use client"

import * as React from 'react';
import * as Tone from 'tone';

export const useAudio = (enabled: boolean) => {
  const playWaterLog = React.useCallback(() => {
    if (!enabled) return;
    
    // A high-pitched, soft "plink" using a sine wave
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 }
    }).toDestination();
    
    // Pentatonic high note for positive feedback
    synth.triggerAttackRelease("C5", "16n");
    setTimeout(() => synth.triggerAttackRelease("G5", "16n"), 50);
  }, [enabled]);

  const playAchievement = React.useCallback(() => {
    if (!enabled) return;
    
    // Arpeggio of sparkly notes
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 2 }
    }).toDestination();
    
    const notes = ["C4", "E4", "G4", "B4", "C5"];
    notes.forEach((note, i) => {
      setTimeout(() => synth.triggerAttackRelease(note, "8n"), i * 100);
    });
  }, [enabled]);

  const playUnlock = React.useCallback(() => {
    if (!enabled) return;
    
    // Warm low to high swell
    const synth = new Tone.MonoSynth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.3, decay: 0.5, sustain: 0.5, release: 1 }
    }).toDestination();
    
    synth.triggerAttackRelease("G3", "4n");
    setTimeout(() => synth.triggerAttackRelease("G4", "2n"), 300);
  }, [enabled]);

  return { playWaterLog, playAchievement, playUnlock };
};