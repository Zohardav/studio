
"use client"

import * as React from 'react';
import * as Tone from 'tone';

export const useAudio = (enabled: boolean) => {
  const playWaterLog = React.useCallback(async () => {
    if (!enabled) return;
    await Tone.start();
    
    // A high-pitched, soft "plink" using a sine wave
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 },
      volume: -10
    }).toDestination();
    
    // Pentatonic high note for positive feedback
    const now = Tone.now();
    synth.triggerAttackRelease("C5", "16n", now);
    synth.triggerAttackRelease("G5", "16n", now + 0.05);
    
    // Cleanup
    setTimeout(() => synth.dispose(), 2000);
  }, [enabled]);

  const playAchievement = React.useCallback(async () => {
    if (!enabled) return;
    await Tone.start();
    
    // Arpeggio of sparkly notes
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 2 },
      volume: -8
    }).toDestination();
    
    const notes = ["C4", "E4", "G4", "B4", "C5"];
    const now = Tone.now();
    notes.forEach((note, i) => {
      synth.triggerAttackRelease(note, "8n", now + (i * 0.1));
    });

    setTimeout(() => synth.dispose(), 4000);
  }, [enabled]);

  return { playWaterLog, playAchievement };
};

export const useBackgroundMusic = (enabled: boolean) => {
  const playerRef = React.useRef<Tone.PolySynth | null>(null);
  const filterRef = React.useRef<Tone.Filter | null>(null);
  const loopRef = React.useRef<Tone.Loop | null>(null);

  React.useEffect(() => {
    if (enabled && !playerRef.current) {
      // Create a soft ambient synth with a bit more volume
      filterRef.current = new Tone.Filter(800, "lowpass").toDestination();
      playerRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "fatsine", count: 3, spread: 30 },
        envelope: { attack: 4, decay: 2, sustain: 0.8, release: 5 },
        volume: -10 // Increased from -18 for better visibility
      }).connect(filterRef.current);

      // Simple ambient pentatonic progression
      const sequence = ["C3", "G3", "A3", "E3", "F3", "G3"];
      let index = 0;

      loopRef.current = new Tone.Loop((time) => {
        if (playerRef.current) {
          playerRef.current.triggerAttackRelease(sequence[index % sequence.length], "1n", time);
          index++;
        }
      }, "2n").start(0);
    }

    if (enabled) {
      Tone.start();
      Tone.getTransport().start();
      if (Tone.context.state !== 'running') {
        Tone.context.resume();
      }
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
