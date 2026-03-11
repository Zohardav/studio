
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Droplets, Sparkles, Heart, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export function Onboarding({ onComplete }: { onComplete: (name: string, goal: number) => void }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(8);

  const handleDecrement = () => {
    setGoal(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setGoal(prev => Math.min(30, prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-20%] left-[-20%] w-[100%] h-[60%] bg-primary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[60%] bg-accent/10 rounded-full blur-[120px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="pixel-card border-none rounded-[3rem] overflow-hidden p-4 shadow-2xl">
          <CardHeader className="text-center space-y-4 pt-10">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="mx-auto w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center shadow-xl shadow-primary/5"
            >
              <Droplets className="h-10 w-10 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <CardTitle className="text-4xl font-headline font-bold">Your Secret World</CardTitle>
              <CardDescription className="text-base font-medium text-muted-foreground/80">
                Nourish yourself to watch your sanctuary bloom.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-primary ml-2">What is your name?</Label>
              <Input 
                id="name" 
                placeholder="E.g. Alex" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="h-16 text-xl rounded-3xl border-none bg-white/50 focus:ring-2 focus:ring-primary px-6 shadow-inner"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-primary ml-2">Daily Glasses Goal</Label>
              <div className="flex items-center justify-between bg-white/50 rounded-[2.5rem] p-2 shadow-inner h-20 border-2 border-white/20">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleDecrement}
                  className="h-14 w-14 rounded-2xl bg-white shadow-sm hover:bg-primary/5 text-primary active:scale-90 transition-all"
                >
                  <Minus className="h-6 w-6" />
                </Button>
                
                <div className="flex flex-col items-center">
                  <motion.span 
                    key={goal}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-black text-primary leading-none"
                  >
                    {goal}
                  </motion.span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Glasses</span>
                </div>

                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleIncrement}
                  className="h-14 w-14 rounded-2xl bg-white shadow-sm hover:bg-primary/5 text-primary active:scale-90 transition-all"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              <p className="text-[10px] font-bold text-center text-muted-foreground/50 italic tracking-tight">
                Recommended: 8 glasses per day for optimal health
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="flex flex-col items-center text-center p-4 bg-white/30 rounded-3xl border border-white/20">
                <Sparkles className="h-5 w-5 text-reward mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Earn Stars</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-white/30 rounded-3xl border border-white/20">
                <Heart className="h-5 w-5 text-accent mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Grow Life</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-10 pt-6 px-6">
            <Button 
              className="w-full h-16 text-xl font-bold rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95" 
              onClick={() => onComplete(name || 'Hydrator', goal)}
            >
              Enter Sanctuary
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
