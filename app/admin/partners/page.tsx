"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, RefreshCw, ChevronLeft, ChevronRight, Building2, Mail, Phone } from 'lucide-react';
import { Button } from '@/app/components/UiKit';

interface Partner {
  id: string;
  user_id: string | null;
  organization_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  organization_type: string | null;
  status: 'active' | 'suspended';
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const organizationTypeLabels: Record<string, string> = {
  Government: '지자체/공공기관',
  NGO: '비영리단체/NGO',
  Corporate: '기업 CSR',
};

const statusLabels: Record<string, { label: string; className: string }> = {
  active: { label: '활성', className: 'bg-emerald-100 text-emerald-700' },
  suspended: { label: '정지', className: 'bg-red-100 text-red-700' },
};

export default function PartnersPage() {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret') || '';

  const [partners, setPartners] = useState<Partner[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
      });

      const res = await fetch(`/api/partners?${params}`);

      if (!res.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const data = await res.json();
      setPartners(data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [pagination.page, statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">파트너 목록</h1>
        <p className="text-slate-600 mt-1">등록된 파트너 단체를 관리합니다.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">상태:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">전체</option>
              <option value="active">활성</option>
              <option value="suspended">정지</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPartners}
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchPartners} className="mt-4">
              다시 시도
            </Button>
          </div>
        ) : partners.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>등록된 파트너가 없습니다.</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">단체명</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">담당자</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">유형</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">가입일</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">상태</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{partner.organization_name}</div>
                          <div className="text-sm text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {partner.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-700">{partner.contact_name}</div>
                      {partner.phone && (
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {partner.phone}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {partner.organization_type
                        ? organizationTypeLabels[partner.organization_type] || partner.organization_type
                        : '-'}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">
                      {formatDate(partner.created_at)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusLabels[partner.status]?.className || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {statusLabels[partner.status]?.label || partner.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                총 {pagination.total}건 중 {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}건
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-600 px-2">
                  {pagination.page} / {pagination.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
