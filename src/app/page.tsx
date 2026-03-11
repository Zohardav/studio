"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { useHydration } from '@/hooks/use-hydration';
import { useAudio, useBackgroundMusic } from '@/components/audio/AudioEngine';
import { PixelWorld } from '@/components/world/PixelWorld';
import { HydrationTracker } from '@/components/dashboard/HydrationTracker';
import { Onboarding } from '@/components/dashboard/Onboarding';
import { WorldLibrary } from '@/components/dashboard/WorldLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Sparkles, Droplets, Home, Scroll, Heart, BookOpen, Star, Loader2, ShieldCheck, Cloud, LogIn, Music, VolumeX, Volume2, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFirebase, initiateAnonymousSignIn, useCollection, useMemoFirebase, linkAccountToGoogle } from '@/firebase';
import { collection, query, orderBy, setDoc, doc } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Custom Glass of Water Icon
const GlassWaterIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15.2 22H8.8c-.41 0-.78-.26-.92-.63L5 2h14l-2.88 19.37a1 1 0 0 1-.92.63Z" />
    <path d="M6 12h12" />
  </svg>
);

export default function DrinkAndEarn() {
  const [mounted, setMounted] = useState(false);
  const { auth, firestore, user } = useFirebase();
  const { 
    settings, setSettings, 
    currentGlasses, dailyProgressPercent, 
    addGlass, onboardingComplete,
    aiMessage, achievements, todayLogs, totalStars,
    isLoading, resetApp
  } = useHydration();

  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();
  const { playWaterLog, playAchievement } = useAudio(settings.soundEnabled);
  
  // Background music engine
  useBackgroundMusic(settings.soundEnabled);

  // Fetch world stages to calculate evolution targets
  const stagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'worldStages'), orderBy('requiredStars', 'asc'));
  }, [firestore]);
  const { data: stages } = useCollection(stagesQuery);

  const nextStage = useMemo(() => {
    if (!stages) return null;
    return stages.find(s => s.requiredStars > totalStars) || null;
  }, [stages, totalStars]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (auth && !user && !isLoading) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isLoading]);

  const handleAddGlass = () => {
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

  const handleOnboarding = async (name: string, goal: number) => {
    if (!user || !firestore) return;
    
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
      id: user.uid,
      displayName: name,
      dailyGoalGlasses: goal,
      totalStars: 0,
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
          description: "Google Sign-In is not enabled in the Firebase Console. Please enable it to use this feature.",
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
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message,
      });
    }
  };

  if (isLoading || isResetting || !mounted) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
          {isResetting ? 'Wiping Sanctuary...' : 'Entering Sanctuary...'}
        </p>
      </div>
    );
  }

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboarding} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-svh bg-[#FFF9FC] dark:bg-[#120F1A] flex flex-col relative pb-32" suppressHydrationWarning>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-[-10%] left-[-20%] w-full h-[60%] bg-primary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-20%] w-full h-[60%] bg-reward/10 rounded-full blur-[120px]" 
        />
      </div>

      <header className="p-8 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-headline font-bold text-foreground leading-none">
                Hi, <span className="text-primary">{settings.name}</span>
              </h1>
              <p className="text-xs font-bold text-muted-foreground/60 tracking-widest uppercase">My Sanctuary</p>
            </div>
            <div className="flex gap-2">
              <motion.div whileTap={{ scale: 0.9 }}>
                <Badge variant="secondary" className="px-3 py-2 bg-white/80 border-2 border-primary/20 rounded-[1.2rem] shadow-sm flex gap-2 items-center">
                  <GlassWaterIcon className="w-3.5 h-3.5 text-primary" />
                  <span className="font-black text-[10px]">{currentGlasses}</span>
                </Badge>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Badge variant="secondary" className="px-3 py-2 bg-white/80 border-2 border-reward/20 rounded-[1.2rem] shadow-sm flex gap-2 items-center">
                  <Award className="w-3.5 h-3.5 text-reward" />
                  <span className="font-black text-[10px]">{totalStars}</span>
                </Badge>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="flex-1 px-8 space-y-6">
        <Tabs defaultValue="home" className="w-full">
          <TabsContent value="home" className="space-y-8 mt-0 focus-visible:ring-0">
            <PixelWorld totalStars={totalStars} aiMessage={aiMessage} />
            
            <HydrationTracker 
              currentGlasses={currentGlasses}
              goalGlasses={settings.dailyGoalGlasses}
              totalStars={totalStars}
              nextStageStars={nextStage?.requiredStars || (totalStars + 10)}
              dailyProgress={dailyProgressPercent}
              onAddGlass={handleAddGlass}
            />
          </TabsContent>

          <TabsContent value="scroll" className="space-y-6 mt-0 focus-visible:ring-0">
            <Card className="pixel-card border-none overflow-hidden bg-white/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                  <Star className="h-5 w-5 text-reward fill-reward" />
                  Evolution Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {achievements.map(a => (
                  <motion.div 
                    key={a.id} 
                    className={`p-5 rounded-[2rem] flex flex-col items-center text-center border-4 transition-all ${
                      a.unlockedAt 
                      ? 'border-reward/40 bg-reward/5 shadow-inner' 
                      : 'border-dashed border-muted opacity-40'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                      a.unlockedAt ? 'bg-white shadow-xl reward-glow' : 'bg-muted'
                    }`}>
                      <Award className={`h-7 w-7 ${a.unlockedAt ? 'text-reward' : 'text-muted-foreground'}`} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-tight leading-tight">{a.name}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card className="pixel-card border-none overflow-hidden bg-white/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-primary" />
                  Nourishment History
                </CardTitle>
              </CardHeader>
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
                        <div 
                          key={log.id} 
                          className="flex justify-between items-center p-4 bg-white/80 rounded-2xl border-2 border-primary/10"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-primary/10 rounded-xl">
                              <Droplets className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-bold text-lg">{log.glassesCount} Glass</span>
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground/60 uppercase">
                            {mounted ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
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
            {/* Account Protection Card */}
            {user?.isAnonymous && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="pixel-card border-none overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                      <Cloud className="h-5 w-5 text-primary" />
                      Secure Progress
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-foreground/60">
                      Link your Google account to ensure your sanctuary is never lost.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={handleLinkAccount}
                      className="w-full h-12 bg-white text-primary hover:bg-white/90 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg border-b-4 border-primary/10"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Backup to Cloud
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!user?.isAnonymous && (
              <Card className="pixel-card border-none overflow-hidden bg-accent/5 border-2 border-accent/20">
                <CardHeader className="flex flex-row items-center gap-4 py-4">
                  <div className="p-3 bg-accent/10 rounded-2xl">
                    <ShieldCheck className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline font-bold">Account Protected</CardTitle>
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent/60">Cloud Sync Active</p>
                  </div>
                </CardHeader>
              </Card>
            )}

            <Card className="pixel-card border-none overflow-hidden bg-white/60">
              <CardHeader>
                <CardTitle className="text-xl font-headline font-bold">Guardian Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-white/80 rounded-3xl border-2 border-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-xl">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">Name</p>
                  </div>
                  <input 
                    className="w-32 bg-transparent border-none text-right font-black text-primary focus:ring-0 text-lg"
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                  />
                </div>
                <div className="flex items-center justify-between p-5 bg-white/80 rounded-3xl border-2 border-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-xl">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">Daily Goal</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      className="w-12 bg-transparent border-none text-right font-black text-primary focus:ring-0 text-lg"
                      value={settings.dailyGoalGlasses}
                      onChange={(e) => setSettings({...settings, dailyGoalGlasses: parseInt(e.target.value) || 0})}
                    />
                    <span className="text-[10px] font-black opacity-30">GLASSES</span>
                  </div>
                </div>
                
                {/* Audio Atmosphere Toggle */}
                <div className="flex items-center justify-between p-5 bg-white/80 rounded-3xl border-2 border-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-xl">
                      {settings.soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">Atmosphere</p>
                  </div>
                  <Switch 
                    checked={settings.soundEnabled}
                    onCheckedChange={(val) => setSettings({...settings, soundEnabled: val})}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="pixel-card border-dashed border-2 border-reward/30 bg-reward/5 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-headline font-bold text-reward/80 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Evolution Codex
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between h-12 bg-white/60 hover:bg-reward/10 rounded-2xl px-5"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-reward" />
                        <span className="text-xs font-black uppercase tracking-widest">Manage Stage Progression</span>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[85vh] overflow-hidden flex flex-col p-0 border-none rounded-[3rem] bg-background/95 backdrop-blur-3xl shadow-2xl">
                    <DialogHeader className="p-8 pb-4 shrink-0">
                      <DialogTitle className="text-3xl font-headline font-bold flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-reward" />
                        Evolution Codex
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 relative">
                      <ScrollArea className="h-full px-8 pb-8">
                        <WorldLibrary />
                      </ScrollArea>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Developer Features Section */}
                <div className="pt-4 border-t-2 border-reward/20 mt-4 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-reward/60 px-2">Developer Features</p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-2 border-red-500/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset App (Destroy Progress)
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2.5rem] p-8">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-headline font-bold">Destroy All Progress?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium">
                          This action is destructive and cannot be undone. It will permanently delete your profile, hydration history, stars, and all evolution progress from the cloud. You will be returned to the onboarding screen as a brand new user.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-6 gap-3">
                        <AlertDialogCancel className="rounded-2xl font-black text-xs uppercase tracking-widest">Nevermind</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleResetApp}
                          className="rounded-2xl font-black text-xs uppercase tracking-widest bg-red-500 text-white hover:bg-red-600"
                        >
                          Wipe Everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-sm z-[100]">
            <div className="pixel-card p-3 shadow-2xl border-white/40 bg-white/90 backdrop-blur-xl">
              <TabsList className="w-full bg-transparent h-16 grid grid-cols-3 gap-2">
                <TabsTrigger value="home" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[1.5rem] flex flex-col h-full transition-all group">
                  <Home className="h-5 w-5 mb-1 group-data-[state=active]:animate-bounce" />
                  <span className="text-[9px] font-black uppercase tracking-widest">World</span>
                </TabsTrigger>
                <TabsTrigger value="scroll" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[1.5rem] flex flex-col h-full transition-all group">
                  <Scroll className="h-5 w-5 mb-1 group-data-[state=active]:animate-bounce" />
                  <span className="text-[9px] font-black uppercase tracking-widest">History</span>
                </TabsTrigger>
                <TabsTrigger value="self" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[1.5rem] flex flex-col h-full transition-all group">
                  <Heart className="h-5 w-5 mb-1 group-data-[state=active]:animate-bounce" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Guardian</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}
