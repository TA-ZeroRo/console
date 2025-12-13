"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/app/lib/supabase/client';
import { Button, Input } from '@/app/components/UiKit';
import { Logo } from '@/app/components/Logo';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError('비밀번호 설정에 실패했습니다. 다시 시도해주세요.');
        setLoading(false);
        return;
      }

      // 세션 종료 후 로그인 페이지로 이동
      await supabase.auth.signOut();
      router.push('/login?message=password-set');
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('/login-image.png')" }}
        />
        <div className="relative z-10">
          <Logo variant="light" className="mb-8" onClick={handleBack} />
          <h2 className="text-4xl font-bold tracking-tight max-w-lg leading-tight">
            Set up your password to get started.
          </h2>
        </div>
        <div className="relative z-10 text-slate-400 text-sm">
          &copy; 2025 Zeroro Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">비밀번호 설정</h1>
            <p className="text-slate-500 text-sm">앞으로 로그인에 사용할 비밀번호를 설정해주세요.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="새 비밀번호"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="최소 8자 이상"
            />
            <Input
              label="비밀번호 확인"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              placeholder="비밀번호를 다시 입력하세요"
            />

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-emerald-500/20" isLoading={loading}>
              비밀번호 설정 완료
            </Button>
          </form>

          <div className="text-center pt-4">
            <button onClick={handleBack} className="text-sm text-slate-500 hover:text-emerald-600 font-medium">
              &larr; 홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
