import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Button } from '../components/Button';

export const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-950">
      {/* Animated blurred pink blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="bg-blob w-[600px] h-[600px] bg-primary/40 top-[-10%] right-[-10%]"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="bg-blob w-[500px] h-[500px] bg-pink-600/30 bottom-[-10%] left-[-10%]"
          style={{ animationDelay: '-1s' }}
        />
        <div
          className="bg-blob w-[400px] h-[400px] bg-rose-500/30 top-[40%] left-[30%]"
          style={{ animationDelay: '-3s' }}
        />
      </div>
      
      {/* Translucent black overlay */}
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col items-center pt-[20vh] px-4 relative z-10">
        {/* Logo matching the sidebar style but larger */}
        <div className="flex flex-col items-center gap-4 animate-fade-in-up">
          <div className="bg-linear-to-br from-primary to-accent-coral p-5 rounded-3xl text-white shadow-xl shadow-primary/30">
            <Sparkles size={48} />
          </div>
          <div className="text-center leading-tight">
            <span className="font-display text-6xl md:text-8xl font-bold bg-linear-to-r from-primary to-accent-coral bg-clip-text text-transparent">
              Beautify
            </span>
            <p className="text-base md:text-lg text-white/70 font-medium mt-2 tracking-widest uppercase">
              by Ramat
            </p>
          </div>
        </div>

        {/* Temporary enter app button */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/home">
            <Button className="px-10 h-14 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
              Enter App
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
