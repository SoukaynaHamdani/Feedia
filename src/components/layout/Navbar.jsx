import React from 'react';
import { Leaf, Home, Sparkles } from 'lucide-react';
import useAppStore from '../../store/useAppStore';

export default function Navbar() {
  const { currentView, setView } = useAppStore();

  return (
    <>
      {/* Top Navbar (Desktop & Tablet) */}
      <nav className="hidden sm:block sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => setView('home')}
            >
              <div className="p-2 bg-agricultural-green/10 rounded-xl group-hover:bg-agricultural-green/20 transition-colors">
                <Leaf className="w-6 h-6 text-agricultural-green" />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">
                Feed<span className="text-agricultural-green">ia</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setView('home')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${currentView === 'home' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                Home
              </button>
              <button
                onClick={() => setView('assistant')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${['assistant', 'generating', 'report'].includes(currentView) ? 'bg-agricultural-green text-white shadow-md' : 'text-slate-600 hover:bg-agricultural-green/10 hover:text-agricultural-green-dark'}`}
              >
                Feed by AI
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Top Mobile Header (Logo Only) */}
      <nav className="sm:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="px-4 h-14 flex items-center justify-center">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setView('home')}
          >
            <Leaf className="w-5 h-5 text-agricultural-green" />
            <span className="font-bold text-lg text-slate-800 tracking-tight">
              Feedia<span className="text-agricultural-green">AI</span>
            </span>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${currentView === 'home' ? 'text-agricultural-green' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-1.5 rounded-full ${currentView === 'home' ? 'bg-agricultural-green/10' : ''}`}>
              <Home className={`w-5 h-5 ${currentView === 'home' ? 'fill-agricultural-green/20' : ''}`} />
            </div>
            <span className="text-[10px] font-bold tracking-wide">Home</span>
          </button>

          <button
            onClick={() => setView('assistant')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${['assistant', 'generating', 'report'].includes(currentView) ? 'text-agricultural-green' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-1.5 rounded-full ${['assistant', 'generating', 'report'].includes(currentView) ? 'bg-agricultural-green/10' : ''}`}>
              <Sparkles className={`w-5 h-5 ${['assistant', 'generating', 'report'].includes(currentView) ? 'fill-agricultural-green/20' : ''}`} />
            </div>
            <span className="text-[10px] font-bold tracking-wide">Feed by AI</span>
          </button>
        </div>
      </nav>
    </>
  );
}
