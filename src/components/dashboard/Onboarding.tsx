"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Droplets, Sparkles, Minus, Plus, Star, Leaf, Wand2, ChevronRight, ChevronLeft, LogIn, Loader2, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirebase, signInWithGoogle } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { translations, Language } from '@/lib/translations';

export function Onboarding({ onComplete }: { onComplete: (name: string, goal: number, lang: Language) => void }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(8);
  const [lang, setLang] = useState<Language>('en');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { auth } = useFirebase();
  const { toast } = useToast();

  const t = translations[lang];
  const isRtl = lang === 'he';

  const handleDecrement = () => {
    setGoal(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setGoal(prev => Math.min(30, prev + 1));
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle(auth);
      toast({
        title: isRtl ? "ברוכים השבים! ✨" : "Welcome Back! ✨",
        description: isRtl ? "משחזרים את הסנקטוארי שלך..." : "Restoring your sanctuary...",
      });
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Sign-in Failed",
          description: error.message,
        });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-[#F4F7F8] overflow-y-auto pb-safe ${isRtl ? 'font-hebrew' : 'font-body'}`} dir={isRtl ? 'rtl' : 'ltr'}>
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
      </div>

      <div className="min-h-full flex items-center justify-center p-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 120 }}
          className="w-full max-w-md relative"
        >
          <div className="absolute top-[-2rem] left-1/2 -translate-x-1/2 flex bg-white/60 backdrop-blur-md p-1 rounded-2xl border-2 border-white/50 z-[60]">
            <button 
              onClick={() => setLang('en')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${lang === 'en' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground opacity-50'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('he')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${lang === 'he' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground opacity-50'}`}
            >
              HE
            </button>
          </div>

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
              </motion.div>
              
              <div className="space-y-2">
                <CardTitle className={`text-4xl font-black text-foreground tracking-tight ${isRtl ? 'font-hebrew' : 'font-headline'}`}>
                  {t.sanctuary.split(' ')[0]} <span className="text-primary">{t.sanctuary.split(' ').slice(1).join(' ')}</span>
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed px-4">
                  {t.sanctuaryDesc}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 px-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">{t.nameLabel}</Label>
                <div className="relative group">
                  <Input 
                    placeholder={t.namePlaceholder} 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="h-16 text-xl rounded-3xl border-2 border-white bg-white/50 focus:ring-4 focus:ring-primary/10 focus:border-primary/20 px-6 shadow-inner transition-all"
                  />
                  <div className={`absolute ${isRtl ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary/40 transition-colors`}>
                    <Wand2 className="w-5 h-5" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end px-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{t.goalLabel}</Label>
                  <span className="text-[9px] font-black text-accent uppercase tracking-wider">{t.recommended}</span>
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
                        className={`text-4xl font-black text-primary leading-none ${isRtl ? 'font-hebrew' : 'font-headline'}`}
                      >
                        {goal}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/30 mt-1">{t.glasses}</span>
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
            </CardContent>

            <CardFooter className="pb-6 pt-8 px-8 flex flex-col gap-4">
              <motion.div className="w-full relative" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="w-full h-18 text-xl font-black rounded-[2rem] shadow-2xl shadow-primary/30 transition-all bg-primary hover:bg-primary/90 text-white border-b-8 border-primary/20 relative group overflow-hidden" 
                  onClick={() => onComplete(name || (isRtl ? 'שומר/ת' : 'Guardian'), goal, lang)}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {t.enterSanctuary}
                    {isRtl ? (
                      <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    )}
                  </span>
                </Button>
              </motion.div>

              <div className="flex items-center gap-4 w-full">
                <div className="h-px bg-muted-foreground/10 flex-1" />
                <span className="text-[8px] font-black uppercase text-muted-foreground/30">{isRtl ? 'או' : 'Or'}</span>
                <div className="h-px bg-muted-foreground/10 flex-1" />
              </div>

              <Button 
                variant="ghost"
                disabled={isSigningIn}
                onClick={handleGoogleSignIn}
                className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/5 border-2 border-dashed border-primary/20"
              >
                {isSigningIn ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <LogIn className="h-4 w-4 mr-2" />
                )}
                {t.alreadyGuardian}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
