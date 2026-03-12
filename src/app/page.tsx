"use client"

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { useHydration } from '@/hooks/use-hydration';
import { useAudio, useBackgroundMusic } from '@/components/audio/AudioEngine';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Droplets, Home, Scroll, Heart, Star, Loader2, ShieldCheck, Cloud, LogIn, VolumeX, Volume2, Trash2, ChevronRight, Lock, Gift, CheckCircle2, Construction } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useFirebase, initiateAnonymousSignIn, useCollection, useMemoFirebase, linkAccountToGoogle } from '@/firebase';
import { collection, query, orderBy, setDoc, doc } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import * as Tone from 'tone';

const PixelWorld = lazy(() => import('@/components/world/PixelWorld').then(m => ({ default: m.PixelWorld })));
const HydrationTracker = lazy(() => import('@/components/dashboard/HydrationTracker').then(m => ({ default: m.HydrationTracker })));
const Onboarding = lazy(() => import('@/components/dashboard/Onboarding').then(m => ({ default: m.Onboarding })));
const IntroOnboarding = lazy(() => import('@/components/dashboard/IntroOnboarding').then(m => ({ default: m.IntroOnboarding })));
const WorldLibrary = lazy(() => import('@/components/dashboard/WorldLibrary').then(m => ({ default: m.WorldLibrary })));

const GlassWaterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15.2 22H8.8c-.41 0-.78-.26-.92-.63L5 2h14l-2.88 19.37a1 1 0 0 1-.92.63Z" />
    <path d="M6 12h12" />
  </svg>
);

const LoadingSpinner = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
    <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Syncing Sanctuary...</p>
  </div>
);

