"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Droplets, Sparkles, TrendingUp } from 'lucide-react';

export function Onboarding({ onComplete }: { onComplete: (name: string, goal: number) => void }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(2000);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-none shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Droplets className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold">Welcome to Drink & Earn</CardTitle>
          <CardDescription className="text-lg">
            Hydrate your body, grow your world, and earn achievements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">What should we call you?</Label>
            <Input 
              id="name" 
              placeholder="Your name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goal">Daily Hydration Goal (ml)</Label>
            <Input 
              id="goal" 
              type="number" 
              value={goal} 
              onChange={(e) => setGoal(parseInt(e.target.value))}
              className="h-12 text-lg"
            />
            <p className="text-xs text-muted-foreground">The typical recommendation is around 2000ml to 3000ml.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex flex-col items-center text-center p-3 bg-secondary/30 rounded-xl">
              <Sparkles className="h-5 w-5 text-accent mb-1" />
              <span className="text-xs font-medium">Earn Badges</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-secondary/30 rounded-xl">
              <TrendingUp className="h-5 w-5 text-accent mb-1" />
              <span className="text-xs font-medium">Track Trends</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full h-12 text-lg rounded-xl" 
            onClick={() => onComplete(name || 'Hydrator', goal)}
          >
            Start Hydrating
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}