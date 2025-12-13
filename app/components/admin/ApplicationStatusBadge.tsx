"use client";

import React from 'react';
import { ApplicationStatus } from '@/app/types';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus | string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: '대기중',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  approved: {
    label: '승인됨',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  rejected: {
    label: '거절됨',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  invited: {
    label: '초대완료',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

export default function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
