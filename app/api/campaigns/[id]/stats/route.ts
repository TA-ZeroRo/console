import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

// GET - 캠페인 통계 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id);
    const supabase = await createClient();

    // 로그인된 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 파트너 정보 조회
    const { data: partner } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!partner) {
      return NextResponse.json({ error: '파트너 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 캠페인 소유권 확인
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('id', campaignId)
      .eq('partner_id', partner.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: '캠페인을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 해당 캠페인의 미션 템플릿 조회
    const { data: missionTemplates } = await supabase
      .from('mission_templates')
      .select('id, title, verification_type, reward_points')
      .eq('campaign_id', campaignId)
      .order('order', { ascending: true });

    const templates = missionTemplates || [];
    const templateIds = templates.map(t => t.id);

    if (templateIds.length === 0) {
      return NextResponse.json({
        data: {
          totalParticipants: 0,
          totalMissions: 0,
          missionStats: [],
          statusBreakdown: {
            inProgress: 0,
            pendingVerification: 0,
            completed: 0,
            failed: 0
          },
          completionRate: 0
        }
      });
    }

    // 미션 로그 조회
    const { data: missionLogs } = await supabase
      .from('mission_logs')
      .select('id, user_id, mission_template_id, status')
      .in('mission_template_id', templateIds);

    const logs = missionLogs || [];

    // 고유 참여자 수
    const uniqueUsers = new Set(logs.map(log => log.user_id));
    const totalParticipants = uniqueUsers.size;

    // 상태별 집계
    const statusBreakdown = {
      inProgress: logs.filter(l => l.status === 'IN_PROGRESS').length,
      pendingVerification: logs.filter(l => l.status === 'PENDING_VERIFICATION').length,
      completed: logs.filter(l => l.status === 'COMPLETED').length,
      failed: logs.filter(l => l.status === 'FAILED').length
    };

    // 미션별 통계
    const missionStats = templates.map(template => {
      const templateLogs = logs.filter(l => l.mission_template_id === template.id);
      const completed = templateLogs.filter(l => l.status === 'COMPLETED').length;
      const pending = templateLogs.filter(l => l.status === 'PENDING_VERIFICATION').length;
      const inProgress = templateLogs.filter(l => l.status === 'IN_PROGRESS').length;
      const failed = templateLogs.filter(l => l.status === 'FAILED').length;
      const total = templateLogs.length;

      return {
        id: template.id,
        title: template.title,
        verificationType: template.verification_type,
        rewardPoints: template.reward_points,
        total,
        completed,
        pending,
        inProgress,
        failed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });

    // 전체 완료율 (COMPLETED 상태의 미션 로그 / 전체 미션 로그)
    const totalLogs = logs.length;
    const completedLogs = statusBreakdown.completed;
    const completionRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0;

    return NextResponse.json({
      data: {
        totalParticipants,
        totalMissions: templates.length,
        missionStats,
        statusBreakdown,
        completionRate
      }
    });
  } catch (error) {
    console.error('Campaign stats error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
