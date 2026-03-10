"use client"

import React, { useState, useEffect } from 'react';
import { useHydration } from '@/hooks/use-hydration';
import { useAudio } from '@/components/audio/AudioEngine';
import { PixelWorld } from '@/components/world/PixelWorld';
import { HydrationTracker } from '@/components/dashboard/HydrationTracker';
import { Onboarding } from '@/components/dashboard/Onboarding';
import { WorldLibrary } from '@/components/dashboard/WorldLibrary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Sparkles, Droplets, Home, Scroll, Heart, Trash2, FastForward, PlusCircle, BookOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function DrinkAndEarn() {
  const [mounted, setMounted] = useState(false);
  const { 
    settings, setSettings, 
    currentAmountMl, progressPercent, 
    addWater, onboardingComplete, setOnboardingComplete,
    aiMessage, achievements, streak, todayLogs, totalLifetimeMl,
    debugReset, debugNextDay, debugAddStreak
  } = useHydration();

  const { playWaterLog, playAchievement, playUnlock } = useAudio(settings.soundEnabled);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddWater = (amount: number) => {
    addWater(amount);
    playWaterLog();
    
    // Check for growth milestones (every 100ml)
    if (Math.floor((totalLifetimeMl + amount) / 100) > Math.floor(totalLifetimeMl / 100)) {
      playUnlock();
    }

    if (currentAmountMl + amount >= settings.dailyGoalMl && currentAmountMl < settings.dailyGoalMl) {
      toast({
        title: "Daily Goal Fulfilled! ✨",
        description: "Your world glows with gratitude!",
      });
      playAchievement();
    }
  };

  const handleOnboarding = (name: string, goal: number) => {
    setSettings(prev => ({ ...prev, name, dailyGoalMl: goal }));
    setOnboardingComplete(true);
  };

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboarding} />;
  }

  return (
    <div className="max-w-md mx-auto min-h-svh bg-[#FFF9FC] dark:bg-[#120F1A] flex flex-col relative pb-32" suppressHydrationWarning>
      {/* Magical background elements */}
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
          className="flex items-center justify-between"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-foreground leading-none">
              Hi, <span className="text-primary">{settings.name}</span>
            </h1>
            <p className="text-xs font-bold text-muted-foreground/60 tracking-widest uppercase">My Secret Sanctuary</p>
          </div>
          <motion.div whileTap={{ scale: 0.9 }}>
            <Badge variant="secondary" className="px-4 py-3 bg-white/80 border-2 border-reward/20 rounded-[1.5rem] shadow-sm flex gap-2 items-center hover:bg-reward/5 transition-all">
              <Award className="w-4 h-4 text-reward" />
              <span className="font-black text-xs">{streak} DAY STREAK</span>
            </Badge>
          </motion.div>
        </motion.div>
      </header>

      <main className="flex-1 px-8 space-y-6">
        <Tabs defaultValue="home" className="w-full">
          <AnimatePresence mode="wait">
            <TabsContent value="home" key="home" className="space-y-8 mt-0 focus-visible:ring-0">
              <PixelWorld totalLifetimeMl={totalLifetimeMl} theme={settings.worldTheme} />
              
              <HydrationTracker 
                currentAmount={currentAmountMl}
                goalAmount={settings.dailyGoalMl}
                progress={progressPercent}
                glassSize={settings.glassSizeMl}
                onAddWater={handleAddWater}
                aiMessage={aiMessage}
              />
            </TabsContent>

            <TabsContent value="scroll" key="scroll" className="space-y-6 mt-0 focus-visible:ring-0">
              <Card className="pixel-card border-none overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-reward" />
                    World Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {achievements.map(a => (
                    <motion.div 
                      key={a.id} 
                      whileHover={{ scale: 1.05 }}
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

              <Card className="pixel-card border-none overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-headline font-bold flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-primary" />
                    Gifts to the Soil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[280px] pr-2">
                    <div className="space-y-3">
                      {todayLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                           <Home className="h-10 w-10 mb-4" />
                           <p className="text-xs font-bold uppercase tracking-widest">No water yet today</p>
                        </div>
                      ) : (
                        todayLogs.slice().reverse().map(log => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={log.id} 
                            className="flex justify-between items-center p-4 bg-white/50 rounded-2xl border-2 border-primary/10"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-primary/10 rounded-xl">
                                <Droplets className="h-5 w-5 text-primary" />
                              </div>
                              <span className="font-bold text-lg">{log.amountMl}ml</span>
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase">
                              {mounted ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            </span>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="self" key="self" className="space-y-6 mt-0 focus-visible:ring-0 pb-12">
              <Card className="pixel-card border-none overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-headline font-bold">Guardian Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Guardian Name', value: settings.name, icon: Heart, type: 'text', key: 'name' },
                    { label: 'Water Ritual', value: settings.dailyGoalMl, icon: Sparkles, type: 'number', key: 'dailyGoalMl', suffix: 'ml' },
                    { label: 'Standard Vessel', value: settings.glassSizeMl, icon: Droplets, type: 'number', key: 'glassSizeMl', suffix: 'ml' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-5 bg-white/60 rounded-3xl border-2 border-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-xl">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest">{item.label}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <input 
                          type={item.type}
                          className="w-20 bg-transparent border-none text-right font-black text-primary focus:ring-0 text-lg"
                          value={item.value}
                          onChange={(e) => setSettings({
                            ...settings, 
                            [item.key]: item.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value
                          })}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-5 bg-white/60 rounded-3xl border-2 border-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-xl">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-widest">Enchantment Sounds</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, soundEnabled: !settings.soundEnabled})}
                      className={`w-14 h-8 rounded-full p-1 transition-all flex items-center ${settings.soundEnabled ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <motion.div 
                        animate={{ x: settings.soundEnabled ? 24 : 0 }}
                        className="w-6 h-6 rounded-full bg-white shadow-md" 
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Developer Rituals Section */}
              <Card className="pixel-card border-dashed border-2 border-reward/30 bg-reward/5 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-headline font-bold text-reward/80 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Developer Rituals
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-between h-12 bg-white/40 hover:bg-reward/10 rounded-2xl px-5"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-reward" />
                          <span className="text-xs font-black uppercase tracking-widest">View World Evolution Library</span>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[85vh] overflow-hidden flex flex-col p-0 border-none rounded-[3rem] bg-background/95 backdrop-blur-3xl shadow-2xl">
                      <DialogHeader className="p-8 pb-4 shrink-0">
                        <DialogTitle className="text-3xl font-headline font-bold flex items-center gap-3">
                          <Sparkles className="h-6 w-6 text-reward" />
                          Evolution Codex (64 Stages)
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 min-h-0 relative">
                        <ScrollArea className="h-full px-8 pb-8">
                          <WorldLibrary />
                        </ScrollArea>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="ghost" 
                    onClick={debugNextDay}
                    className="w-full justify-between h-12 bg-white/40 hover:bg-reward/10 rounded-2xl px-5"
                  >
                    <div className="flex items-center gap-3">
                      <FastForward className="h-4 w-4 text-reward" />
                      <span className="text-xs font-black uppercase tracking-widest">Fast Forward 24h</span>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={debugAddStreak}
                    className="w-full justify-between h-12 bg-white/40 hover:bg-reward/10 rounded-2xl px-5"
                  >
                    <div className="flex items-center gap-3">
                      <PlusCircle className="h-4 w-4 text-reward" />
                      <span className="text-xs font-black uppercase tracking-widest">Manual Streak Boost</span>
                    </div>
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={debugReset}
                    className="w-full justify-between h-12 bg-destructive/5 hover:bg-destructive/10 rounded-2xl px-5 text-destructive"
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 className="h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Reset Journey</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              <div className="text-center opacity-30 py-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nourish & Grow • v2.0</p>
              </div>
            </TabsContent>
          </AnimatePresence>

          {/* Magical Navigation */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-sm z-[100]">
            <div className="pixel-card p-3 shadow-2xl border-white/40">
              <TabsList className="w-full bg-transparent h-16 grid grid-cols-3 gap-2">
                <TabsTrigger value="home" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[1.5rem] flex flex-col h-full transition-all duration-300 group">
                  <Home className="h-5 w-5 mb-1 group-data-[state=active]:animate-bounce" />
                  <span className="text-[9px] font-black uppercase tracking-widest">World</span>
                </TabsTrigger>
                <TabsTrigger value="scroll" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[1.5rem] flex flex-col h-full transition-all duration-300 group">
                  <Scroll className="h-5 w-5 mb-1 group-data-[state=active]:animate-bounce" />
                  <span className="text-[9px] font-black uppercase tracking-widest">History</span>
                </TabsTrigger>
                <TabsTrigger value="self" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[1.5rem] flex flex-col h-full transition-all duration-300 group">
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
