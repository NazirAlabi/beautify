import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Landing = () => {
  const { isAuthenticated, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/home', { replace: true });
    }
    const storedRemember = localStorage.getItem('auth_remember_me');
    if (storedRemember === 'true') {
      setRememberMe(true);
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleRememberToggle = () => {
    const newVal = !rememberMe;
    setRememberMe(newVal);
    localStorage.setItem('auth_remember_me', newVal.toString());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password) return;
    
    setIsLoggingIn(true);
    const success = await login(password);
    setIsLoggingIn(false);
    
    if (success) {
      toast.success("Welcome back!");
      // TODO: Make a 2s delay before navigating to home
      navigate('/home', { replace: true });
    } else {
      toast.error("Incorrect password");
    }
  };

  if (authLoading || isAuthenticated) return null; // Wait for redirect or load

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-950">
      {/* Animated blurred pink blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="bg-blob w-75 h-75 md:w-150 md:h-150 bg-primary/40 top-[-5%] right-[-5%] md:top-[-10%] md:right-[-10%]"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="bg-blob w-62.5 h-62.5 md:w-125 md:h-125 bg-pink-600/30 bottom-[-5%] left-[-5%] md:bottom-[-10%] md:left-[-10%]"
          style={{ animationDelay: '-1s' }}
        />
        <div
          className="bg-blob w-50 h-50 md:w-100 md:h-100 bg-rose-500/30 top-[35%] left-[5%] md:top-[40%] md:left-[30%]"
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

        {/* Login Form */}
        <form onSubmit={handleLogin} className="mt-16 px-6 w-full max-w-sm animate-fade-in-up flex flex-col items-center gap-5" style={{ animationDelay: '0.2s' }}>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/50" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 h-14 bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-lg"
              placeholder="Enter password"
              autoFocus
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group px-1 select-none">
            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
              rememberMe 
                ? 'bg-primary border-primary' 
                : 'bg-white/5 border-white/30 group-hover:border-white/50'
            }`}>
              {rememberMe && <Check size={14} className="text-white" />}
            </div>
            <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
              Remember me
            </span>
            <input 
              type="checkbox"
              className="sr-only"
              checked={rememberMe}
              onChange={handleRememberToggle}
            />
          </label>

          <Button 
            type="submit" 
            disabled={!password || isLoggingIn}
            className="w-fit h-14 text-lg rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1 mt-2"
          >
            {isLoggingIn ? 'Unlocking...' : 'Enter App'}
          </Button>
        </form>
      </div>
    </div>
  );
};
