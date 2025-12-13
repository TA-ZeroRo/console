import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY || '';

  if (!apiKey) {
    return NextResponse.json({ missions: [] });
  }

  try {
    const { campaignTitle } = await request.json();

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `캠페인 "${campaignTitle}"에 적합한 3가지 게이미피케이션 미션을 제안해주세요.

각 미션에는 다음 정보를 포함해야 합니다:
1. title: 미션 제목 (간결하고 명확하게, 한국어로)
2. successCriteria: 미션 성공 판단 기준 (AI가 사진/텍스트를 검증할 때 사용할 구체적인 조건)

성공 기준 예시:
- 사진 인증: "쓰레기 3개 이상이 보이는 사진", "나무가 1그루 이상 포함된 사진"
- 텍스트 인증: "환경 보호 활동 경험이 50자 이상 작성됨"
- 위치 인증: "지정된 위치에서 100m 이내"

JSON 배열 형식으로 응답해주세요.
예시: [{"title": "플로깅 인증하기", "successCriteria": "쓰레기봉투와 주운 쓰레기가 함께 보이는 사진"}]`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const missions = JSON.parse(response.text || "[]");
    return NextResponse.json({ missions });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ missions: [] });
  }
}
