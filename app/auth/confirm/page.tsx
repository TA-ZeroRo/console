"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('인증 처리 중...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createClient();

        // URL hash fragment에서 세션 정보 추출
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // 세션 설정
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Session error:', error);
            setStatus('error');
            setMessage('세션 설정에 실패했습니다.');
            return;
          }

          setStatus('success');
          setMessage('인증이 완료되었습니다! 비밀번호를 설정해주세요.');

          // 잠시 후 비밀번호 설정 페이지로 이동
          setTimeout(() => {
            router.push('/auth/set-password');
          }, 1500);
          return;
        }

        // hash에 토큰이 없으면 에러
        setStatus('error');
        setMessage('유효한 인증 정보를 찾을 수 없습니다.');

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('인증 처리 중 오류가 발생했습니다.');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">인증 처리 중</h1>
            <p className="text-slate-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">인증 완료</h1>
            <p className="text-slate-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">인증 오류</h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
