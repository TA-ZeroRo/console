import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST: 새로운 파트너 신청 생성 (공개)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organization_name, contact_name, email, phone, organization_type, business_registration_url } = body

    // 필수 필드 검증
    if (!organization_name || !contact_name || !email || !phone || !organization_type) {
      return NextResponse.json(
        { error: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 중복 신청 확인
    const { data: existing } = await supabase
      .from('partner_applications')
      .select('id')
      .eq('email', email)
      .in('status', ['pending', 'approved', 'invited'])
      .single()

    if (existing) {
      return NextResponse.json(
        { error: '이미 신청된 이메일입니다.' },
        { status: 400 }
      )
    }

    // 신청 생성
    const { data, error } = await supabase
      .from('partner_applications')
      .insert({
        organization_name,
        contact_name,
        email,
        phone,
        organization_type,
        business_registration_url,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Application creation error:', error)
      return NextResponse.json(
        { error: '신청 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Application error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// GET: 신청 목록 조회 (Admin 전용 - 미들웨어에서 인증 처리)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // URL 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // 쿼리 빌드
    let query = supabase
      .from('partner_applications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Fetch applications error:', error)
      return NextResponse.json(
        { error: '목록 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
