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

  const prompt = `당신은 15년 경력의 아동 미술 심리 전문가입니다. 아래 어린이 그림을 심층 분석하여 반드시 JSON 형식으로만 응답하세요. 마크다운, 설명, 코드블록 없이 순수 JSON만 출력하세요.

${childInfo ? `[아이 정보]\n${childInfo}\n` : ''}

각 항목을 실제 그림에서 관찰된 내용을 바탕으로 구체적이고 전문적으로 작성하세요. 각 설명은 2~4문장으로 충실하게 작성하세요.

{
  "overallEmotion": {
    "emoji": "감정 이모지 1개",
    "title": "전반적 심리 상태 (예: 안정적이고 표현력이 풍부한 상태)",
    "description": "그림 전체에서 느껴지는 아이의 현재 심리 상태를 전문가 시각으로 3~4문장 설명"
  },
  "composition": {
    "title": "그림 구성 및 공간 활용",
    "spaceUsage": "화면 공간 활용 방식과 심리적 의미 (예: 화면 중앙에 집중된 구성은 자아중심성을, 여백이 많은 구성은 내향성을 나타낼 수 있음) 2~3문장",
    "placement": "주요 대상의 위치와 크기가 나타내는 심리적 의미 2~3문장",
    "balance": "그림의 균형감과 안정성에 대한 분석 2~3문장"
  },
  "lineAndPressure": {
    "title": "선의 질과 필압 분석",
    "lineQuality": "선의 굵기, 일관성, 흐름에 대한 분석과 심리적 의미 2~3문장",
    "pressure": "필압의 강약이 나타내는 에너지 수준과 감정 상태 2~3문장",
    "controlLevel": "선 제어 능력과 발달 수준의 관계 2~3문장"
  },
  "colorAnalysis": {
    "title": "색상 선택 심리 분석",
    "dominantColors": "주로 사용된 색상과 그 심리적 의미 2~3문장",
    "colorVariety": "색상 다양성이 나타내는 감정적 풍부함 또는 제한성 2~3문장",
    "colorHarmony": "색상 조화와 아이의 내면 상태의 연관성 2~3문장"
  },
  "figureExpression": {
    "title": "인물 및 대상 표현 분석",
    "humanFigure": "사람 표현 방식(있는 경우)과 자아상, 타인 인식에 대한 분석 2~3문장. 없으면 주요 대상 분석",
    "relationships": "대상들 간의 관계 배치와 사회적 관계 인식에 대한 분석 2~3문장",
    "details": "세부 묘사 수준과 아이의 관찰력, 집중력에 대한 분석 2~3문장"
  },
  "emotionalIndicators": {
    "title": "감정 및 심리 지표",
    "scores": [
      {"label": "정서 안정감", "score": 75, "color": "#4AADA8", "comment": "지표 점수 근거 한 문장"},
      {"label": "자아 표현력", "score": 80, "color": "#F4956A", "comment": "지표 점수 근거 한 문장"},
      {"label": "사회적 관계", "score": 65, "color": "#C4A8D4", "comment": "지표 점수 근거 한 문장"},
      {"label": "자신감", "score": 70, "color": "#88B9A0", "comment": "지표 점수 근거 한 문장"},
      {"label": "창의성", "score": 85, "color": "#F9C74F", "comment": "지표 점수 근거 한 문장"},
      {"label": "집중력", "score": 72, "color": "#F4956A", "comment": "지표 점수 근거 한 문장"}
    ]
  },
  "developmentAssessment": {
    "title": "발달 단계 평가",
    "cognitiveLevel": "인지 발달 수준과 또래 대비 평가 2~3문장",
    "motorSkills": "소근육 발달 및 손-눈 협응 능력 평가 2~3문장",
    "ageAppropriate": "연령 적합성 및 발달 특이사항 2~3문장"
  },
  "attentionPoints": {
    "title": "주의 관찰 사항",
    "positives": ["긍정적 신호 1", "긍정적 신호 2", "긍정적 신호 3"],
    "watchPoints": ["관찰이 필요한 사항 1 (있는 경우)", "관찰이 필요한 사항 2 (있는 경우)"]
  },
  "advice": {
    "title": "선생님 / 부모님께 드리는 조언",
    "immediate": "지금 당장 해줄 수 있는 상호작용 방법 2~3문장",
    "environment": "아이에게 도움이 되는 환경 조성 방법 2~3문장",
    "activities": ["추천 활동 1", "추천 활동 2", "추천 활동 3"],
    "professional": "전문가 상담 필요 여부 및 근거 1~2문장"
  }
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: imageType, data: image } },
              { text: prompt }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      res.json({ content: [{ type: 'text', text: '오류: ' + JSON.stringify(data.error) }] });
      return;
    }

    if (!data.candidates || data.candidates.length === 0) {
      res.json({ content: [{ type: 'text', text: '후보없음: ' + JSON.stringify(data) }] });
      return;
    }

    const text = data.candidates[0]?.content?.parts?.[0]?.text || '';
    res.json({ content: [{ type: 'text', text }] });

  } catch (err) {
    res.json({ content: [{ type: 'text', text: '서버오류: ' + err.message }] });
  }
}
