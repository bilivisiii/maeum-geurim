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

  const prompt = `당신은 아동 미술 심리 전문가입니다. 아래 어린이 그림을 분석하여 JSON만 출력하세요. 마크다운 코드블록(\`\`\`), 설명, 기타 텍스트 없이 순수 JSON만 출력하세요.

${childInfo ? `[아이 정보]\n${childInfo}\n` : ''}

출력 형식 (각 항목을 실제 그림 기반으로 구체적이고 전문적으로 2~3문장씩 작성):
{
  "overallEmotion": { "emoji": "😊", "title": "전반적 심리 상태", "description": "설명 3문장" },
  "composition": { "spaceUsage": "공간활용 분석 2~3문장", "placement": "배치 분석 2~3문장", "balance": "균형감 분석 2~3문장" },
  "lineAndPressure": { "lineQuality": "선 분석 2~3문장", "pressure": "필압 분석 2~3문장", "controlLevel": "제어수준 분석 2~3문장" },
  "colorAnalysis": { "dominantColors": "주요색상 분석 2~3문장", "colorVariety": "다양성 분석 2~3문장", "colorHarmony": "조화 분석 2~3문장" },
  "figureExpression": { "humanFigure": "인물표현 분석 2~3문장", "relationships": "관계 분석 2~3문장", "details": "세부묘사 분석 2~3문장" },
  "emotionalIndicators": { "scores": [
    {"label": "정서 안정감", "score": 75, "color": "#4AADA8", "comment": "점수 근거 한 문장"},
    {"label": "자아 표현력", "score": 80, "color
