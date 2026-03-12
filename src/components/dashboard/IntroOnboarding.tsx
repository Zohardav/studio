
"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Sparkles, Rocket, ArrowRight, ArrowLeft, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { translations, Language } from '@/lib/translations';

interface IntroOnboardingProps {
  onComplete: () => void;
}

export function IntroOnboarding({ onComplete }: IntroOnboardingProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [lang, setLang] = useState<Language>('en');

  const t = translations[lang];
  const isRtl = lang === 'he';

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const slides = [
    {
      title: t.welcome,
      text: t.welcomeDesc,
      icon: <Droplets className="w-16 h-16 text-primary" />,
      color: "from-blue-50 to-primary/10",
    },
    {
      title: t.howItWorks,
      text: t.howItWorksDesc,
      icon: <Sparkles className="w-16 h-16 text-reward" />,
      color: "from-amber-50 to-reward/10",
    },
    {
      title: t.ready,
      text: t.readyDesc,
      icon: <Rocket className="w-16 h-16 text-accent" />,
      color: "from-emerald-50 to-accent/10",
    },
  ];

  const handleComplete = () => {
    onComplete();
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    if (api && current < slides.length - 1) {
      api.scrollNext();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center overflow-y-auto cursor-pointer ${isRtl ? 'font-sans' : 'font-body'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      onClick={handleContainerClick}
    >
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

      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex bg-white/40 backdrop-blur-md p-1 rounded-2xl border-2 border-white/50 z-[210] pointer-events-auto">
        <button 
          onClick={(e) => { e.stopPropagation(); setLang('en'); }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${lang === 'en' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground opacity-50'}`}
        >
          ENGLISH
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setLang('he'); }}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${lang === 'he' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground opacity-50'}`}
        >
          עברית
        </button>
      </div>

      <div className="w-full max-w-md min-h-full flex flex-col px-8 pointer-events-none py-12 pt-32">
        <Carousel 
          setApi={setApi} 
          className="flex-1 w-full pointer-events-auto"
          opts={{
            dragFree: false,
            containScroll: "trimSnaps",
            direction: isRtl ? 'rtl' : 'ltr'
          }}
        >
          <CarouselContent className="h-full">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="h-full flex flex-col items-center justify-center text-center space-y-8 select-none">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplete();
                      }}
                      className="w-full h-16 text-xl font-bold rounded-[2rem] shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 group transition-all"
                    >
                      {t.startBtn}
                      {isRtl ? (
                        <ArrowLeft className="mr-2 w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                      ) : (
                        <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  </motion.div>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Footer Navigation */}
        <div className="py-12 flex items-center justify-center">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 transition-all rounded-full ${i === current ? 'w-8 bg-primary' : 'w-2 bg-primary/20'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
