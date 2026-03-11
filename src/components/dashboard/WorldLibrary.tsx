
"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { MAX_STAGES } from '@/lib/world-engine/stages';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, Image as ImageIcon, CheckCircle2, Info, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

export function WorldLibrary() {
  const firestore = useFirestore();
  const stagesQuery = useMemoFirebase(() => collection(firestore, 'worldStages'), [firestore]);
  const { data: stages, isLoading } = useCollection(stagesQuery);
  const [uploadingStage, setUploadingStage] = useState<number | null>(null);

  const handleUpdateStage = async (stageNumber: number, data: { imageUrl?: string; requiredStars?: number }) => {
    if (!firestore) return;
    const stageId = stageNumber.toString();
    const existing = stages?.find(s => s.stageNumber === stageNumber);
    
    setUploadingStage(stageNumber);
    try {
      await setDoc(doc(firestore, 'worldStages', stageId), {
        id: stageId,
        stageNumber,
        imageUrl: data.imageUrl ?? existing?.imageUrl ?? '',
        requiredStars: data.requiredStars ?? existing?.requiredStars ?? (stageNumber - 1) * 10,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Failed to update stage:', error);
    } finally {
      setUploadingStage(null);
    }
  };

  const handleFileUpload = (stageNumber: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("File too large! Please use an image under 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdateStage(stageNumber, { imageUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Syncing World Codex...</p>
      </div>
    );
  }

  const stageList = Array.from({ length: MAX_STAGES }, (_, i) => i + 1);

  return (
    <div className="space-y-6 pt-4 pb-12">
      <Alert className="bg-primary/5 border-primary/20 rounded-[2rem]">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="text-xs font-black uppercase tracking-widest text-primary">Evolution Specs</AlertTitle>
        <AlertDescription className="text-xs font-medium text-muted-foreground">
          Upload Square (1:1) images. Define the Star threshold for each level.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stageList.map((num) => {
          const stageData = stages?.find(s => s.stageNumber === num);
          const isThisUploading = uploadingStage === num;

          return (
            <motion.div 
              key={num}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col gap-4 p-5 bg-white/60 dark:bg-black/20 rounded-[2.5rem] border-4 border-white shadow-xl hover:border-primary/20 transition-all group"
            >
              <div className="relative aspect-square w-full bg-[#f8f1de] rounded-[2rem] overflow-hidden flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                {stageData?.imageUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={stageData.imageUrl}
                      alt={`Stage ${num}`}
                      fill
                      className="object-contain"
                    />
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="h-6 w-6 text-green-500 fill-white shadow-lg" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <ImageIcon className="h-10 w-10" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Empty Stage</span>
                  </div>
                )}

                {isThisUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-primary/80 backdrop-blur-md text-white font-black border-none px-3 shadow-lg">
                    STAGE {num}
                  </Badge>
                </div>

                <label className="absolute inset-0 cursor-pointer opacity-0 hover:opacity-100 transition-opacity bg-primary/20 flex items-center justify-center pointer-events-auto">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(num, e)} />
                  <div className="bg-white p-4 rounded-full shadow-2xl">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                </label>
              </div>

              <div className="space-y-3 px-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                    <Star className="h-2.5 w-2.5" /> Required Stars
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      type="number"
                      defaultValue={stageData?.requiredStars ?? (num - 1) * 10}
                      onBlur={(e) => handleUpdateStage(num, { requiredStars: parseInt(e.target.value) || 0 })}
                      className="h-10 rounded-xl bg-white border-2 border-primary/5 focus:ring-primary font-bold text-primary"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
