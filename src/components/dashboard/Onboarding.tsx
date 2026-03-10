"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Droplets, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export function Onboarding({ onComplete }: { onComplete: (name: string, goal: number) => void }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(2000);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-8 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-20%] left-[-20%] w-[100%] h-[60%] bg-primary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[60%] bg-accent/10 rounded-full blur-[120px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-morphism border-none rounded-[3rem] overflow-hidden p-4">
          <CardHeader className="text-center space-y-4 pt-10">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="mx-auto w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/5"
            >
              <Droplets className="h-10 w-10 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-headline font-bold">Start Your Sanctuary</CardTitle>
              <CardDescription className="text-base font-medium text-muted-foreground/80">
                A simple habit that nourishes both your body and your virtual world.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-primary ml-2">How should we greet you?</Label>
              <Input 
                id="name" 
                placeholder="E.g. Alex" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="h-16 text-xl rounded-3xl border-none bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-primary px-6"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="goal" className="text-xs font-bold uppercase tracking-widest text-primary ml-2">Your Daily Ritual (ml)</Label>
              <div className="relative">
                <Input 
                  id="goal" 
                  type="number" 
                  value={goal} 
                  onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
                  className="h-16 text-2xl font-bold rounded-3xl border-none bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-primary px-6 pr-16"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-muted-foreground/40">ml</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold text-center px-4">Recommendation: 2000ml to 3000ml for optimal health.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4">
              {[
                { icon: Sparkles, label: 'Earn Badges' },
                { icon: TrendingUp, label: 'Track Health' },
                { icon: Heart, label: 'Feel Better' }
              ].map((benefit, i) => (
                <div key={i} className="flex flex-col items-center text-center p-4 bg-white/30 dark:bg-black/10 rounded-3xl border border-white/20">
                  <benefit.icon className="h-5 w-5 text-accent mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter leading-tight">{benefit.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pb-10 pt-6 px-6">
            <Button 
              className="w-full h-16 text-xl font-bold rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95" 
              onClick={() => onComplete(name || 'Hydrator', goal)}
            >
              Begin Journey
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
