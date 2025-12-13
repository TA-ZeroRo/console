"use client";

import React from 'react';
import { Settings, Bell, Shield, Database, Mail } from 'lucide-react';
import { Button } from '@/app/components/UiKit';

export default function SettingsPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">설정</h1>
        <p className="text-slate-600 mt-1">시스템 설정을 관리합니다.</p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">일반 설정</h2>
              <p className="text-sm text-slate-500">기본 시스템 설정</p>
            </div>
          </div>
          <div className="text-slate-500 text-sm bg-slate-50 rounded-lg p-4">
            준비 중입니다.
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">알림 설정</h2>
              <p className="text-sm text-slate-500">이메일 및 푸시 알림 설정</p>
            </div>
          </div>
          <div className="text-slate-500 text-sm bg-slate-50 rounded-lg p-4">
            준비 중입니다.
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">이메일 템플릿</h2>
              <p className="text-sm text-slate-500">초대 및 알림 이메일 템플릿 관리</p>
            </div>
          </div>
          <div className="text-slate-500 text-sm bg-slate-50 rounded-lg p-4">
            준비 중입니다.
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">보안 설정</h2>
              <p className="text-sm text-slate-500">접근 권한 및 보안 설정</p>
            </div>
          </div>
          <div className="text-slate-500 text-sm bg-slate-50 rounded-lg p-4">
            준비 중입니다.
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">데이터 관리</h2>
              <p className="text-sm text-slate-500">데이터 백업 및 관리</p>
            </div>
          </div>
          <div className="text-slate-500 text-sm bg-slate-50 rounded-lg p-4">
            준비 중입니다.
          </div>
        </div>
      </div>
    </div>
  );
}
