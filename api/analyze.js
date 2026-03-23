export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { image, imageType } = req.body;

  const prompt = `당신은 아동 미술 심리 전문가입니다. 이 어린이 그림을 분석해서 반드시 아래 JSON 형식으로만 응답하세요. 절대 다른 텍스트, 설명, 마크다운 없이 JSON만 출력하세요.

{"overallEmotion":{"emoji":"😊","title":"전반적 감정 상태","description":"2-3문장 설명"},"drawingFeatures":["특성1","특성2","특성3"],"colorPsych":"색상 심리 2-3문장","emotionScores":[{"label":"안정감","score":75,"color":"#4AADA8"},{"label":"표현 욕구","score":85,"color":"#F4956A"},{"label":"사회성","score":65,"color":"#C4A8D4"},{"label":"자신감","score":70,"color":"#88B9A0"}],"developmentObservation":"발달 관찰 2-3문장","advice":"조언 2-4문장"}`;

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
          responseMimeType: "application/json"
        }
      })
    }
  );
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  res.json({ content: [{ type: 'text', text }] });
}
