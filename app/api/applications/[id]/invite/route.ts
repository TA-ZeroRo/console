import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { NextResponse } from 'next/server'

// POST: 초대장 발송 (Admin 전용 - 미들웨어에서 인증 처리)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // 신청 정보 조회
    const { data: application, error: fetchError } = await supabase
      .from('partner_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: '신청 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 상태 확인 (approved 또는 invited만 허용 - 재발송 지원)
    if (application.status !== 'approved' && application.status !== 'invited') {
      return NextResponse.json(
        { error: '승인된 신청만 초대할 수 있습니다.' },
        { status: 400 }
      )
    }

    const isResend = application.status === 'invited'

    // 초대장 발송
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      application.email,
      {
        data: {
          role: 'ORG_MANAGER',
          organization_name: application.organization_name,
        },
        redirectTo: `${siteUrl}/auth/confirm`
      }
    )

    if (inviteError) {
      console.error('Invite error:', inviteError)
      return NextResponse.json(
        { error: `초대 발송 실패: ${inviteError.message}` },
        { status: 500 }
      )
    }

    // partners 테이블에 파트너 레코드 생성 (재발송이 아닌 경우에만)
    if (!isResend) {
      const { error: partnerError } = await supabase
        .from('partners')
        .insert({
          user_id: inviteData.user.id,
          organization_name: application.organization_name,
          contact_name: application.contact_name,
          email: application.email,
          phone: application.phone,
          organization_type: application.organization_type,
          business_registration_url: application.business_registration_url,
          status: 'active',
        })

      if (partnerError) {
        console.error('Partner creation error:', partnerError)
        // 초대는 성공했지만 파트너 생성 실패
        return NextResponse.json({
          success: true,
          warning: '초대는 발송되었지만 파트너 레코드 생성에 실패했습니다.',
          user: inviteData.user
        })
      }
    }

    // 신청 상태 업데이트
    const { error: updateError } = await supabase
      .from('partner_applications')
      .update({
        status: 'invited',
        invited_at: new Date().toISOString(),
        invited_user_id: inviteData.user.id,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Update after invite error:', updateError)
      // 초대와 파트너 생성은 성공했지만 신청 상태 업데이트 실패
      return NextResponse.json({
        success: true,
        warning: '초대는 발송되었지만 신청 상태 업데이트에 실패했습니다.',
        user: inviteData.user
      })
    }

    return NextResponse.json({
      success: true,
      message: '초대장이 발송되었습니다.',
      user: inviteData.user
    })
  } catch (error) {
    console.error('Invite error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
