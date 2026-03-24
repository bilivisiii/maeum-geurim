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
  "figureExpression": { "humanFigure": "인물표현 분석", "relationships": "관계 분석", "detail
