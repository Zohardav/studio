
"use client"

import { useCallback, useMemo, useState } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateHydrationEncouragement } from '@/ai/flows/hydration-encouragement-generator';

export type UserSettings = {
  name: string;
  dailyGoalGlasses: number;
  soundEnabled: boolean;
};

const REFRESHING_MESSAGES = [
  "The soil drinks deeply...",
  "Your sanctuary is grateful.",
  "Nourishing the roots...",
  "A refreshing drop of life.",
  "The garden breathes a sigh of relief.",
];

export function useHydration() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const [aiMessage, setAiMessage] = useState<string>('');

  // 1. Fetch User Profile
  const userRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);

  // 2. Fetch Today's Logs
  const logsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'logs');
  }, [firestore, user]);

  const todayQuery = useMemoFirebase(() => {
    if (!logsRef) return null;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return query(logsRef, where('timestamp', '>=', startOfDay.toISOString()), orderBy('timestamp', 'desc'));
  }, [logsRef]);

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

    const todayStr = new Date().toISOString().split('T')[0];
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

    if (isGoalReached && !newBonusDates.includes(todayStr)) {
      extraStars += 5; // +5 for reaching goal
      newBonusDates.push(todayStr);
    }

    updateDocumentNonBlocking(userRef, {
      totalStars: (profile.totalStars || 0) + extraStars,
      bonusEarnedDates: newBonusDates,
      updatedAt: new Date().toISOString(),
    });

    // 3. AI Feedback
    const immediateMsg = REFRESHING_MESSAGES[Math.floor(Math.random() * REFRESHING_MESSAGES.length)];
    setAiMessage(immediateMsg);

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
    }).catch(() => {
      // Quota issues or errors handled gracefully
    });
  }, [user, profile, logsRef, userRef, currentGlasses]);

  const setSettings = useCallback((newSettings: Partial<UserSettings>) => {
    if (!userRef || !profile) return;
    updateDocumentNonBlocking(userRef, {
      displayName: newSettings.name ?? profile.displayName,
      dailyGoalGlasses: newSettings.dailyGoalGlasses ?? profile.dailyGoalGlasses,
      updatedAt: new Date().toISOString(),
    });
  }, [userRef, profile]);

  const achievements = [
    { id: 'first_glass', name: 'First Drop', description: 'Gave the soil its first glass of life.', unlockedAt: profile?.totalStars ? Date.now() : undefined },
    { id: 'daily_goal', name: 'Full Bloom', description: 'Met your daily hydration ritual.', unlockedAt: profile?.bonusEarnedDates?.length ? Date.now() : undefined },
  ];

  const debugReset = useCallback(async () => {
    if (!user || !firestore || !userRef || !logsRef) return;
    
    if (window.confirm("Are you sure? This will delete your entire sanctuary progress forever.")) {
      try {
        // 1. Fetch all logs and delete them in batches
        const snapshot = await getDocs(logsRef);
        const batch = writeBatch(firestore);
        snapshot.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
        
        // 2. Delete user profile
        await deleteDoc(userRef);
        
        // 3. Force a reload to ensure all local state is cleared and onboarding triggers
        window.location.reload();
      } catch (error) {
        console.error("Reset failed:", error);
        alert("Reset failed. Please try again.");
      }
    }
  }, [user, firestore, userRef, logsRef]);

  const debugAddStreak = useCallback(() => {
    if (!userRef || !profile) return;
    updateDocumentNonBlocking(userRef, {
      totalStars: (profile.totalStars || 0) + 50,
    });
  }, [userRef, profile]);

  const developerInitialize = useCallback(async () => {
    if (!user?.uid || !firestore) return;

    const goAhead = window.confirm("Developer Action: Completely initialize sanctuary data?");
    if (!goAhead) return;

    // Independent implementation style using manual path references
    const profilePath = doc(firestore, 'users', user.uid);
    const logsPath = collection(firestore, 'users', user.uid, 'logs');

    try {
      // 1. Manually fetch the snapshot to clear subcollections
      const logEntries = await getDocs(logsPath);
      const initBatch = writeBatch(firestore);

      // 2. Queue all deletions
      logEntries.docs.forEach(l => initBatch.delete(l.ref));
      initBatch.delete(profilePath);

      // 3. Execute batch
      await initBatch.commit();
      
      // 4. Reset application environment
      window.location.replace(window.location.origin);
    } catch (err) {
      console.error("Initialize Sanctuary Error:", err);
      alert("Failed to initialize sanctuary.");
    }
  }, [user, firestore]);

  return {
    settings: {
      name: profile?.displayName || 'Guardian',
      dailyGoalGlasses: profile?.dailyGoalGlasses || 8,
      soundEnabled: true,
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
    aiMessage,
    isLoading: isAuthLoading || (!!user && isProfileLoading),
    debugReset,
    debugAddStreak,
    developerInitialize
  };
}
