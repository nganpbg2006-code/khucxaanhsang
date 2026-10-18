import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { level = 'van_dung', topic = 'goc_khuc_xa', lang = 'vi' } = req.body || {};

    const levelDescriptions: Record<string, string> = {
      nhan_biet: 'Nhận biết (Bloom Level 1 - Identification & Basic Concepts): Nhận biết hiện tượng, tia tới SI, điểm tới I, pháp tuyến NN\', góc tới i, góc khúc xạ r, mặt phẳng tới.',
      thong_hieu: 'Thông hiểu (Bloom Level 2 - Comprehension & Comparison): So sánh góc i và góc r khi n1 < n2 hoặc n1 > n2, giải thích tại sao tia sáng bị đổi hướng, tỉ số sin i / sin r, tính chất môi trường chiết quang.',
      van_dung: 'Vận dụng (Bloom Level 3 - Application & Calculation): Tính toán góc khúc xạ r hoặc chiết suất n2 từ công thức n1 * sin(i) = n2 * sin(r), đổi đơn vị, tính góc lệch của tia sáng.',
      van_dung_cao: 'Vận dụng cao (Bloom Level 4 - Advanced & Real-world phenomena): Hiện tượng phản xạ toàn phần (góc giới hạn i_gh = arcsin(n2/n1)), ảo ảnh trên sa mạc/đường nhựa, độ sâu biểu kiến của đáy bể nước/con cá dưới nước, cáp sợi quang.',
    };

    const targetDesc = levelDescriptions[level] || levelDescriptions['van_dung'];

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        error: 'API Key not configured',
        fallbackRecommended: true,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `Bạn là chuyên gia giáo dục Vật lý - KHTN 9 (Khoa học Tự nhiên lớp 9, Bài 5: Khúc xạ ánh sáng).
Hãy tạo 01 bài tập mới chất lượng cao, đúng chuẩn chương trình, kèm dữ liệu kiểm chứng và lời giải chi tiết.

YÊU CẦU:
- Cấp độ tư duy: ${targetDesc}
- Chủ đề trọng tâm: ${topic}
- Ngôn ngữ yêu cầu: ${lang === 'en' ? 'English' : 'Tiếng Việt'}
- Đi kèm các thông số vật lý chuẩn xác (n1, n2, góc i hoặc r, hoặc các môi trường cụ thể như Không khí n=1.0, Nước n=1.33, Thủy tinh n=1.5, Kim cương n=2.42).
- Các câu hỏi trắc nghiệm cần 4 đáp án (A, B, C, D) với 1 đáp án đúng duy nhất.

Hãy trả về định dạng JSON thuần theo schema đã định sẵn.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: 'Unique identifier' },
            level: { type: Type.STRING, description: 'nhan_biet | thong_hieu | van_dung | van_dung_cao' },
            title: { type: Type.STRING, description: 'Short catchy title for the problem' },
            question: { type: Type.STRING, description: 'The problem statement in markdown/text' },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of 4 options (A, B, C, D)',
            },
            correctAnswerIndex: {
              type: Type.INTEGER,
              description: 'Index of correct option (0, 1, 2, or 3)',
            },
            explanation: {
              type: Type.STRING,
              description: 'Step-by-step detailed solution with formulas and reasoning',
            },
            keyTakeaway: {
              type: Type.STRING,
              description: 'Brief rule or memory tip for the student',
            },
            simulationParams: {
              type: Type.OBJECT,
              properties: {
                n1: { type: Type.NUMBER, description: 'Refractive index of medium 1' },
                n2: { type: Type.NUMBER, description: 'Refractive index of medium 2' },
                incidentAngle: { type: Type.NUMBER, description: 'Angle of incidence in degrees (0-85)' },
                medium1Name: { type: Type.STRING, description: 'Name of medium 1' },
                medium2Name: { type: Type.STRING, description: 'Name of medium 2' },
              },
              required: ['n1', 'n2', 'incidentAngle'],
              description: 'Parameters to preload into simulation for student verification',
            },
          },
          required: [
            'title',
            'question',
            'options',
            'correctAnswerIndex',
            'explanation',
            'keyTakeaway',
            'simulationParams',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(200).json({
        success: false,
        error: 'Empty response from Gemini',
        fallbackRecommended: true,
      });
    }

    const parsed = JSON.parse(text);
    return res.status(200).json({ success: true, exercise: parsed });
  } catch (err: any) {
    console.error('Vercel API error:', err);
    return res.status(200).json({
      success: false,
      error: err.message || 'Failed to generate exercise with AI',
      fallbackRecommended: true,
    });
  }
}
