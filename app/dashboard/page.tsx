"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Target,
  Trophy,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Leaf,
  MapPin,
  Award,
  X,
  CheckCircle2,
  Circle,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { exportToCSV, exportToPDF, exportToDOCX } from '../lib/exportUtils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardOverview {
  totalParticipants: number;
  completedMissions: number;
  missionCompletionRate: number;
  co2Reduction: number;
  monthlyGrowth: number;
  weeklyNewParticipants: number;
  topCampaign: {
    title: string;
    participants: number;
    completed: number;
    completionRate: number;
  } | null;
  weeklyTrend: Array<{
    date: string;
    participants: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    participants: number;
  }>;
  topCategory: string | null;
  topRegion: string | null;
  campaignCompletionRate: number;
}

const COLORS = ['#10b981', '#14b8a6', '#22c55e', '#059669', '#0d9488', '#0f766e'];

const KPICard = ({ title, value, icon: Icon, trend, trendUp, onClick, clickable, color = 'blue' }: any) => {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
    teal: 'text-teal-600 bg-teal-50',
    slate: 'text-slate-600 bg-slate-50',
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-6 transition-all duration-200 ${clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 group' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${theme}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
        {clickable && (
           <span className="text-xs text-slate-400 group-hover:text-emerald-600 transition-colors">상세보기 →</span>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [missionDetails, setMissionDetails] = useState<any>(null);
  const [showCampaignRankingModal, setShowCampaignRankingModal] = useState(false);
  const [campaignRankings, setCampaignRankings] = useState<any>(null);
  const [showCompletionRateModal, setShowCompletionRateModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch('/api/dashboard/overview');
        if (response.ok) {
          const result = await response.json();
          setOverview(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard overview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'csv' | 'pdf' | 'docx') => {
    if (!overview) return;

    switch (format) {
      case 'csv':
        exportToCSV(overview);
        break;
      case 'pdf':
        await exportToPDF(overview);
        break;
      case 'docx':
        await exportToDOCX(overview);
        break;
    }
    setShowExportDropdown(false);
  };

  const handleMissionCardClick = async () => {
    setShowMissionModal(true);
    try {
      const response = await fetch('/api/dashboard/mission-details');
      if (response.ok) {
        const result = await response.json();
        setMissionDetails(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch mission details:', error);
    }
  };

  const handleCampaignRankingClick = async () => {
    setShowCampaignRankingModal(true);
    try {
      const response = await fetch('/api/dashboard/campaign-rankings');
      if (response.ok) {
        const result = await response.json();
        setCampaignRankings(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch campaign rankings:', error);
    }
  };

  const handleCompletionRateClick = () => {
    setShowCompletionRateModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-slate-400 animate-pulse">데이터 로딩 중...</div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-slate-500">데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  // 차트 데이터 포맷팅
  const weeklyTrendFormatted = overview.weeklyTrend.map(item => ({
    date: new Date(item.date).toLocaleDateString('ko-KR', { weekday: 'short' }),
    participants: item.participants
  }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            환경 영향 보고서
          </h1>
          <p className="text-slate-500 mt-1 text-sm">실시간 환경 캠페인 성과 및 인사이트</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select className="h-10 rounded-lg border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer appearance-none shadow-sm">
              <option>최근 7일</option>
              <option>최근 30일</option>
              <option>올해</option>
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="h-10 px-5 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              내보내기
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showExportDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                        <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-slate-900">PDF 파일</p>
                      <p className="text-xs text-slate-500">전문적인 보고서 형식</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                        <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-slate-900">CSV 파일</p>
                      <p className="text-xs text-slate-500">엑셀 데이터 분석용</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport('docx')}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                         <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-slate-900">Word 파일</p>
                      <p className="text-xs text-slate-500">문서 편집 가능</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: 주요 KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="총 참여자"
          value={overview.totalParticipants.toLocaleString()}
          icon={Users}
          trend={overview.monthlyGrowth !== 0 ? `${overview.monthlyGrowth > 0 ? '+' : ''}${overview.monthlyGrowth}%` : null}
          trendUp={overview.monthlyGrowth >= 0}
          color="emerald"
        />
        <KPICard
          title="이번 주 신규"
          value={overview.weeklyNewParticipants}
          icon={Activity}
          trend={null}
          trendUp={true}
          color="blue"
        />
        <KPICard
          title="미션 완료율"
          value={`${overview.missionCompletionRate}%`}
          icon={TrendingUp}
          trend={null}
          trendUp={overview.missionCompletionRate >= 50}
          color="purple"
        />
        <KPICard
          title="CO2 절감량"
          value={`${overview.co2Reduction}kg`}
          icon={Leaf}
          trend={null}
          trendUp={true}
          color="teal"
        />
      </div>

      {/* Row 2: 상세 카드 (클릭 가능) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="완료된 미션"
          value={overview.completedMissions.toLocaleString()}
          icon={Target}
          trend={null}
          trendUp={true}
          clickable={true}
          onClick={handleMissionCardClick}
          color="slate"
        />
        
        {/* 최고 성과 캠페인 카드 */}
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-orange-200 transition-all group"
          onClick={handleCampaignRankingClick}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
               <Award className="w-6 h-6" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-orange-600 transition-colors">순위보기 →</span>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">최고 성과 캠페인</p>
          <h3 className="text-xl font-bold text-slate-900 mb-2 truncate">
            {overview.topCampaign?.title || '데이터 없음'}
          </h3>
          {overview.topCampaign && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                {overview.topCampaign.participants}명 참여
              </span>
              <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md font-medium">
                {overview.topCampaign.completionRate}% 완료율
              </span>
            </div>
          )}
        </div>

        {/* 캠페인 완료율 카드 */}
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all group"
          onClick={handleCompletionRateClick}
        >
           <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
               <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-blue-600 transition-colors">분석보기 →</span>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">전체 캠페인 완료율</p>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            {overview.campaignCompletionRate}%
          </h3>
          <p className="text-xs text-slate-500">참여자가 미션을 완료하는 비율</p>
        </div>
      </div>
      
       {/* Row 3: 인기 카테고리 + 최다 활동 지역 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
               <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">인기 카테고리</p>
              <h3 className="text-xl font-bold text-slate-900">{overview.topCategory || 'N/A'}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
               <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">최다 활동 지역</p>
              <h3 className="text-xl font-bold text-slate-900">{overview.topRegion || 'N/A'}</h3>
            </div>
          </div>
        </div>
      </div>


      {/* Row 4: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart - Weekly Trend */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
               <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">주간 참여자 추이</h3>
          </div>
          <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrendFormatted} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="participants" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorParticipants)" />
                </AreaChart>
              </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution - Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Trophy className="w-5 h-5" />
             </div>
            <h3 className="text-lg font-bold text-slate-900">카테고리별 참여자 분포</h3>
          </div>
          
          <div className="flex flex-col">
            {overview.categoryDistribution.length > 0 ? (
              <>
                 <div className="h-[250px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overview.categoryDistribution.map((item, index) => ({
                          name: item.category,
                          value: item.participants,
                          color: COLORS[index % COLORS.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {overview.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          padding: '12px'
                        }}
                        formatter={(value: any) => [`${value}명`, '참여자']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="mt-4 grid grid-cols-2 gap-3 w-full">
                  {overview.categoryDistribution.map((item, index) => {
                    const total = overview.categoryDistribution.reduce((sum, cat) => sum + cat.participants, 0);
                    const percentage = total > 0 ? ((item.participants / total) * 100).toFixed(1) : '0';
                    return (
                      <div
                        key={item.category}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">{item.category}</p>
                          <p className="text-xs text-slate-500">{item.participants}명 ({percentage}%)</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400 py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                데이터가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mission Details Modal */}
      {showMissionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                완료된 미션 상세
              </h2>
              <button
                onClick={() => setShowMissionModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] bg-slate-50/50">
              {missionDetails ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-slate-500">완료된 미션</span>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">
                        {missionDetails.completedMissions.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Circle className="w-5 h-5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-500">전체 미션</span>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">
                        {missionDetails.totalMissions.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-500">완료율</span>
                      </div>
                      <p className="text-3xl font-bold text-slate-900">
                        {missionDetails.completionRate}%
                      </p>
                    </div>
                  </div>

                  {/* Campaign-wise breakdown */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      캠페인별 현황
                    </h3>
                    {missionDetails.campaigns && missionDetails.campaigns.length > 0 ? (
                      <div className="space-y-3">
                        {missionDetails.campaigns.map((campaign: any, index: number) => (
                          <div
                            key={campaign.id}
                            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-bold text-slate-900 text-lg">{campaign.title}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${campaign.completionRate >= 70
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : campaign.completionRate >= 40
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                {campaign.completionRate}% 완료
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="bg-slate-50 p-3 rounded-lg text-center">
                                <p className="text-slate-500 text-xs mb-1">완료</p>
                                <p className="font-bold text-emerald-600 text-lg">{campaign.completed}</p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg text-center">
                                <p className="text-slate-500 text-xs mb-1">진행중</p>
                                <p className="font-bold text-blue-600 text-lg">{campaign.inProgress}</p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg text-center">
                                <p className="text-slate-500 text-xs mb-1">대기중</p>
                                <p className="font-bold text-amber-600 text-lg">{campaign.pending}</p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg text-center">
                                <p className="text-slate-500 text-xs mb-1">실패</p>
                                <p className="font-bold text-red-600 text-lg">{campaign.failed}</p>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-4 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${campaign.completionRate}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 py-12 bg-white rounded-xl border border-dashed border-slate-200">
                        미션 데이터가 없습니다
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-20">
                  <div className="text-slate-400 animate-pulse">데이터를 불러오는 중...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaign Rankings Modal */}
      {showCampaignRankingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-orange-500" />
                캠페인 참여도 순위
              </h2>
              <button
                onClick={() => setShowCampaignRankingModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] bg-slate-50/50">
              {campaignRankings ? (
                <div className="space-y-4">
                  {campaignRankings.rankings.map((campaign: any, index: number) => (
                    <div
                      key={campaign.id}
                      className={`relative rounded-xl p-5 transition-all bg-white shadow-sm border ${
                        index === 0
                          ? 'border-yellow-300 ring-1 ring-yellow-200'
                          : index === 1
                            ? 'border-slate-300'
                            : index === 2
                              ? 'border-orange-300'
                              : 'border-slate-200'
                      }`}
                    >
                      {/* Rank Badge */}
                      <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm ${index === 0
                          ? 'bg-yellow-500'
                          : index === 1
                            ? 'bg-slate-500'
                            : index === 2
                              ? 'bg-orange-500'
                              : 'bg-slate-400'
                        }`}>
                        {index + 1}
                      </div>

                      <div className="ml-4 pl-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                              {campaign.title}
                            </h3>
                            <div className="flex gap-2 mt-2">
                              {campaign.category && (
                                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                                  {campaign.category}
                                </span>
                              )}
                              {campaign.region && (
                                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                                  {campaign.region}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
                            <Users className="w-4 h-4 text-emerald-600" />
                            <p className="font-bold text-emerald-700">{campaign.participants.toLocaleString()}<span className="text-xs font-normal text-emerald-600 ml-1">참여</span></p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <p className="text-slate-500 text-xs mb-1">완료</p>
                            <p className="font-bold text-slate-900">{campaign.completed}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <p className="text-slate-500 text-xs mb-1">전체</p>
                            <p className="font-bold text-slate-900">{campaign.total}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-2 text-center">
                            <p className="text-slate-500 text-xs mb-1">완료율</p>
                            <p className="font-bold text-blue-600">{campaign.completionRate}%</p>
                          </div>
                        </div>

                        <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full transition-all duration-500"
                            style={{ width: `${campaign.completionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-20">
                  <div className="text-slate-400 animate-pulse">순위 데이터를 불러오는 중...</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Completion Rate Modal */}
      {showCompletionRateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                캠페인 완료율 분석
              </h2>
              <button
                onClick={() => setShowCompletionRateModal(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] bg-slate-50/50">
              <div className="space-y-6">
                {/* Overall Rate */}
                <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center">
                  <h3 className="text-lg font-semibold text-slate-600 mb-4">전체 캠페인 평균 완료율</h3>
                  <div className="flex items-center justify-center gap-2 mb-2">
                     <span className="text-6xl font-black text-slate-900 tracking-tight">{overview.campaignCompletionRate}</span>
                     <span className="text-3xl font-bold text-slate-400">%</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">총 {overview.completedMissions.toLocaleString()}개의 미션이 완료되었습니다</p>
                  
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden max-w-lg mx-auto">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full transition-all duration-1000"
                      style={{ width: `${overview.campaignCompletionRate}%` }}
                    />
                  </div>
                </div>

                {/* Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overview.campaignCompletionRate >= 70 ? (
                    <>
                      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <h4 className="font-bold text-emerald-900">우수한 성과</h4>
                        </div>
                        <p className="text-sm text-emerald-700 leading-relaxed">
                          평균 이상의 완료율로 참여자들의 적극적인 참여를 보여줍니다.
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          <h4 className="font-bold text-blue-900">지속적인 개선</h4>
                        </div>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          현재의 높은 완료율을 유지하며 더 많은 참여자를 유치할 수 있습니다.
                        </p>
                      </div>
                    </>
                  ) : overview.campaignCompletionRate >= 40 ? (
                    <>
                      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-5 h-5 text-amber-600" />
                          <h4 className="font-bold text-amber-900">양호한 성과</h4>
                        </div>
                        <p className="text-sm text-amber-700 leading-relaxed">
                          적정 수준의 완료율을 유지하고 있습니다. 조금 더 노력하면 우수 등급에 도달할 수 있습니다.
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-blue-600" />
                          <h4 className="font-bold text-blue-900">개선 기회</h4>
                        </div>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          미완료 미션에 대한 리마인더나 넛지를 통해 완료율을 상승시켜보세요.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-red-600" />
                          <h4 className="font-bold text-red-900">개선 필요</h4>
                        </div>
                        <p className="text-sm text-red-700 leading-relaxed">
                          현재 완료율이 다소 낮습니다. 미션이 너무 어렵거나 보상이 부족한지 점검이 필요합니다.
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-5 h-5 text-slate-600" />
                          <h4 className="font-bold text-slate-900">권장 조치</h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          리마인더 발송, 보상 강화, 또는 미션 난이도 조정을 고려해보세요.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}