import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const loadingTexts = [
  "Loading Expenses...",
  "Summing Profit...",
  "Maintaining records...",
  "Fetching Clients...",
  "Polishing the UI..."
];

export const PageLoader = () => {
  const [textIndex, setTextIndex] = useState(Math.floor(Math.random() * loadingTexts.length ));
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const delayTimer = setTimeout(() => setShowLoader(true), 3000);
    return () => clearTimeout(delayTimer);
  }, []);

  useEffect(() => {
    if (!showLoader) return;
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [showLoader]);

  if (!showLoader) return null;

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-fade-in-up">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150 animate-pulse" />
        <div className="bg-linear-to-tr from-primary to-accent-lavender p-4 rounded-3xl shadow-xl relative z-10">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
      
      <div className="h-10 flex items-center justify-center overflow-hidden w-full max-w-sm text-center">
        <p 
          key={textIndex} 
          className="text-foreground/80 font-medium text-lg animate-fade-in-up tracking-wide"
        >
          {loadingTexts[textIndex]}
        </p>
      </div>
    </div>
  );
};
