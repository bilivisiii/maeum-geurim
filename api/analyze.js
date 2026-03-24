export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image, imageType, age, gender, context } = req.body;

  const childInfo = [
    age && `나이: ${age}`,
    gender && `성별: ${gender}`,
    context && `추가 정보: ${context}`
  ].filter(Boolean).join('\n');

  const prompt = `당신은 아동 미술 심리 전문가입니다. 아래 어린이 그림을 분석하여 JSON만 출력하세요. 다른 텍스트는 절대 포함하지 마세요.

${childInfo ? `[아이 정보]\n${childInfo}\n` : ''}

출력 형식:
{
  "overallEmotion": { "emoji": "😊", "title": "전반적 심리 상태", "description": "설명 3문장" },
  "composition": { "spaceUsage": "공간활용 분석", "placement": "배치 분석", "balance": "균형감 분석" },
  "lineAndPressure": { "lineQuality": "선 분석", "pressure": "필압 분석", "controlLevel": "제어수준 분석" },
  "colorAnalysis": { "dominantColors": "주요색상 분석", "colorVariety": "다양성 분석", "colorHarmony": "조화 분석" },
  "figureExpression": { "humanFigure": "인물표현 분석", "relationships": "관계 분석", "details": "세부묘사 분석" },
  "emotionalIndicators": { "scores": [
    {"label": "정서 안정감", "score": 75, "color": "#4AADA8", "comment": "근거"},
    {"label": "자아 표현력", "score": 80, "color": "#F4956A", "comment": "근거"},
    {"label": "사회적 관계", "score": 65, "color": "#C4A8D4", "comment": "근거"},
    {"label": "자신감", "score": 70, "color": "#88B9A0", "comment": "근거"},
    {"label": "창의성", "score": 85, "color": "#F9C74F", "comment": "근거"},
    {"label": "집중력", "score": 72, "color": "#E8614A", "comment": "근거"}
  ]},
  "developmentAssessment": { "cognitiveLevel": "인지발달 분석", "motorSkills": "소근육 분석", "ageAppropriate": "연령적합성 분석" },
  "attentionPoints": { "positives": ["긍정1", "긍정2", "긍정3"], "watchPoints": ["관찰사항1"] },
  "advice": { "immediate": "즉각 상호작용 방법", "environment": "환경 조성 방법", "activities": ["활동1", "활동2", "활동3"], "professional": "전문가 상담 필요 여부" }
}`;

  try {
    const response = await fetch(
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBoBapWBrrII_4eNjkfVOsxPWtVrMyEUMM`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { inline_data: { mime_type: imageType, data: image } },
            { text: prompt }
          ]}],
          generationConfig: { temperature: 0.3, maxOutputTokens: 3000 }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.json({ content: [{ type: 'text', text: JSON.stringify({ error: data.error }) }] });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // 디버깅: 원문 그대로 반환
    return res.json({ content: [{ type: 'text', text: text || '빈응답:' + JSON.stringify(data) }] });

  } catch (err) {
    return res.json({ content: [{ type: 'text', text: '서버오류: ' + err.message }] });
  }
}
