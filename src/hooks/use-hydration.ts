"use client"

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateHydrationEncouragement } from '@/ai/flows/hydration-encouragement-generator';
import { getLocalDayKey, getStartOfLocalDayISO } from '@/lib/date-utils';

export type UserSettings = {
  name: string;
  dailyGoalGlasses: number;
  soundEnabled: boolean;
};

const REFRESHING_MESSAGES = [
  "Sanctuary nourished!",
  "Pure life added.",
  "Refreshing drop!",
  "Roots drinking deeply.",
  "Sanctuary feels alive.",
];

export function useHydration() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [aiMessage, setAiMessage] = useState<string>('');
  
  // Reactive "today" key to handle day changes while the app is open
  const [todayKey, setTodayKey] = useState(getLocalDayKey());

  // Check for day changes every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nowKey = getLocalDayKey();
      if (nowKey !== todayKey) {
        setTodayKey(nowKey);
      }
    }, 30000);
    
    // Also check on window focus (app resumed from background)
    const handleFocus = () => {
      const nowKey = getLocalDayKey();
      if (nowKey !== todayKey) {
        setTodayKey(nowKey);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [todayKey]);

  // 1. Fetch User Profile
  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  // 2. Fetch Today's Logs - Now reactively depends on todayKey
  const logsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'logs');
  }, [firestore, user]);

  const todayQuery = useMemoFirebase(() => {
    if (!logsRef) return null;
    // Query logs from the start of the current reactive local day
    const startOfToday = getStartOfLocalDayISO();
    return query(logsRef, where('timestamp', '>=', startOfToday), orderBy('timestamp', 'desc'));
  }, [logsRef, todayKey]); // todayKey ensures the query refreshes at midnight

  const { data: logs, isLoading: isLogsLoading } = useCollection(todayQuery);

  const currentGlasses = useMemo(() => {
    if (!logs) return 0;
    return logs.reduce((acc, log) => acc + (log.glassesCount || 1), 0);
  }, [logs]);

  const dailyProgressPercent = useMemo(() => {
    if (!profile) return 0;
    return Math.min(100, (currentGlasses / profile.dailyGoalGlasses) * 100);
  }, [currentGlasses, profile]);

  const addGlass = useCallback(async () => {
    if (!user || !profile || !logsRef || !userRef) return;

    // Use current reactive day key for consistent reward tracking
    const activeDayKey = getLocalDayKey();
    const isGoalReached = (currentGlasses + 1) >= profile.dailyGoalGlasses;
    const isFirstDrinkOfDay = currentGlasses === 0;

    // 1. Add Log Entry
    const newLog = {
      userId: user.uid,
      glassesCount: 1,
      timestamp: new Date().toISOString(),
    };
    addDocumentNonBlocking(logsRef, newLog);

    // 2. Update Profile (Stars & Bonus)
    let extraStars = 1; // 1 star per glass
    let newBonusDates = [...(profile.bonusEarnedDates || [])];

    // Check if the goal bonus was already earned today using the local day key
    if (isGoalReached && !newBonusDates.includes(activeDayKey)) {
      extraStars += 5; // +5 for reaching goal
      newBonusDates.push(activeDayKey);
    }

    updateDocumentNonBlocking(userRef, {
      totalStars: (profile.totalStars || 0) + extraStars,
      bonusEarnedDates: newBonusDates,
      updatedAt: new Date().toISOString(),
    });

    // 3. AI Feedback
    const immediateMsg = REFRESHING_MESSAGES[Math.floor(Math.random() * REFRESHING_MESSAGES.length)];
    setAiMessage(immediateMsg);
    
    setTimeout(() => {
      setAiMessage(prev => prev === immediateMsg ? '' : prev);
    }, 3000);

    generateHydrationEncouragement({
      userName: profile.displayName,
      amountDrankMl: 250,
      currentAmountMl: (currentGlasses + 1) * 250,
      dailyGoalMl: profile.dailyGoalGlasses * 250,
      isFirstDrinkOfDay,
      isGoalReached,
      remainingAmountMl: Math.max(0, (profile.dailyGoalGlasses - (currentGlasses + 1)) * 250),
    }).then(response => {
      setAiMessage(response.message);
      setTimeout(() => {
        setAiMessage(prev => prev === response.message ? '' : prev);
      }, 5000); // 5s for reading AI messages
    }).catch(() => {
      // Graceful fallback if Genkit quota or network fails
    });
  }, [user, profile, logsRef, userRef, currentGlasses]);

  const setSettings = useCallback((newSettings: Partial<UserSettings>) => {
    if (!userRef || !profile) return;
    updateDocumentNonBlocking(userRef, {
      displayName: newSettings.name ?? profile.displayName,
      dailyGoalGlasses: newSettings.dailyGoalGlasses ?? profile.dailyGoalGlasses,
      soundEnabled: newSettings.soundEnabled ?? (profile.soundEnabled !== undefined ? profile.soundEnabled : true),
      updatedAt: new Date().toISOString(),
    });
  }, [userRef, profile]);

  const resetApp = useCallback(async () => {
    if (!user || !firestore) return;

    const batch = writeBatch(firestore);
    const logsColRef = collection(firestore, 'users', user.uid, 'logs');
    const logsSnap = await getDocs(logsColRef);
    logsSnap.forEach(doc => batch.delete(doc.ref));

    const profileRef = doc(firestore, 'users', user.uid);
    batch.delete(profileRef);

    await batch.commit();
    localStorage.clear();
    window.location.reload();
  }, [user, firestore]);

  const achievements = [
    { id: 'first_glass', name: 'First Drop', description: 'Gave the soil its first glass of life.', unlockedAt: profile?.totalStars ? Date.now() : undefined },
    { id: 'daily_goal', name: 'Full Bloom', description: 'Met your daily hydration ritual.', unlockedAt: profile?.bonusEarnedDates?.length ? Date.now() : undefined },
  ];

  return {
    settings: {
      name: profile?.displayName || 'Guardian',
      dailyGoalGlasses: profile?.dailyGoalGlasses || 8,
      soundEnabled: profile?.soundEnabled !== undefined ? profile.soundEnabled : true,
    },
    setSettings,
    logs: logs || [],
    todayLogs: logs || [],
    currentGlasses,
    dailyProgressPercent,
    totalStars: profile?.totalStars || 0,
    streak: 0,
    achievements,
    onboardingComplete: !!profile,
    addGlass,
    resetApp,
    aiMessage,
    isLoading: isAuthLoading || (!!user && isProfileLoading)
  };
}
