"use client"

import React, { useState } from 'react';
import { useHydration } from '@/hooks/use-hydration';
import { useAudio } from '@/components/audio/AudioEngine';
import { VirtualWorld } from '@/components/world/VirtualWorld';
import { HydrationTracker } from '@/components/dashboard/HydrationTracker';
import { Onboarding } from '@/components/dashboard/Onboarding';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Award, LayoutDashboard, History, Settings2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';

export default function DrinkAndEarn() {
  const { 
    settings, setSettings, 
    currentAmountMl, progressPercent, 
    addWater, onboardingComplete, setOnboardingComplete,
    aiMessage, achievements, streak, todayLogs
  } = useHydration();

  const { playWaterLog, playAchievement } = useAudio(settings.soundEnabled);
  const { toast } = useToast();

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
    <div className="max-w-md mx-auto min-h-svh bg-background flex flex-col relative pb-20">
      <header className="p-6 pb-2">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center justify-between">
          <span>Hello, {settings.name}</span>
          <div className="flex items-center gap-2">
             <Badge variant="secondary" className="bg-reward/20 text-reward-foreground border-reward/30">
               <Award className="w-3 h-3 mr-1" />
               {streak} Day Streak
             </Badge>
          </div>
        </h1>
        <p className="text-muted-foreground mt-1">Stay refreshed and grow your garden.</p>
      </header>

      <main className="flex-1 p-6 space-y-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsContent value="dashboard" className="space-y-6 mt-0">
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

          <TabsContent value="stats" className="space-y-6 mt-0">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-headline">Achievement Badges</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {achievements.map(a => (
                  <div key={a.id} className={`p-4 rounded-2xl flex flex-col items-center text-center border-2 transition-all ${a.unlockedAt ? 'border-reward bg-reward/10 shadow-lg' : 'border-dashed border-muted grayscale opacity-50'}`}>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                      <Award className={`h-6 w-6 ${a.unlockedAt ? 'text-reward' : 'text-muted'}`} />
                    </div>
                    <p className="text-xs font-bold leading-tight">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{a.description}</p>
                    {a.unlockedAt && (
                      <span className="text-[9px] font-bold text-reward-foreground mt-1 uppercase">Unlocked</span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-headline">Today's History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px] pr-4">
                  <div className="space-y-3">
                    {todayLogs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No water logged yet today.</p>
                    ) : (
                      todayLogs.slice().reverse().map(log => (
                        <div key={log.id} className="flex justify-between items-center p-3 bg-secondary/20 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                              <History className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{log.amountMl}ml</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-0">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-headline">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">World Theme</p>
                      <p className="text-xs text-muted-foreground">Change your progression visual</p>
                    </div>
                    <select 
                      className="bg-transparent border-none font-bold text-primary focus:ring-0 cursor-pointer"
                      value={settings.worldTheme}
                      onChange={(e) => setSettings({...settings, worldTheme: e.target.value as any})}
                    >
                      <option value="garden">Garden</option>
                      <option value="island">Island</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Glass Size</p>
                      <p className="text-xs text-muted-foreground">Your standard drinking glass (ml)</p>
                    </div>
                    <input 
                      type="number"
                      className="w-16 bg-transparent border-none text-right font-bold text-primary focus:ring-0"
                      value={settings.glassSizeMl}
                      onChange={(e) => setSettings({...settings, glassSizeMl: parseInt(e.target.value) || 250})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Sound Effects</p>
                      <p className="text-xs text-muted-foreground">Audio feedback for actions</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, soundEnabled: !settings.soundEnabled})}
                      className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.soundEnabled ? 'bg-accent' : 'bg-muted'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Daily Goal</p>
                      <p className="text-xs text-muted-foreground">Adjust target (ml)</p>
                    </div>
                    <input 
                      type="number"
                      className="w-20 bg-transparent border-none text-right font-bold text-primary focus:ring-0"
                      value={settings.dailyGoalMl}
                      onChange={(e) => setSettings({...settings, dailyGoalMl: parseInt(e.target.value) || 2000})}
                    />
                  </div>
                </div>

                <Separator />
                
                <div className="pt-2 text-center">
                   <p className="text-xs text-muted-foreground">App Version 1.0.0 (Guest Mode)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-border p-2 z-40 max-w-md mx-auto">
            <TabsList className="w-full bg-transparent h-16 grid grid-cols-3 gap-2">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl flex flex-col h-full">
                <LayoutDashboard className="h-5 w-5 mb-1" />
                <span className="text-[10px]">Tracker</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl flex flex-col h-full">
                <Award className="h-5 w-5 mb-1" />
                <span className="text-[10px]">Badges</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-xl flex flex-col h-full">
                <Settings2 className="h-5 w-5 mb-1" />
                <span className="text-[10px]">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </main>
      <Toaster />
    </div>
  );
}