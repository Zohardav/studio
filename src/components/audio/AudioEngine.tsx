"use client"

import * as React from 'react';

/**
 * AudioEngine - Manages app sound effects and atmosphere using Tone.js.
 * We dynamically import Tone to avoid issues during server-side pre-rendering.
 */

export const useAudio = (enabled: boolean) => {
  const playWaterLog = React.useCallback(async () => {
    if (!enabled) return;
    
    // Dynamic import to prevent SSR evaluation errors
    const Tone = await import('tone');
    
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 1 },
      volume: -10
    }).toDestination();
    
    const now = Tone.now();
    synth.triggerAttackRelease("C5", "16n", now);
    synth.triggerAttackRelease("G5", "16n", now + 0.05);
    
    setTimeout(() => synth.dispose(), 2000);
  }, [enabled]);

  const playAchievement = React.useCallback(async () => {
    if (!enabled) return;
    
    const Tone = await import('tone');
    
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
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
  const musicStateRef = React.useRef<{
    player?: any;
    filter?: any;
    loop?: any;
  }>({});

  React.useEffect(() => {
    let active = true;

    const startMusic = async () => {
      if (!enabled) {
        const Tone = await import('tone');
        if (Tone.getTransport().state === 'started') {
          Tone.getTransport().stop();
        }
        return;
      }

      const Tone = await import('tone');
      if (!active) return;

      if (!musicStateRef.current.player) {
        musicStateRef.current.filter = new Tone.Filter(800, "lowpass").toDestination();
        musicStateRef.current.player = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "fatsine", count: 3, spread: 30 },
          envelope: { attack: 4, decay: 2, sustain: 0.8, release: 5 },
          volume: -12
        }).connect(musicStateRef.current.filter);

        const sequence = ["C3", "G3", "A3", "E3", "F3", "G3"];
        let index = 0;

        musicStateRef.current.loop = new Tone.Loop((time) => {
          if (musicStateRef.current.player) {
            musicStateRef.current.player.triggerAttackRelease(sequence[index % sequence.length], "1n", time);
            index++;
          }
        }, "2n").start(0);
      }

      if (Tone.context.state === 'running') {
        Tone.getTransport().start();
      }
    };

    startMusic();

    return () => {
      active = false;
      const cleanup = async () => {
        const Tone = await import('tone');
        Tone.getTransport().stop();
        if (musicStateRef.current.player) musicStateRef.current.player.dispose();
        if (musicStateRef.current.filter) musicStateRef.current.filter.dispose();
        if (musicStateRef.current.loop) musicStateRef.current.loop.dispose();
        musicStateRef.current = {};
      };
      cleanup();
    };
  }, [enabled]);
};
