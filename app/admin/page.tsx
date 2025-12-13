"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Building2, User, Mail, Calendar } from 'lucide-react';
import { Button, Input } from '@/app/components/UiKit';
import { PartnerApplication } from '@/app/types';

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

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
    invited: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  const labels: Record<string, string> = {
    pending: '대기중',
    approved: '승인됨',
    rejected: '거절됨',
    invited: '초대완료'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded textxs font-semibold border ${styles[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {labels[status] || status}
    </span>
  );
};

export default function AdminApplicationsPage() {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret') || '';

  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
      });

      const res = await fetch(`/api/applications?${params}`);

      if (!res.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }

      const data = await res.json();
      setApplications(data.data || []);
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
    fetchApplications();
  }, [pagination.page, statusFilter]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200 sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Applications</h2>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">
            Management Console • {pagination.total} Records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="appearance-none h-9 pl-9 pr-8 rounded bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
            >
              <option value="all">모든 상태</option>
              <option value="pending">대기중</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거절됨</option>
              <option value="invited">초대완료</option>
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchApplications}
            className="h-9 border-slate-200 hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-slate-200 border-dashed">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-4" />
            <p className="text-slate-500 font-medium">Loading Application Data...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 rounded-lg p-8 text-center">
            <p className="text-rose-600 font-medium mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchApplications} className="bg-white hover:bg-rose-50 border-rose-200 text-rose-600">
              Retry Connection
            </Button>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-lg border border-slate-100">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No applications found matching criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {/* Data Header (Hidden on mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">Organization / Contact</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Usage of divide-y for separation */}
            <div className="divide-y divide-slate-100">
              {applications.map((app) => (
                <div key={app.id} className="group hover:bg-indigo-50/30 transition-colors p-4 md:px-6 md:py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                  {/* Organization Info */}
                  <div className="col-span-12 md:col-span-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                          {app.organization_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                          <User className="w-3 h-3" />
                          <span>{app.contact_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                    <span className="md:hidden text-xs font-semibold text-slate-400 w-16">TYPE</span>
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">
                      {organizationTypeLabels[app.organization_type] || app.organization_type}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                    <span className="md:hidden text-xs font-semibold text-slate-400 w-16">DATE</span>
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      {formatDate(app.created_at)}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                    <span className="md:hidden text-xs font-semibold text-slate-400 w-16">STATUS</span>
                    <StatusBadge status={app.status} />
                  </div>

                  {/* Actions */}
                  <div className="col-span-6 md:col-span-2 text-right">
                    <Link href={`/admin/applications/${app.id}?secret=${secret}`}>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <span className="mr-2 text-xs font-medium">Review</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination Control */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="text-xs text-slate-400 font-medium">
          Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center px-2">
            <span className="text-sm font-semibold text-slate-700">{pagination.page}</span>
            <span className="text-sm text-slate-400 mx-1">/</span>
            <span className="text-sm text-slate-500">{pagination.totalPages || 1}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
