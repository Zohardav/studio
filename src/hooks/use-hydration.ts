"use client"

import { useState, useEffect, useCallback } from 'react';
import { generateHydrationEncouragement } from '@/ai/flows/hydration-encouragement-generator';

export type UserSettings = {
  name: string;
  dailyGoalMl: number;
  glassSizeMl: number;
  worldTheme: 'garden' | 'island' | 'room';
  soundEnabled: boolean;
  celebrationsEnabled: boolean;
};

export type HydrationLog = {
  id: string;
  timestamp: number;
  amountMl: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  unlockedAt?: number;
};

const DEFAULT_SETTINGS: UserSettings = {
  name: 'Guest',
  dailyGoalMl: 2000,
  glassSizeMl: 250,
  worldTheme: 'garden',
  soundEnabled: true,
  celebrationsEnabled: true,
};

export function useHydration() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_drink', name: 'First Sip', description: 'Log your first glass of water.' },
    { id: 'daily_goal', name: 'Goal Achiever', description: 'Reach your daily hydration goal.' },
    { id: 'streak_3', name: 'Consistency King', description: 'Maintain a 3-day hydration streak.' },
  ]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>('');

  // Load data
  useEffect(() => {
    const storedSettings = localStorage.getItem('hydration_settings');
    const storedLogs = localStorage.getItem('hydration_logs');
    const storedAchievements = localStorage.getItem('hydration_achievements');
    const storedOnboarding = localStorage.getItem('hydration_onboarding');

    if (storedSettings) setSettings(JSON.parse(storedSettings));
    if (storedLogs) setLogs(JSON.parse(storedLogs));
    if (storedAchievements) setAchievements(JSON.parse(storedAchievements));
    if (storedOnboarding) setOnboardingComplete(JSON.parse(storedOnboarding));
  }, []);

  // Sync data
  useEffect(() => {
    localStorage.setItem('hydration_settings', JSON.stringify(settings));
    localStorage.setItem('hydration_logs', JSON.stringify(logs));
    localStorage.setItem('hydration_achievements', JSON.stringify(achievements));
    localStorage.setItem('hydration_onboarding', JSON.stringify(onboardingComplete));
  }, [settings, logs, achievements, onboardingComplete]);

  const todayLogs = logs.filter(log => {
    const date = new Date(log.timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  });

  const currentAmountMl = todayLogs.reduce((acc, log) => acc + log.amountMl, 0);
  const progressPercent = Math.min(100, (currentAmountMl / settings.dailyGoalMl) * 100);

  const addWater = useCallback(async (amountMl: number) => {
    const newLog: HydrationLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      amountMl,
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);

    // AI Encouragement
    const isGoalReached = (currentAmountMl + amountMl) >= settings.dailyGoalMl;
    const isFirstDrinkOfDay = todayLogs.length === 0;
    
    try {
      const response = await generateHydrationEncouragement({
        userName: settings.name,
        amountDrankMl: amountMl,
        currentAmountMl: currentAmountMl + amountMl,
        dailyGoalMl: settings.dailyGoalMl,
        isFirstDrinkOfDay,
        isGoalReached,
        remainingAmountMl: Math.max(0, settings.dailyGoalMl - (currentAmountMl + amountMl)),
      });
      setAiMessage(response.message);
    } catch (e) {
      setAiMessage("Great job staying hydrated!");
    }

    // Check achievements
    setAchievements(prev => prev.map(a => {
      if (a.id === 'first_drink' && !a.unlockedAt) {
        return { ...a, unlockedAt: Date.now() };
      }
      if (a.id === 'daily_goal' && isGoalReached && !a.unlockedAt) {
        return { ...a, unlockedAt: Date.now() };
      }
      return a;
    }));
  }, [logs, currentAmountMl, settings, todayLogs.length]);

  return {
    settings,
    setSettings,
    logs,
    todayLogs,
    currentAmountMl,
    progressPercent,
    streak,
    achievements,
    onboardingComplete,
    setOnboardingComplete,
    addWater,
    aiMessage,
  };
}