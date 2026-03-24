module.exports = async function handler(req, res) {
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

  const prompt = `당신은 아동 미술 심리 전문가입니다. 아래 어린이 그림을 분석하여 JSON만 출력하세요. 코드블록, 마크다운, 설명 없이 순수 JSON만 출력하세요.

${childInfo ? `[아이 정보]\n${childInfo}\n` : ''}

아래 형식으로 각 항목을 실제 그림 기반으로 구체적이고 전문적으로 2~3문장씩 작성하세요:
{"overallEmotion":{"emoji":"😊","title":"전반적 심리 상태 제목","description":"설명 3문장"},"composition":{"spaceUsage":"공간활용 분석 2~3문장","placement":"배치 분석 2~3문장","balance":"균형감 분석 2~3문장"},"lineAndPressure":{"lineQuality":"선 분석 2~3문장","pressure":"필압 분석 2~3문장","controlLevel":"제어수준 분석 2~3문장"},"colorAnalysis":{"dominantColors":"주요색상 분석 2~3문장","colorVariety":"다양성 분석 2~3문장","colorHarmony":"조화 분석 2~3문장"},"figureExpression":{"humanFigure":"인물표현 분석 2~3문장","relationships":"관계 분석 2~3문장","details":"세부묘사 분석 2~3문장"},"emotionalIndicators":{"scores":[{"label":"정서 안정감","score":75,"color":"#4AADA8","comment":"근거 한 문장"},{"label":"자아 표현력","score":80,"color":"#F4956A","comment":"근거 한 문장"},{"label":"사회적 관계","score":65,"color":"#C4A8D4","comment":"근거 한 문장"},{"label":"자신감","score":70,"color":"#88B9A0","comment":"근거 한 문장"},{"label":"창의성","score":85,"color":"#F9C74F","comment":"근거 한 문장"},{"label":"집중력","score":72,"color":"#E8614A","comment":"근거 한 문장"}]},"developmentAssessment":{"cognitiveLevel":"인지발달 분석 2~3문장","motorSkills":"소근육 분석 2~3문장","ageAppropriate":"연령적합성 분석 2~3문장"},"attentionPoints":{"positives":["긍정신호1","긍정신호2","긍정신호3"],"watchPoints":["관찰사항1"]},"advice":{"immediate":"즉각 상호작용 방법 2~3문장","environment":"환경 조성 방법 2~3문장","activities":["추천활동1","추천활동2","추천활동3"],"professional":"전문가 상담 필요 여부 1~2문장"}}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: imageType, data: image } },
          { text: prompt }
        ]}],
        generationConfig: { temperature: 0.3, maxOutputTokens: 3000 }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ content: [{ type: 'text', text: 'API오류: ' + data.error.message }] });
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!raw) {
      return res.status(200).json({ content: [{ type: 'text', text: '빈응답: ' + JSON.stringify(data).substring(0, 200) }] });
    }

    // 코드블록 제거
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    // JSON 파싱
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e1) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (e2) {
          return res.status(200).json({ content: [{ type: 'text', text: '파싱오류: ' + cleaned.substring(0, 200) }] });
        }
      } else {
        return res.status(200).json({ content: [{ type: 'text', text: '파싱오류: ' + cleaned.substring(0, 200) }] });
      }
    }

    return res.status(200).json({ content: [{ type: 'text', text: JSON.stringify(parsed) }] });

  } catch (err) {
    return res.status(200).json({ content: [{ type: 'text', text: '서버오류: ' + err.message }] });
  }
};
