import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET: 신청 상세 조회 (Admin 전용 - 미들웨어에서 인증 처리)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('partner_applications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Fetch application error:', error)
      return NextResponse.json(
        { error: '신청 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Get application error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH: 신청 상태 업데이트 (승인/거절) (Admin 전용 - 미들웨어에서 인증 처리)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, rejection_reason } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '유효한 상태값을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (status === 'rejected' && !rejection_reason) {
      return NextResponse.json(
        { error: '거절 사유를 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 상태 업데이트 (미들웨어에서 인증 처리)
    const updateData: Record<string, unknown> = {
      status,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (status === 'rejected') {
      updateData.rejection_reason = rejection_reason
    }

    const { data, error } = await supabase
      .from('partner_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update application error:', error)
      return NextResponse.json(
        { error: '상태 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Patch application error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
