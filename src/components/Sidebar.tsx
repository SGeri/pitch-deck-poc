'use client';

import { Clock, FileText, LayoutDashboard, Plus, Settings } from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
    currentView: 'templates' | 'editor' | 'history';
    onNavigate: (view: 'templates' | 'editor' | 'history') => void;
    onNewPresentation: () => void;
}

export default function Sidebar({
    currentView,
    onNavigate,
    onNewPresentation,
}: SidebarProps) {
    return (
        <aside className="fixed left-0 top-0 z-20 flex h-screen w-16 flex-col bg-[var(--bg-sidebar)]">
            {/* Logo - Official MOL Group Logo */}
            {/* Source: https://companieslogo.com/molgroup/logo/ */}
            <div className="flex h-14 items-center justify-center">
                <div className="flex size-9 cursor-pointer items-center justify-center rounded-md bg-white/[0.06] transition-colors hover:bg-white/[0.10]">
                    <Image
                        src="https://companieslogo.com/img/orig/MOL.BD-c934a47c.png?t=1746037947"
                        alt="MOL"
                        width={20}
                        height={24}
                        className="opacity-80"
                        unoptimized
                    />
                </div>
            </div>

            {/* New Button */}
            <div className="px-2 pb-3">
                <button
                    onClick={onNewPresentation}
                    className="flex h-10 w-full items-center justify-center rounded-md bg-[var(--mol-red)] transition-colors hover:bg-[var(--mol-red-hover)]"
                    title="New Presentation"
                >
                    <Plus className="size-5 text-white" />
                </button>
            </div>

            {/* Divider */}
            <div className="mx-3 mb-2 h-px bg-white/10" />

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-2">
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
            <div className="space-y-2 px-2 pb-3">
                <div className="mx-1 h-px bg-white/10" />
                <button className="flex h-10 w-full items-center justify-center rounded-md transition-colors hover:bg-white/[0.06]">
                    <Settings className="size-[18px] text-white/50 hover:text-white/70" />
                </button>
                <div className="flex items-center justify-center pb-1">
                    <div className="flex size-9 items-center justify-center rounded-md bg-white/[0.06]">
                        <span className="text-[11px] font-medium text-white/60">JD</span>
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
            className={`relative flex h-12 w-full flex-col items-center justify-center gap-1 rounded-md transition-colors ${
                active
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/50 hover:bg-white/[0.04] hover:text-white/70'
            }`}
            title={label}
        >
            {active && (
                <div className="absolute -left-2 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-[var(--mol-red)]" />
            )}
            <Icon className="size-5" />
            <span className="text-[9px] font-medium">{label}</span>
        </button>
    );
}
