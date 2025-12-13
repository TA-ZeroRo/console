"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { Button, Input } from '@/app/components/UiKit';
import { Logo } from '@/app/components/Logo';
import { CheckCircle } from 'lucide-react';

type Step = 'email' | 'reset' | 'sent';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // URL hash에서 토큰 확인 (비밀번호 재설정 링크 클릭 시)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');

    if (accessToken && refreshToken && type === 'recovery') {
      // 세션 설정 후 비밀번호 재설정 폼 표시
      const setSession = async () => {
        const supabase = createClient();
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        setStep('reset');
      };
      setSession();
    }
  }, []);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset-password`,
      });

      if (resetError) {
        setError('이메일 발송에 실패했습니다. 이메일 주소를 확인해주세요.');
        setLoading(false);
        return;
      }

      setStep('sent');
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
        setError('비밀번호 재설정에 실패했습니다. 다시 시도해주세요.');
        setLoading(false);
        return;
      }

      await supabase.auth.signOut();
      router.push('/login?message=password-reset');
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleBackToLogin = () => {
    router.push('/login');
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
            Reset your password securely.
          </h2>
        </div>
        <div className="relative z-10 text-slate-400 text-sm">
          &copy; 2025 Zeroro Inc. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Step 1: Email Input */}
          {step === 'email' && (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">비밀번호 재설정</h1>
                <p className="text-slate-500 text-sm">가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
              </div>

              <form onSubmit={handleSendResetEmail} className="space-y-5">
                <Input
                  label="이메일"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="name@organization.com"
                />

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-emerald-500/20" isLoading={loading}>
                  재설정 링크 발송
                </Button>
              </form>

              <div className="text-center pt-4">
                <button onClick={handleBackToLogin} className="text-sm text-slate-500 hover:text-emerald-600 font-medium">
                  &larr; 로그인으로 돌아가기
                </button>
              </div>
            </>
          )}

          {/* Step: Email Sent */}
          {step === 'sent' && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">이메일을 확인해주세요</h1>
                <p className="text-slate-500 text-sm">
                  <span className="font-medium text-slate-700">{email}</span>으로<br />
                  비밀번호 재설정 링크를 발송했습니다.
                </p>
              </div>

              <div className="text-center pt-4">
                <button onClick={handleBackToLogin} className="text-sm text-slate-500 hover:text-emerald-600 font-medium">
                  &larr; 로그인으로 돌아가기
                </button>
              </div>
            </>
          )}

          {/* Step 2: Reset Password */}
          {step === 'reset' && (
            <>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">새 비밀번호 설정</h1>
                <p className="text-slate-500 text-sm">새로 사용할 비밀번호를 입력해주세요.</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
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
                  비밀번호 변경
                </Button>
              </form>

              <div className="text-center pt-4">
                <button onClick={handleBack} className="text-sm text-slate-500 hover:text-emerald-600 font-medium">
                  &larr; 홈으로 돌아가기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
