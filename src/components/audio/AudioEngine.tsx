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

  return { playWaterLog, playAchievement };
};

export const useBackgroundMusic = (enabled: boolean) => {
  const playerRef = React.useRef<Tone.PolySynth | null>(null);
  const filterRef = React.useRef<Tone.Filter | null>(null);
  const loopRef = React.useRef<Tone.Loop | null>(null);

  React.useEffect(() => {
    if (enabled && !playerRef.current) {
      // Create a soft ambient synth
      filterRef.current = new Tone.Filter(800, "lowpass").toDestination();
      playerRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 2, decay: 1, sustain: 1, release: 4 },
        volume: -25 // Very low volume
      }).connect(filterRef.current);

      // Simple ambient pentatonic progression
      const sequence = ["C3", "G3", "A3", "E4", "G4", "C4"];
      let index = 0;

      loopRef.current = new Tone.Loop((time) => {
        if (playerRef.current) {
          playerRef.current.triggerAttackRelease(sequence[index % sequence.length], "2n", time);
          index++;
        }
      }, "4n").start(0);
    }

    if (enabled) {
      Tone.start();
      Tone.getTransport().start();
    } else {
      Tone.getTransport().stop();
      if (playerRef.current) {
        playerRef.current.releaseAll();
      }
    }

    return () => {
      Tone.getTransport().stop();
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      if (filterRef.current) {
        filterRef.current.dispose();
        filterRef.current = null;
      }
      if (loopRef.current) {
        loopRef.current.dispose();
        loopRef.current = null;
      }
    };
  }, [enabled]);
};
