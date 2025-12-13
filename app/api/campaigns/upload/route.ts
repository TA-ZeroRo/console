import { createAdminClient } from '@/app/lib/supabase/admin'
import { NextResponse } from 'next/server'

// POST: 캠페인 이미지 업로드
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '파일을 선택해주세요.' },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 5MB 이하여야 합니다.' },
        { status: 400 }
      )
    }

    // 허용된 파일 타입 (이미지만)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'JPG, PNG, WEBP 이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // 파일명 생성 (타임스탬프 + 랜덤)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop()
    const fileName = `campaigns/${timestamp}-${randomStr}.${ext}`

    // ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Supabase Storage에 업로드
    const { data, error } = await adminClient.storage
      .from('campaign-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: '파일 업로드 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // Public URL 생성
    const { data: urlData } = adminClient.storage
      .from('campaign-images')
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
