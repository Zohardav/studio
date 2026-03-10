"use client"

import React, { useState, useEffect } from 'react';
import { useHydration } from '@/hooks/use-hydration';
import { useAudio } from '@/components/audio/AudioEngine';
import { VirtualWorld } from '@/components/world/VirtualWorld';
import { HydrationTracker } from '@/components/dashboard/HydrationTracker';
import { Onboarding } from '@/components/dashboard/Onboarding';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, LayoutDashboard, History, Settings2, Sparkles, TrendingUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function DrinkAndEarn() {
  const [mounted, setMounted] = useState(false);
  const { 
    settings, setSettings, 
    currentAmountMl, progressPercent, 
    addWater, onboardingComplete, setOnboardingComplete,
    aiMessage, achievements, streak, todayLogs
  } = useHydration();

  const { playWaterLog, playAchievement } = useAudio(settings.soundEnabled);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddWater = (amount: number) => {
    addWater(amount);
    playWaterLog();
    if (currentAmountMl + amount >= settings.dailyGoalMl && currentAmountMl < settings.dailyGoalMl) {
      if (settings.celebrationsEnabled) {
        toast({
          title: "Daily Goal Reached! 🎉",
          description: "You've crushed your hydration target for today!",
        });
        playAchievement();
      }
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
    <div className="max-w-md mx-auto min-h-svh bg-background flex flex-col relative pb-28">
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <header className="p-8 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-foreground">
              Hello, <span className="text-primary">{settings.name}</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Have you had enough water today?</p>
          </div>
          <Badge variant="secondary" className="px-4 py-2 bg-reward/10 text-reward-foreground border-reward/20 rounded-2xl shadow-sm flex gap-2 items-center hover:scale-105 transition-transform cursor-default">
            <Award className="w-4 h-4 text-reward" />
            <span className="font-bold">{streak} Day Streak</span>
          </Badge>
        </motion.div>
      </header>

      <main className="flex-1 px-8 space-y-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <AnimatePresence mode="wait">
            <TabsContent value="dashboard" key="dashboard" className="space-y-10 mt-0">
              <VirtualWorld progress={progressPercent} theme={settings.worldTheme} />
              <HydrationTracker 
                currentAmount={currentAmountMl}
                goalAmount={settings.dailyGoalMl}
                progress={progressPercent}
                glassSize={settings.glassSizeMl}
                onAddWater={handleAddWater}
                aiMessage={aiMessage}
              />
            </TabsContent>

            <TabsContent value="stats" key="stats" className="space-y-8 mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                <Card className="glass-morphism p-6 rounded-[2rem] border-none flex flex-col items-center justify-center text-center gap-2">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{currentAmountMl}ml</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Today</p>
                  </div>
                </Card>
                <Card className="glass-morphism p-6 rounded-[2rem] border-none flex flex-col items-center justify-center text-center gap-2">
                  <div className="p-3 bg-reward/10 rounded-2xl">
                    <Award className="h-6 w-6 text-reward" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{achievements.filter(a => a.unlockedAt).length}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Badges</p>
                  </div>
                </Card>
              </motion.div>

              <Card className="glass-morphism border-none rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-headline font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-reward" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {achievements.map(a => (
                    <div 
                      key={a.id} 
                      className={`p-4 rounded-[1.5rem] flex flex-col items-center text-center border-2 transition-all group ${
                        a.unlockedAt 
                        ? 'border-reward/30 bg-reward/5 shadow-inner' 
                        : 'border-dashed border-muted grayscale opacity-60'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                        a.unlockedAt ? 'bg-white shadow-md' : 'bg-muted'
                      }`}>
                        <Award className={`h-6 w-6 ${a.unlockedAt ? 'text-reward' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="text-xs font-bold leading-tight">{a.name}</p>
                      <p className="text-[9px] text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-morphism border-none rounded-[2.5rem] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-headline font-bold flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px] pr-4">
                    <div className="space-y-3">
                      {todayLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                           <Droplets className="h-10 w-10 mb-2" />
                           <p className="text-sm font-medium">No logs for today yet.</p>
                        </div>
                      ) : (
                        todayLogs.slice().reverse().map(log => (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={log.id} 
                            className="flex justify-between items-center p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-white/20"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2.5 bg-primary/10 rounded-xl">
                                <Droplets className="h-5 w-5 text-primary" />
                              </div>
                              <span className="font-bold text-lg">{log.amountMl}ml</span>
                            </div>
                            <span className="text-xs font-bold text-muted-foreground/60">
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

            <TabsContent value="settings" key="settings" className="space-y-6 mt-0">
              <Card className="glass-morphism border-none rounded-[2.5rem] overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl font-headline font-bold">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Display Name', value: settings.name, icon: Award, type: 'text', key: 'name' },
                    { label: 'Daily Goal', value: settings.dailyGoalMl, icon: TrendingUp, type: 'number', key: 'dailyGoalMl', suffix: 'ml' },
                    { label: 'Standard Glass', value: settings.glassSizeMl, icon: Droplets, type: 'number', key: 'glassSizeMl', suffix: 'ml' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-5 bg-white/40 dark:bg-black/20 rounded-3xl border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-xl">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-bold">{item.label}</p>
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
                        {item.suffix && <span className="text-[10px] font-bold text-muted-foreground">{item.suffix}</span>}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-5 bg-white/40 dark:bg-black/20 rounded-3xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-xl">
                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-bold">World Theme</p>
                    </div>
                    <select 
                      className="bg-transparent border-none font-black text-primary focus:ring-0 cursor-pointer text-right appearance-none px-4"
                      value={settings.worldTheme}
                      onChange={(e) => setSettings({...settings, worldTheme: e.target.value as any})}
                    >
                      <option value="garden">Enchanted Garden</option>
                      <option value="island">Hidden Island</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-white/40 dark:bg-black/20 rounded-3xl border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-xl">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-bold">Sound Effects</p>
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
              
              <div className="text-center opacity-40 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Drink & Earn • v1.2 Premium</p>
              </div>
            </TabsContent>
          </AnimatePresence>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-sm z-50">
            <div className="glass-morphism rounded-[2.5rem] p-2 shadow-2xl border-white/30">
              <TabsList className="w-full bg-transparent h-16 grid grid-cols-3 gap-1">
                <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[2rem] flex flex-col h-full transition-all duration-300">
                  <LayoutDashboard className="h-5 w-5 mb-0.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">World</span>
                </TabsTrigger>
                <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[2rem] flex flex-col h-full transition-all duration-300">
                  <Award className="h-5 w-5 mb-0.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Earned</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-[2rem] flex flex-col h-full transition-all duration-300">
                  <Settings2 className="h-5 w-5 mb-0.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Self</span>
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
