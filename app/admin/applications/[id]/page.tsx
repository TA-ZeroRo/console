"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button, Textarea } from '@/app/components/UiKit';
import ApplicationStatusBadge from '@/app/components/admin/ApplicationStatusBadge';
import { PartnerApplication } from '@/app/types';

const organizationTypeLabels: Record<string, string> = {
  Government: '지자체/공공기관',
  NGO: '비영리단체/NGO',
  Corporate: '기업 CSR',
};

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret') || '';

  const [application, setApplication] = useState<PartnerApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchApplication = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/applications/${id}`);

      if (!res.ok) {
        throw new Error('신청 정보를 불러오는데 실패했습니다.');
      }

      const data = await res.json();
      setApplication(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleApprove = async () => {
    if (!confirm('이 신청을 승인하시겠습니까?')) return;

    setIsProcessing(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '승인 처리에 실패했습니다.');
      }

      await fetchApplication();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError('거절 사유를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          rejection_reason: rejectReason,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '거절 처리에 실패했습니다.');
      }

      setShowRejectModal(false);
      setRejectReason('');
      await fetchApplication();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInvite = async () => {
    if (!confirm('이 파트너에게 초대장을 발송하시겠습니까?')) return;

    setIsProcessing(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/applications/${id}/invite`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '초대 발송에 실패했습니다.');
      }

      alert('초대장이 성공적으로 발송되었습니다.');
      await fetchApplication();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error || '신청 정보를 찾을 수 없습니다.'}</p>
          <Link href={`/admin?secret=${secret}`}>
            <Button variant="outline">목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/admin?secret=${secret}`} className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로 돌아가기
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{application.organization_name}</h1>
            <p className="text-slate-600 mt-1">신청 상세 정보</p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>
      </div>

      {/* Action Error */}
      {actionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {actionError}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Organization Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-400" />
              단체 정보
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500">단체명</label>
                <p className="font-medium text-slate-900">{application.organization_name}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">단체 유형</label>
                <p className="font-medium text-slate-900">
                  {organizationTypeLabels[application.organization_type] || application.organization_type}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-slate-400" />
              담당자 정보
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3" /> 담당자명
                </label>
                <p className="font-medium text-slate-900">{application.contact_name}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> 이메일
                </label>
                <p className="font-medium text-slate-900">{application.email}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> 연락처
                </label>
                <p className="font-medium text-slate-900">{application.phone}</p>
              </div>
            </div>
          </div>

          {/* Attachment */}
          {application.business_registration_url && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                첨부 서류
              </h2>
              <a
                href={application.business_registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
              >
                <FileText className="w-4 h-4" />
                사업자등록증 보기
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Rejection Reason */}
          {application.status === 'rejected' && application.rejection_reason && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h2 className="font-semibold text-red-900 mb-2">거절 사유</h2>
              <p className="text-red-700">{application.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Sidebar - Actions & Timeline */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4">액션</h2>
            <div className="space-y-3">
              {application.status === 'pending' && (
                <>
                  <Button
                    onClick={handleApprove}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    승인하기
                  </Button>
                  <Button
                    onClick={() => setShowRejectModal(true)}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    거절하기
                  </Button>
                </>
              )}

              {application.status === 'approved' && (
                <Button
                  onClick={handleInvite}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  초대장 발송
                </Button>
              )}

              {application.status === 'invited' && (
                <div className="space-y-4">
                  <div className="text-center py-4 text-slate-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    <p className="font-medium">초대가 완료되었습니다</p>
                    <p className="text-sm mt-1">{formatDate(application.invited_at)}</p>
                  </div>
                  <Button
                    onClick={handleInvite}
                    variant="outline"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    초대 재발송
                  </Button>
                </div>
              )}

              {application.status === 'rejected' && (
                <div className="text-center py-4 text-slate-500">
                  <XCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="font-medium">거절된 신청입니다</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              타임라인
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <label className="text-slate-500">신청일</label>
                <p className="font-medium text-slate-900">{formatDate(application.created_at)}</p>
              </div>
              {application.processed_at && (
                <div>
                  <label className="text-slate-500">처리일</label>
                  <p className="font-medium text-slate-900">{formatDate(application.processed_at)}</p>
                </div>
              )}
              {application.invited_at && (
                <div>
                  <label className="text-slate-500">초대 발송일</label>
                  <p className="font-medium text-slate-900">{formatDate(application.invited_at)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">신청 거절</h3>
            <Textarea
              label="거절 사유"
              placeholder="거절 사유를 입력해주세요..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[120px]"
            />
            {actionError && (
              <p className="text-red-500 text-sm mt-2">{actionError}</p>
            )}
            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setActionError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                취소
              </Button>
              <Button
                onClick={handleReject}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                거절하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
