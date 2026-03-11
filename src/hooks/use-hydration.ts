
"use client"

import { useState, useEffect, useCallback, useMemo } from 'react';
import { generateHydrationEncouragement } from '@/ai/flows/hydration-encouragement-generator';

export type UserSettings = {
  name: string;
  dailyGoalGlasses: number;
  soundEnabled: boolean;
};

export type HydrationLog = {
  id: string;
  timestamp: number;
  glassesCount: number;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  unlockedAt?: number;
};

const DEFAULT_SETTINGS: UserSettings = {
  name: 'Guardian',
  dailyGoalGlasses: 8,
  soundEnabled: true,
};

const REFRESHING_MESSAGES = [
  "The soil drinks deeply...",
  "Your sanctuary is grateful.",
  "Nourishing the roots...",
  "A refreshing drop of life.",
  "The garden breathes a sigh of relief.",
];

export function useHydration() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<HydrationLog[]>([]);
  const [totalStars, setTotalStars] = useState(0);
  const [bonusEarnedDates, setBonusEarnedDates] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [aiMessage, setAiMessage] = useState<string>('');
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_glass', name: 'First Drop', description: 'Gave the soil its first glass of life.' },
    { id: 'daily_goal', name: 'Full Bloom', description: 'Met your daily hydration ritual.' },
    { id: 'streak_3', name: 'Constant Care', description: 'Protected the world for 3 days.' },
  ]);

  // Load data
  useEffect(() => {
    const storedSettings = localStorage.getItem('hydration_settings');
    const storedLogs = localStorage.getItem('hydration_logs');
    const storedAchievements = localStorage.getItem('hydration_achievements');
    const storedOnboarding = localStorage.getItem('hydration_onboarding');
    const storedStreak = localStorage.getItem('hydration_streak');
    const storedStars = localStorage.getItem('hydration_total_stars');
    const storedBonuses = localStorage.getItem('hydration_bonus_dates');

    if (storedSettings) setSettings(JSON.parse(storedSettings));
    if (storedLogs) setLogs(JSON.parse(storedLogs));
    if (storedAchievements) setAchievements(JSON.parse(storedAchievements));
    if (storedOnboarding) setOnboardingComplete(JSON.parse(storedOnboarding));
    if (storedStreak) setStreak(JSON.parse(storedStreak));
    if (storedStars) setTotalStars(JSON.parse(storedStars));
    if (storedBonuses) setBonusEarnedDates(JSON.parse(storedBonuses));
  }, []);

  // Sync data
  useEffect(() => {
    localStorage.setItem('hydration_settings', JSON.stringify(settings));
    localStorage.setItem('hydration_logs', JSON.stringify(logs));
    localStorage.setItem('hydration_achievements', JSON.stringify(achievements));
    localStorage.setItem('hydration_onboarding', JSON.stringify(onboardingComplete));
    localStorage.setItem('hydration_streak', JSON.stringify(streak));
    localStorage.setItem('hydration_total_stars', JSON.stringify(totalStars));
    localStorage.setItem('hydration_bonus_dates', JSON.stringify(bonusEarnedDates));
  }, [settings, logs, achievements, onboardingComplete, streak, totalStars, bonusEarnedDates]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const todayLogs = useMemo(() => logs.filter(log => {
    const date = new Date(log.timestamp);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }), [logs]);

  const currentGlasses = useMemo(() => todayLogs.reduce((acc, log) => acc + log.glassesCount, 0), [todayLogs]);
  const dailyProgressPercent = Math.min(100, (currentGlasses / settings.dailyGoalGlasses) * 100);

  const addGlass = useCallback(async () => {
    const newLog: HydrationLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      glassesCount: 1,
    };

    setLogs(prev => [...prev, newLog]);
    
    // Earn 1 star for the glass
    setTotalStars(prev => prev + 1);

    // AI Encouragement logic
    const isGoalReached = (currentGlasses + 1) >= settings.dailyGoalGlasses;
    const isFirstDrinkOfDay = todayLogs.length === 0;

    // Set an immediate message for instant feedback
    const immediateMsg = REFRESHING_MESSAGES[Math.floor(Math.random() * REFRESHING_MESSAGES.length)];
    setAiMessage(immediateMsg);

    // Check for daily bonus
    if (isGoalReached && !bonusEarnedDates.includes(todayStr)) {
      setTotalStars(prev => prev + 5);
      setBonusEarnedDates(prev => [...prev, todayStr]);
    }
    
    try {
      const response = await generateHydrationEncouragement({
        userName: settings.name,
        amountDrankMl: 250,
        currentAmountMl: (currentGlasses + 1) * 250,
        dailyGoalMl: settings.dailyGoalGlasses * 250,
        isFirstDrinkOfDay,
        isGoalReached,
        remainingAmountMl: Math.max(0, (settings.dailyGoalGlasses - (currentGlasses + 1)) * 250),
      });
      setAiMessage(response.message);
    } catch (e) {
      setAiMessage("Your sanctuary feels refreshed by your care!");
    }

    // Check achievements
    setAchievements(prev => prev.map(a => {
      if (a.id === 'first_glass' && !a.unlockedAt) return { ...a, unlockedAt: Date.now() };
      if (a.id === 'daily_goal' && isGoalReached && !a.unlockedAt) return { ...a, unlockedAt: Date.now() };
      return a;
    }));
  }, [currentGlasses, settings, todayLogs.length, bonusEarnedDates, todayStr]);

  const debugReset = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  const debugNextDay = useCallback(() => {
    setLogs(prev => prev.map(log => ({
      ...log,
      timestamp: log.timestamp - (24 * 60 * 60 * 1000)
    })));
    if (currentGlasses >= settings.dailyGoalGlasses) {
      setStreak(s => s + 1);
    }
  }, [currentGlasses, settings.dailyGoalGlasses]);

  const debugAddStreak = useCallback(() => {
    setStreak(s => s + 1);
    setTotalStars(prev => prev + 50); 
  }, []);

  return {
    settings,
    setSettings,
    logs,
    todayLogs,
    currentGlasses,
    dailyProgressPercent,
    totalStars,
    streak,
    achievements,
    onboardingComplete,
    setOnboardingComplete,
    addGlass,
    aiMessage,
    debugReset,
    debugNextDay,
    debugAddStreak
  };
}
