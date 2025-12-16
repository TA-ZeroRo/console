import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "캠페인 설명글 (2-3문장, 마크다운 형식)"
    }
  },
  required: ["description"]
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY || '';

  if (!apiKey) {
    return NextResponse.json({
      description: "API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요."
    });
  }

  try {
    const { title, keywords } = await request.json();

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `캠페인 제목: "${title}"
키워드: ${keywords}

위 캠페인에 대한 설명글을 작성하세요.

규칙:
- 2-3문장으로 간결하게 작성
- 한국어로 작성
- 마크다운 형식 사용 가능
- 선택지나 옵션 제공 금지 (단일 설명글만 작성)
- 참여를 유도하는 긍정적인 톤`,
      config: {
        systemInstruction: "당신은 환경 NGO와 정부 기관을 위한 전문 카피라이터입니다. 항상 하나의 완성된 설명글만 제공하세요.",
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const result = JSON.parse(response.text || '{}');
    return NextResponse.json({ description: result.description || "" });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "설명 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}
