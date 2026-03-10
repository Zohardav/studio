"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Plus, MessageSquareHeart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface HydrationTrackerProps {
  currentAmount: number;
  goalAmount: number;
  progress: number;
  glassSize: number;
  onAddWater: (amount: number) => void;
  aiMessage?: string;
}

export function HydrationTracker({
  currentAmount,
  goalAmount,
  progress,
  glassSize,
  onAddWater,
  aiMessage
}: HydrationTrackerProps) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-end">
            <div>
              <CardTitle className="text-4xl font-headline font-bold text-primary">
                {currentAmount}<span className="text-xl font-normal text-muted-foreground ml-1">/ {goalAmount} ml</span>
              </CardTitle>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-accent">{Math.round(progress)}% of daily goal</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative h-4 mt-2">
            <Progress value={progress} className="h-4 bg-secondary" />
          </div>
          
          <div className="flex gap-4 mt-8">
            <Button 
              size="lg" 
              className="flex-1 h-16 text-lg rounded-2xl bg-primary hover:bg-primary/90 transition-all active:scale-95"
              onClick={() => onAddWater(glassSize)}
            >
              <Droplets className="mr-2 h-6 w-6" />
              Log {glassSize}ml
            </Button>
            <Button 
              size="icon" 
              variant="outline"
              className="h-16 w-16 rounded-2xl border-2 border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => {
                const custom = prompt("Enter amount in ml", glassSize.toString());
                if (custom) onAddWater(parseInt(custom));
              }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {aiMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/40 border border-secondary p-4 rounded-2xl flex gap-3 items-start shadow-sm"
        >
          <div className="bg-primary/10 p-2 rounded-full">
            <MessageSquareHeart className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">Hydro Helper</p>
            <p className="text-sm text-foreground/80 leading-relaxed italic">"{aiMessage}"</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}