'use client';

import Image from 'next/image';
import { LayoutDashboard, FileText, Clock, Settings, Plus } from 'lucide-react';

interface SidebarProps {
  currentView: 'templates' | 'editor' | 'history';
  onNavigate: (view: 'templates' | 'editor' | 'history') => void;
  onNewPresentation: () => void;
}

export default function Sidebar({ currentView, onNavigate, onNewPresentation }: SidebarProps) {
  return (
    <aside className="w-16 h-screen bg-[var(--bg-sidebar)] flex flex-col fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center">
        <div className="w-9 h-9 rounded-md bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.10] transition-colors cursor-pointer">
          <Image
            src="/mol-icon.svg"
            alt="MOL"
            width={20}
            height={24}
            className="opacity-80"
          />
        </div>
      </div>

      {/* New Button */}
      <div className="px-2 pb-3">
        <button
          onClick={onNewPresentation}
          className="w-full h-10 rounded-md bg-[var(--mol-red)] hover:bg-[var(--mol-red-hover)] flex items-center justify-center transition-colors"
          title="New Presentation"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-white/10 mb-2" />

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        <NavButton
          icon={LayoutDashboard}
          label="Templates"
          active={currentView === 'templates'}
          onClick={() => onNavigate('templates')}
        />
        <NavButton
          icon={FileText}
          label="Editor"
          active={currentView === 'editor'}
          onClick={() => onNavigate('editor')}
        />
        <NavButton
          icon={Clock}
          label="History"
          active={currentView === 'history'}
          onClick={() => onNavigate('history')}
        />
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 space-y-2">
        <div className="mx-1 h-px bg-white/10" />
        <button className="w-full h-10 rounded-md hover:bg-white/[0.06] flex items-center justify-center transition-colors">
          <Settings className="w-[18px] h-[18px] text-white/50 hover:text-white/70" />
        </button>
        <div className="flex items-center justify-center pb-1">
          <div className="w-9 h-9 rounded-md bg-white/[0.06] flex items-center justify-center">
            <span className="text-white/60 text-[11px] font-medium">JD</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-12 rounded-md flex flex-col items-center justify-center gap-1 transition-colors relative ${
        active
          ? 'bg-white/[0.08] text-white'
          : 'text-white/50 hover:text-white/70 hover:bg-white/[0.04]'
      }`}
      title={label}
    >
      {active && (
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--mol-red)] rounded-r" />
      )}
      <Icon className="w-5 h-5" />
      <span className="text-[9px] font-medium">{label}</span>
    </button>
  );
}