export default function DrinkAndEarn() {
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [adminAuth, setAdminAuth] = useState('');
  const [isEvolutionGuideOpen, setIsEvolutionGuideOpen] = useState(false);
  const { auth, firestore, user } = useFirebase();
  const { 
    settings, setSettings, 
    currentGlasses, dailyProgressPercent, 
    addGlass, spendStar, onboardingComplete,
    aiMessage, achievements, todayLogs, totalStars, evolutionStars,
    isLoading, resetApp, isRewardClaimedToday, claimDailyReward
  } = useHydration();

  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const { playWaterLog, playAchievement } = useAudio(settings.soundEnabled);
  
  useBackgroundMusic(settings.soundEnabled);

  const stagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'worldStages'), orderBy('requiredStars', 'asc'));
  }, [firestore]);
  const { data: stages } = useCollection(stagesQuery);

  const nextStage = useMemo(() => {
    if (!stages) return null;
    return stages.find(s => s.requiredStars > evolutionStars) || null;
  }, [stages, evolutionStars]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (auth && !user && !isLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isLoading]);

  const handleAddGlass = async () => {
    if (settings.soundEnabled && Tone.context.state !== 'running') {
      await Tone.start();
    }
    addGlass();
    playWaterLog();
    
    if (currentGlasses + 1 >= settings.dailyGoalGlasses && currentGlasses < settings.dailyGoalGlasses) {
      toast({
        title: "Goal Fulfilled! +5 Stars Bonus ✨",
        description: "Your sanctuary glows with gratitude!",
      });
      playAchievement();
    }
  };

  const handleSpendStar = async () => {
    if (totalStars > 0) {
      spendStar();
      if (settings.soundEnabled && Tone.context.state !== 'running') {
        await Tone.start();
      }
      playAchievement();
    }
  };

  const handleClaimDailyReward = async () => {
    if (isRewardClaimedToday) return;
    
    if (settings.soundEnabled && Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    const success = await claimDailyReward();
    if (success) {
      playAchievement();
      toast({
        title: "Daily Star Claimed! ✨",
        description: "Your sanctuary grows stronger with every visit. Come back tomorrow!",
      });
    }
  };

  const handleOnboarding = async (name: string, goal: number) => {
    if (!user || !firestore) return;
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
      id: user.uid,
      displayName: name,
      dailyGoalGlasses: goal,
      totalStars: 0,
      evolutionStars: 0,
      bonusEarnedDates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleLinkAccount = async () => {
    try {
      await linkAccountToGoogle(auth);
      toast({
        title: "Sanctuary Secured! 🛡️",
        description: "Your progress is now linked to your Google account.",
      });
    } catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
        toast({
          variant: "destructive",
          title: "Setup Required",
          description: "Google Sign-In is not enabled in the Firebase Console.",
        });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Link failed",
          description: error.message,
        });
      }
    }
  };

  const handleResetApp = async () => {
    setIsResetting(true);
    try {
      await resetApp();
    } catch (error: any) {
      setIsResetting(false);
      toast({ variant: "destructive", title: "Reset Failed", description: error.message });
    }
  };

  const handleSoundToggle = async (val: boolean) => {
    if (val) await Tone.start();
    setSettings({...settings, soundEnabled: val});
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear().toString().slice(-2)}`;
    const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${dateStr} ${timeStr}`;
  };

  if (!mounted || isLoading || isResetting) {
    return <LoadingSpinner />;
  }

  if (showIntro) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <IntroOnboarding onComplete={() => setShowIntro(false)} />
      </Suspense>
    );
  }

  if (!onboardingComplete) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Onboarding onComplete={handleOnboarding} />
      </Suspense>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-svh bg-[#FFF9FC] dark:bg-[#120F1A] flex flex-col relative pb-32 pt-safe" suppressHydrationWarning>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden gpu-boost">
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-[-10%] left-[-20%] w-full h-[60%] bg-primary/10 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity }} className="absolute bottom-[-10%] right-[-20%] w-full h-[60%] bg-reward/10 rounded-full blur-[120px]" />
      </div>

      <header className="px-8 pt-8 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-headline font-bold text-foreground leading-none">
                Hi, <span className="text-primary">{settings.name}</span>
              </h1>
              <p className="text-[10px] font-black text-muted-foreground/40 tracking-widest uppercase">My Sanctuary</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="px-3 py-2 bg-white/80 border-2 border-primary/20 rounded-[1.2rem] shadow-sm flex gap-2 items-center">
                <GlassWaterIcon className="w-3.5 h-3.5 text-primary" />
                <span className="font-black text-[10px]">{currentGlasses}</span>
              </Badge>
              
              <Dialog open={isEvolutionGuideOpen} onOpenChange={setIsEvolutionGuideOpen}>
                <DialogTrigger asChild>
                  <motion.div whileTap={{ scale: 0.95 }} className="cursor-pointer">
                    <Badge variant="secondary" className="px-3 py-2 bg-white/80 border-2 border-reward/20 rounded-[1.2rem] shadow-sm flex gap-2 items-center hover:bg-reward/5 transition-colors">
                      <Star className="w-3.5 h-3.5 text-reward fill-reward" />
                      <span className="font-black text-[10px]">{totalStars}</span>
                    </Badge>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="max-w-[320px] rounded-[2.5rem] p-0 bg-white/40 backdrop-blur-3xl shadow-2xl overflow-hidden border border-white/20 z-[150]">
                  <div className="p-8 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-4 bg-reward/10 rounded-[2rem] border-2 border-reward/20 shadow-inner mb-2">
                        <Star className="h-8 w-8 text-reward fill-reward" />
                      </div>
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-headline font-bold">Evolution Guide</DialogTitle>
                        <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">How to earn stars</CardDescription>
                      </DialogHeader>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white/20 rounded-3xl border-2 border-primary/5">
                        <div className="flex items-center gap-3">
                          <GlassWaterIcon className="h-5 w-5 text-primary" />
                          <span className="text-xs font-bold">1 Glass</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-reward px-3 py-1 rounded-full text-white">
                          <Star className="h-3 w-3 fill-white" />
                          <span className="text-xs font-black">1</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/20 rounded-3xl border-2 border-reward/10">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-reward" />
                          <span className="text-xs font-bold">Daily Goal</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-reward px-3 py-1 rounded-full text-white">
                          <Star className="h-3 w-3 fill-white" />
                          <span className="text-xs font-black">5</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/20 rounded-3xl border-2 border-reward/10">
                        <div className="flex items-center gap-3">
                          <Gift className="h-5 w-5 text-reward" />
                          <span className="text-xs font-bold">Daily Login</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-reward px-3 py-1 rounded-full text-white">
                          <Star className="h-3 w-3 fill-white" />
                          <span className="text-xs font-black">1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="flex-1 px-8 space-y-6">
        <Tabs defaultValue="home" className="w-full">
          <TabsContent value="home" className="space-y-8 mt-0 focus-visible:ring-0">
            <Suspense fallback={<div className="aspect-square w-full rounded-[3rem] bg-muted animate-pulse" />}>
              <PixelWorld 
                evolutionStars={evolutionStars} 
                totalStars={totalStars} 
                aiMessage={aiMessage} 
                onSpendStar={handleSpendStar} 
                onOpenEvolutionGuide={() => setIsEvolutionGuideOpen(true)}
              />
            </Suspense>
            <Suspense fallback={<div className="h-32 w-full rounded-[3rem] bg-muted animate-pulse" />}>
              <HydrationTracker 
                currentGlasses={currentGlasses}
                goalGlasses={settings.dailyGoalGlasses}
                totalStars={totalStars}
                nextStageStars={nextStage?.requiredStars || (evolutionStars + 10)}
                dailyProgress={dailyProgressPercent}
                onAddGlass={handleAddGlass}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="scroll" className="space-y-6 mt-0 focus-visible:ring-0">
            <Card className="pixel-card border-none overflow-hidden bg-gradient-to-br from-reward/10 to-primary/10 border-2 border-white/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                  <Gift className="h-5 w-5 text-reward" />
                  Daily Sanctuary Blessing
                </CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Visit your world to claim</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 py-2">
                  <div className={`p-4 rounded-[2rem] border-4 transition-all ${isRewardClaimedToday ? 'bg-reward/10 border-reward/40' : 'bg-white shadow-xl border-primary/20 animate-float-cozy'}`}>
                    <Star className={`h-10 w-10 ${isRewardClaimedToday ? 'text-reward fill-reward opacity-40' : 'text-reward fill-reward reward-glow'}`} />
                  </div>
                  
                  {isRewardClaimedToday ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Badge variant="outline" className="bg-reward/20 text-reward border-reward/30 font-black text-[9px] uppercase px-4 py-1 rounded-full">
                        <CheckCircle2 className="h-3 w-3 mr-2" />
                        Today's Reward Secured
                      </Badge>
                      <p className="text-xs font-bold text-muted-foreground italic leading-relaxed">
                        "Your presence brings warmth to this world. Come back tomorrow for another star."
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4 w-full">
                      <p className="text-xs font-bold text-center text-muted-foreground leading-relaxed">
                        Your world thrives on consistency. Claim your daily star to evolve your sanctuary.
                      </p>
                      <Button 
                        onClick={handleClaimDailyReward}
                        className="w-full h-12 bg-reward hover:bg-reward/90 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg border-b-4 border-reward/20 active:border-b-0 active:translate-y-1 transition-all"
                      >
                        Claim 1 Star
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="pixel-card border-none overflow-hidden bg-white/60 relative">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                    <Star className="h-5 w-5 text-reward fill-reward" />
                    Evolution Badges
                  </CardTitle>
                  <Badge variant="outline" className="bg-reward/10 text-reward border-reward/20 font-black text-[8px] uppercase px-3 py-1 rounded-full animate-pulse">
                    Coming Soon
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-[2px] rounded-[2rem] border-2 border-dashed border-reward/20">
                  <div className="p-3 bg-white/80 rounded-full shadow-lg mb-2">
                    <Construction className="h-6 w-6 text-reward" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-reward text-center">New Achievements Brewing</p>
                  <p className="text-[8px] font-bold text-muted-foreground/60 uppercase mt-1">Under Construction</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 opacity-40 grayscale-[0.4]">
                  {achievements.map(a => (
                    <div key={a.id} className={`p-5 rounded-[2rem] flex flex-col items-center text-center border-4 transition-all ${a.unlockedAt ? 'border-reward/40 bg-reward/5 shadow-inner' : 'border-dashed border-muted opacity-40'}`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${a.unlockedAt ? 'bg-white shadow-xl reward-glow' : 'bg-muted'}`}>
                        <Award className={`h-7 w-7 ${a.unlockedAt ? 'text-reward' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="text-[10px] font-black uppercase leading-tight">{a.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="pixel-card border-none overflow-hidden bg-white/60">
              <CardHeader className="pb-2"><CardTitle className="text-xl font-headline font-bold flex items-center gap-3">Nourishment History</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px] pr-2">
                  <div className="space-y-3">
                    {todayLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                         <Home className="h-10 w-10 mb-4" />
                         <p className="text-xs font-bold uppercase tracking-widest">No nourishment yet today</p>
                      </div>
                    ) : (
                      todayLogs.map(log => (
                        <div key={log.id} className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border-2 border-primary/10">
                          <div className="flex items-center gap-4"><div className="p-2.5 bg-primary/10 rounded-xl"><Droplets className="h-5 w-5 text-primary" /></div><span className="font-bold text-lg">{log.glassesCount} Glass</span></div>
                          <span className="text-[10px] font-black text-muted-foreground/60 uppercase text-right">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="self" className="space-y-6 mt-0 focus-visible:ring-0 pb-12">
            {user?.isAnonymous && (
              <Card className="pixel-card border-none overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-white">
                <CardHeader className="pb-2"><CardTitle className="text-xl font-headline font-bold flex items-center gap-3"><Cloud className="h-5 w-5 text-primary" />Secure Progress</CardTitle></CardHeader>
                <CardContent><Button onClick={handleLinkAccount} className="w-full h-12 bg-white text-primary hover:bg-white/90 rounded-2xl font-black text-xs uppercase shadow-lg border-b-4 border-primary/10"><LogIn className="h-4 w-4 mr-2" />Backup to Cloud</Button></CardContent>
              </Card>
            )}
            <Card className="pixel-card border-none overflow-hidden bg-white/60">
              <CardHeader><CardTitle className="text-xl font-headline font-bold">Guardian Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-white/80 rounded-3xl border-2 border-primary/5">
                  <p className="text-xs font-black uppercase tracking-widest">Name</p>
                  <input className="w-32 bg-transparent border-none text-right font-black text-primary focus:ring-0 text-lg" value={settings.name} onChange={(e) => setSettings({...settings, name: e.target.value})} />
                </div>
                <div className="flex items-center justify-between p-5 bg-white/80 rounded-3xl border-2 border-primary/5">
                  <p className="text-xs font-black uppercase tracking-widest">Daily Goal</p>
                  <div className="flex items-center gap-2">
                    <input type="number" className="w-12 bg-transparent border-none text-right font-black text-primary focus:ring-0 text-lg" value={settings.dailyGoalGlasses} onChange={(e) => setSettings({...settings, dailyGoalGlasses: parseInt(e.target.value) || 0})} />
                    <span className="text-[10px] font-black opacity-30 uppercase">Glasses</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5 bg-white/80 rounded-3xl border-2 border-primary/5">
                  <p className="text-xs font-black uppercase tracking-widest">Atmosphere</p>
                  <Switch checked={settings.soundEnabled} onCheckedChange={handleSoundToggle} />
                </div>
              </CardContent>
            </Card>
            <div className="space-y-3">
              <Dialog onOpenChange={(open) => { if (!open) setAdminAuth(''); }}>
                <DialogTrigger asChild><Button variant="ghost" className="w-full justify-between h-12 bg-white/60 rounded-2xl px-5 text-xs font-black uppercase tracking-widest"><div className="flex items-center gap-3"><Lock className="h-4 w-4 text-reward" />Manage Stage Progression</div></Button></DialogTrigger>
                <DialogContent className="max-w-4xl h-[85vh] overflow-hidden flex flex-col p-0 border-none rounded-[3rem] bg-background/95 backdrop-blur-3xl shadow-2xl z-[150]">
                  <DialogHeader className="sr-only">
                    <DialogTitle>Stage Management</DialogTitle>
                    <DialogDescription>Access and edit world evolution stages.</DialogDescription>
                  </DialogHeader>
                  {adminAuth !== 'Admin' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                      <Input type="password" placeholder="Enter Passcode..." className="text-center h-12 rounded-xl" value={adminAuth} onChange={(e) => setAdminAuth(e.target.value)} />
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 p-8">
                      <Suspense fallback={<LoadingSpinner />}><WorldLibrary /></Suspense>
                    </ScrollArea>
                  )}
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive" className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-500/10 text-red-500 border-2 border-red-500/20"><Trash2 className="h-4 w-4 mr-2" />Reset App</Button></AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2.5rem] p-8 z-[150]">
                  <AlertDialogHeader><AlertDialogTitle className="text-2xl font-headline font-bold">Destroy All Progress?</AlertDialogTitle></AlertDialogHeader>
                  <AlertDialogFooter className="mt-6 gap-3"><AlertDialogCancel className="rounded-2xl font-black text-xs uppercase">Nevermind</AlertDialogCancel><AlertDialogAction onClick={handleResetApp} className="rounded-2xl font-black text-xs uppercase bg-red-500">Wipe Everything</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>

          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-sm z-[100] pb-safe">
            <div className="pixel-card p-2 shadow-2xl bg-white/90 backdrop-blur-xl">
              <TabsList className="w-full bg-transparent h-14 grid grid-cols-3 gap-2">
                <TabsTrigger value="home" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[1.5rem] flex flex-col h-full"><Home className="h-5 w-5" /><span className="text-[9px] font-black uppercase mt-1">World</span></TabsTrigger>
                <TabsTrigger value="scroll" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[1.5rem] flex flex-col h-full"><Scroll className="h-5 w-5" /><span className="text-[9px] font-black uppercase mt-1">History</span></TabsTrigger>
                <TabsTrigger value="self" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[1.5rem] flex flex-col h-full"><Heart className="h-5 w-5" /><span className="text-[9px] font-black uppercase mt-1">Guardian</span></TabsTrigger>
              </TabsList>
            </div>
          </div>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}
