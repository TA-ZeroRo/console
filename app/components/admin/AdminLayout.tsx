"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, LogOut } from 'lucide-react';
import { Button } from '@/app/components/UiKit';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-6 shadow-lg z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg tracking-tight leading-tight">ZeroRo Console</h1>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Admin Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 text-sm">
              <LogOut className="w-4 h-4 mr-2" />
              Exit to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
