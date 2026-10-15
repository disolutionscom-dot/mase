import React from 'react';
import {
  Award,
  ShieldCheck,
  BarChart3,
  LogOut,
  Sparkles,
  Smartphone,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { UserRole, Judge } from '../types';

interface NavbarProps {
  currentRole: UserRole | null;
  currentJudge: Judge | null;
  onSelectRole: (role: UserRole) => void;
  onLogout: () => void;
  exhibitionName: string;
  resultsFinal: boolean;
  rankingsPublished: boolean;
  onOpenHelp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentJudge,
  onSelectRole,
  onLogout,
  exhibitionName,
  resultsFinal,
  rankingsPublished,
  onOpenHelp,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A3D2C] text-white border-b border-[#0B6E4F]/40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] text-[#241900] font-black text-lg flex items-center justify-center shadow-inner ring-2 ring-[#D4AF37]/40 flex-shrink-0">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  GMU MASE
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold bg-[#B8860B]/20 text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#B8860B]/40">
                  Live Platform
                </span>
              </div>
              <div className="text-xs text-[#9FC4B4] font-medium truncate max-w-[200px] sm:max-w-md">
                {exhibitionName}
              </div>
            </div>
          </div>

          {/* Center Navigation Buttons */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-[#05261B] p-1 rounded-xl border border-[#0B6E4F]/30">
            <button
              onClick={() => onSelectRole('judge')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentRole === 'judge'
                  ? 'bg-[#0B6E4F] text-white shadow-sm'
                  : 'text-[#C7DDD3] hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Judge Portal</span>
            </button>

            <button
              onClick={() => onSelectRole('viewer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentRole === 'viewer'
                  ? 'bg-[#0B6E4F] text-white shadow-sm'
                  : 'text-[#C7DDD3] hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Live Dashboard</span>
            </button>

            <button
              onClick={() => onSelectRole('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                currentRole === 'admin'
                  ? 'bg-[#0B6E4F] text-white shadow-sm'
                  : 'text-[#C7DDD3] hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
            </button>
          </nav>

          {/* Right Status / User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Indicator */}
            <div className="hidden lg:flex items-center gap-2 bg-[#05261B] px-3 py-1.5 rounded-full border border-[#0B6E4F]/30 text-xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[#C7DDD3] font-medium">
                {resultsFinal
                  ? 'Results Final'
                  : rankingsPublished
                  ? 'Live Rankings Active'
                  : 'Judging In Progress'}
              </span>
            </div>

            {currentJudge && currentRole === 'judge' ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:block text-right">
                  <div className="text-xs font-bold text-white truncate max-w-[150px]">
                    {currentJudge.Name}
                  </div>
                  <div className="text-[10px] text-[#D4AF37] font-mono">
                    {currentJudge.AccessCode}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-red-950/40 text-red-300 hover:bg-red-900/60 hover:text-white text-xs font-semibold flex items-center gap-1 border border-red-800/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : null}

            {currentRole === 'admin' && (
              <button
                onClick={onLogout}
                title="Exit Admin"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/10 text-[#C7DDD3] hover:bg-white/20 hover:text-white text-xs font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            )}

            {onOpenHelp && (
              <button
                onClick={onOpenHelp}
                title="Google Drive Fix & Help Guide"
                className="p-2 rounded-lg bg-[#B8860B]/20 text-[#D4AF37] hover:bg-[#B8860B]/30 transition"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
