"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Droplets, Sparkles, Heart, Minus, Plus, Star, Leaf, Wand2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="fixed inset-0 z-50 bg-[#F4F7F8] overflow-y-auto pb-safe">
      {/* Immersive Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1], 
            rotate: [0, 45, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1], 
            rotate: [0, -45, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[80%] h-[80%] bg-accent/20 rounded-full blur-[120px]" 
        />
        
        {/* Subtle Floating Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.6, 0], 
              scale: [0, 1, 0],
              y: [0, -100, 0],
              x: [0, (i % 2 === 0 ? 50 : -50), 0]
            }}
            transition={{ 
              duration: 5 + i, 
              repeat: Infinity, 
              delay: i * 2,
              ease: "easeInOut"
            }}
            className="absolute text-reward/40"
            style={{ 
              top: `${20 + i * 15}%`, 
              left: `${10 + i * 15}%` 
            }}
          >
            <Sparkles className="w-4 h-4" />
          </motion.div>
        ))}
      </div>

      <div className="min-h-full flex items-center justify-center p-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="w-full max-w-md relative"
        >
          <Card className="pixel-card border-none rounded-[3.5rem] overflow-hidden p-2 shadow-2xl bg-white/70 backdrop-blur-3xl border-4 border-white/50">
            <CardHeader className="text-center space-y-4 pt-10 pb-6">
              <motion.div 
                initial={{ scale: 0.8, rotate: -15 }}
                animate={{ 
                  scale: 1, 
                  rotate: 0,
                  y: [0, -10, 0] 
                }}
                transition={{ 
                  type: "spring", 
                  damping: 12,
                  y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                }}
                className="mx-auto w-24 h-24 bg-gradient-to-br from-primary to-accent/60 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/20 relative"
              >
                <Droplets className="h-12 w-12 text-white drop-shadow-md" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-2 bg-primary/10 rounded-[3rem] -z-10 blur-xl"
                />
              </motion.div>
              
              <div className="space-y-2">
                <CardTitle className="text-4xl font-headline font-black text-foreground tracking-tight">
                  Your Personal <span className="text-primary">Sanctuary</span>
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed px-4">
                  The more you nourish yourself with water, the more your secret world will bloom and thrive.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8">
              {/* Name Input Section */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">What shall we call you?</Label>
                <div className="relative group">
                  <Input 
                    id="name" 
                    placeholder="E.g. Alex the Guardian" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="h-16 text-xl rounded-3xl border-2 border-white bg-white/50 focus:ring-4 focus:ring-primary/10 focus:border-primary/20 px-6 shadow-inner transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary/40 transition-colors">
                    < Wand2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              {/* Daily Goal Stepper Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-end px-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Daily Nourishment Goal</Label>
                  <span className="text-[9px] font-black text-accent uppercase tracking-wider">Recommended: 8</span>
                </div>
                
                <div className="flex items-center justify-between bg-white/40 rounded-[2.5rem] p-2 shadow-inner h-24 border-2 border-white">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleDecrement}
                    className="h-16 w-16 rounded-[1.8rem] bg-white shadow-md hover:bg-primary/5 text-primary active:scale-90 transition-all border border-primary/5"
                  >
                    <Minus className="h-6 w-6 stroke-[3]" />
                  </Button>
                  
                  <div className="flex flex-col items-center flex-1">
                    <AnimatePresence mode="wait">
                      <motion.span 
                        key={goal}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        className="text-4xl font-headline font-black text-primary leading-none"
                      >
                        {goal}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/30 mt-1">Glasses</span>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleIncrement}
                    className="h-16 w-16 rounded-[1.8rem] bg-white shadow-md hover:bg-primary/5 text-primary active:scale-90 transition-all border border-primary/5"
                  >
                    <Plus className="h-6 w-6 stroke-[3]" />
                  </Button>
                </div>
              </div>

              {/* Benefit Highlights */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center text-center p-4 bg-white/30 rounded-[2rem] border-2 border-white/40 shadow-sm"
                >
                  <div className="w-10 h-10 bg-reward/10 rounded-full flex items-center justify-center mb-2">
                    <Star className="h-5 w-5 text-reward fill-reward" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight text-foreground/80 leading-tight">Gather<br/>Stars</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col items-center text-center p-4 bg-white/30 rounded-[2rem] border-2 border-white/40 shadow-sm"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-2">
                    <Leaf className="h-5 w-5 text-accent" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tight text-foreground/80 leading-tight">Grow Your<br/>World</span>
                </motion.div>
              </div>
            </CardContent>

            <CardFooter className="pb-10 pt-8 px-8">
              <motion.div className="w-full relative" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="w-full h-18 text-xl font-black rounded-[2rem] shadow-2xl shadow-primary/30 transition-all bg-primary hover:bg-primary/90 text-white border-b-8 border-primary/20 relative group overflow-hidden" 
                  onClick={() => onComplete(name || 'Guardian', goal)}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Enter Sanctuary
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                </Button>
                <div className="absolute -inset-1 bg-primary/20 blur-xl -z-10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </CardFooter>
          </Card>
          
          <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 animate-pulse">
            Your journey begins now
          </p>
        </motion.div>
      </div>
    </div>
  );
}
