import React from 'react';
import { Search, Sparkles, Send } from 'lucide-react';

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOrderClick: () => void;
}

export default function Navbar({
  searchTerm,
  onSearchChange,
  onOrderClick,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Banner */}
      <div className="bg-stone-800 text-center py-1.5 text-xs font-mono text-stone-300 flex items-center justify-center gap-2 px-4">
        <Sparkles size={13} className="text-amber-400 animate-pulse" />
        <span>CURATED RETRO & VINTAGE FINDINGS • ORDER DIRECTLY VIA INSTAGRAM DM</span>
        <Sparkles size={13} className="text-amber-400 animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-stone-950 font-bold font-mono text-xl shadow-inner">
              B
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
                BLK2S <span className="text-amber-400">THRIFT</span>
              </h1>
              <p className="text-[10px] text-stone-400 font-mono tracking-wider">CLOTH AND THRIFT</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-stone-400" />
            </div>
            <input
              type="text"
              id="desktop-search"
              placeholder="Search archives, brands, jeans, denim..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 border border-stone-700 rounded-md bg-stone-800/80 text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Order / Contact Section Link Button */}
            <button
              onClick={onOrderClick}
              id="order-button"
              className="relative px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-mono font-bold text-xs transition-all flex items-center gap-2 border border-amber-400/20 active:scale-95 shadow-md shadow-amber-400/5 cursor-pointer"
            >
              <Send size={14} className="animate-bounce" />
              <span>How To Order</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-4 relative md:hidden">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none pb-4">
            <Search className="h-4 w-4 text-stone-400" />
          </div>
          <input
            type="text"
            id="mobile-search"
            placeholder="Search archives, brands, denim..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 border border-stone-700 rounded-md bg-stone-800 text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm transition-all"
          />
        </div>
      </div>
    </header>
  );
}
