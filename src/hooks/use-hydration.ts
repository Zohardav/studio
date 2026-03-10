"use client"

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  name: 'Guardian',
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
    { id: 'first_drink', name: 'Awakening', description: 'Gave the soil its first drop.' },
    { id: 'daily_goal', name: 'Nourisher', description: 'Met the daily hydration ritual.' },
    { id: 'streak_3', name: 'Constant Care', description: 'Protected the world for 3 days.' },
    { id: 'big_gulp', name: 'Spring Flood', description: 'Logged 500ml at once.' },
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

  const todayLogs = useMemo(() => logs.filter(log => {
    const date = new Date(log.timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }), [logs]);

  const currentAmountMl = useMemo(() => todayLogs.reduce((acc, log) => acc + log.amountMl, 0), [todayLogs]);
  const progressPercent = Math.min(100, (currentAmountMl / settings.dailyGoalMl) * 100);

  // Growth Score Logic: The heart of the 100-stage progression
  const growthScore = useMemo(() => {
    // Stage is 0-100.
    // Daily progress accounts for up to 40 points
    // Streak accounts for up to 30 points (10 days = max)
    // Lifetime logs account for up to 30 points (100 logs = max)
    const dailyPoints = (currentAmountMl / settings.dailyGoalMl) * 40;
    const streakPoints = Math.min(30, (streak || 0) * 3);
    const logPoints = Math.min(30, logs.length / 3);
    
    return Math.min(100, dailyPoints + streakPoints + logPoints);
  }, [currentAmountMl, settings.dailyGoalMl, streak, logs.length]);

  const addWater = useCallback(async (amountMl: number) => {
    const newLog: HydrationLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      amountMl,
    };

    setLogs(prev => [...prev, newLog]);

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
      setAiMessage("Your world feels refreshed!");
    }

    // Check achievements
    setAchievements(prev => prev.map(a => {
      if (a.id === 'first_drink' && !a.unlockedAt) return { ...a, unlockedAt: Date.now() };
      if (a.id === 'daily_goal' && isGoalReached && !a.unlockedAt) return { ...a, unlockedAt: Date.now() };
      if (a.id === 'big_gulp' && amountMl >= 500 && !a.unlockedAt) return { ...a, unlockedAt: Date.now() };
      return a;
    }));
  }, [currentAmountMl, settings, todayLogs.length]);

  return {
    settings,
    setSettings,
    logs,
    todayLogs,
    currentAmountMl,
    progressPercent,
    growthScore,
    streak,
    achievements,
    onboardingComplete,
    setOnboardingComplete,
    addWater,
    aiMessage,
  };
}