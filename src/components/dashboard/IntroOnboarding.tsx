
"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Sparkles, Rocket, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface IntroOnboardingProps {
  onComplete: () => void;
}

export function IntroOnboarding({ onComplete }: IntroOnboardingProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const slides = [
    {
      title: "Welcome to Drink & Grow",
      text: "Drink water and bring your world to life, one step at a time.",
      icon: <Droplets className="w-16 h-16 text-primary" />,
      color: "from-blue-50 to-primary/10",
    },
    {
      title: "How it works",
      text: "Every time you log your water, your world grows, evolves, and becomes more alive.",
      icon: <Sparkles className="w-16 h-16 text-reward" />,
      color: "from-amber-50 to-reward/10",
    },
    {
      title: "Ready to begin?",
      text: "Start your journey now and see how far your water habits can take you.",
      icon: <Rocket className="w-16 h-16 text-accent" />,
      color: "from-emerald-50 to-accent/10",
    },
  ];

  const handleComplete = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Background Atmosphere */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 bg-gradient-to-b ${slides[current].color} -z-10`}
        />
      </AnimatePresence>

      <div className="absolute top-10 right-8 z-[210]">
        <Button 
          variant="ghost" 
          onClick={handleComplete}
          className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-transparent hover:text-primary"
        >
          Skip
        </Button>
      </div>

      <div className="w-full max-w-md h-full flex flex-col px-8">
        <Carousel setApi={setApi} className="flex-1 w-full">
          <CarouselContent className="h-full">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="h-full flex flex-col items-center justify-center text-center space-y-8">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="p-8 rounded-[3rem] bg-white/60 backdrop-blur-xl shadow-2xl shadow-primary/5 border-4 border-white"
                >
                  {slide.icon}
                </motion.div>
                
                <div className="space-y-4 px-4">
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-headline font-bold text-foreground"
                  >
                    {slide.title}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-medium text-muted-foreground leading-relaxed"
                  >
                    {slide.text}
                  </motion.p>
                </div>

                {index === slides.length - 1 && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring" }}
                    className="pt-8 w-full px-4"
                  >
                    <Button 
                      onClick={handleComplete}
                      className="w-full h-16 text-xl font-bold rounded-[2rem] shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 group transition-all"
                    >
                      I'm Ready to Start
                      <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Footer Navigation */}
        <div className="py-12 flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 transition-all rounded-full ${i === current ? 'w-8 bg-primary' : 'w-2 bg-primary/20'}`} 
              />
            ))}
          </div>

          {current < slides.length - 1 && (
            <Button 
              variant="outline"
              size="icon"
              onClick={() => api?.scrollNext()}
              className="rounded-full w-12 h-12 border-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
