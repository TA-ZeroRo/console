"use client";

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/UiKit';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">인증 오류</h1>
        <p className="text-slate-600 mb-6">
          초대 링크가 만료되었거나 유효하지 않습니다.
          <br />
          관리자에게 새로운 초대를 요청해주세요.
        </p>
        <Link href="/">
          <Button variant="outline">홈으로 돌아가기</Button>
        </Link>
      </div>
    </div>
  );
}
