import React, { useState } from 'react';
import { Search, Sparkles, Send, Lock, Bell } from 'lucide-react';

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOrderClick: () => void;
  onSecretClick: () => void;
  notifications: any[];
  onNotificationClick: (notif: any) => void;
  onMarkAllAsRead: () => void;
}

export default function Navbar({
  searchTerm,
  onSearchChange,
  onOrderClick,
  onSecretClick,
  notifications,
  onNotificationClick,
  onMarkAllAsRead,
}: NavbarProps) {
  const [clickCount, setClickCount] = useState(0);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (clickTimeout) {
      clearTimeout(clickTimeout);
    }

    if (newCount >= 3) {
      onSecretClick();
      setClickCount(0);
    } else {
      const timeout = setTimeout(() => {
        setClickCount(0);
      }, 2000);
      setClickTimeout(timeout);
    }
  };

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
          <div 
            onClick={handleLogoClick}
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer select-none group"
            title="Click 3 times to access Curator Portal"
          >
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-stone-950 font-bold font-mono text-xl shadow-inner group-hover:bg-amber-400 transition-colors">
              B
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5 group-hover:text-amber-400 transition-colors">
                BLK2S <span className="text-amber-400">THRIFT</span>
              </h1>
              <div className="flex items-center gap-1">
                <p className="text-[10px] text-stone-400 font-mono tracking-wider">CLOTH AND THRIFT</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSecretClick();
                  }}
                  className="p-0.5 text-stone-700 hover:text-amber-500 rounded transition-colors"
                  title="Curator Access"
                >
                  <Lock size={10} />
                </button>
              </div>
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
          <div className="flex items-center gap-3 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2.5 bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-amber-400 rounded-lg border border-stone-700/50 transition-all cursor-pointer relative"
                title="Worldwide Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-stone-950 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-stone-900 border border-stone-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800 bg-stone-900/50">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-300">Worldwide Drops</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => {
                          onMarkAllAsRead();
                        }}
                        className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-stone-850">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-stone-500 text-xs">
                        No worldwide notifications.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <button
                          key={notif.id}
                          onClick={() => {
                            onNotificationClick(notif);
                            setIsNotifOpen(false);
                          }}
                          className={`w-full px-4 py-3 hover:bg-stone-850 transition-colors cursor-pointer text-left block ${!notif.isRead ? 'bg-stone-850/40' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wide block">
                              {notif.title}
                            </span>
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-stone-500 font-mono mt-1.5 block">
                            {notif.date}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
