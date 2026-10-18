import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint to generate custom Physics Refraction Exercises
app.post('/api/generate-exercise', async (req, res) => {
  try {
    const { level = 'van_dung', topic = 'goc_khuc_xa', lang = 'vi' } = req.body;

    const levelDescriptions: Record<string, string> = {
      nhan_biet: 'Nhận biết (Bloom Level 1 - Identification & Basic Concepts): Nhận biết hiện tượng, tia tới SI, điểm tới I, pháp tuyến NN\', góc tới i, góc khúc xạ r, mặt phẳng tới.',
      thong_hieu: 'Thông hiểu (Bloom Level 2 - Comprehension & Comparison): So sánh góc i và góc r khi n1 < n2 hoặc n1 > n2, giải thích tại sao tia sáng bị đổi hướng, tỉ số sin i / sin r, tính chất môi trường chiết quang.',
      van_dung: 'Vận dụng (Bloom Level 3 - Application & Calculation): Tính toán góc khúc xạ r hoặc chiết suất n2 từ công thức n1 * sin(i) = n2 * sin(r), đổi đơn vị, tính góc lệch của tia sáng.',
      van_dung_cao: 'Vận dụng cao (Bloom Level 4 - Advanced & Real-world phenomena): Hiện tượng phản xạ toàn phần (góc giới hạn i_gh = arcsin(n2/n1)), ảo ảnh trên sa mạc/đường nhựa, độ sâu biểu kiến của đáy bể nước/con cá dưới nước, cáp sợi quang.',
    };

    const targetDesc = levelDescriptions[level] || levelDescriptions['van_dung'];

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
      return res.status(500).json({ error: 'Empty response from Gemini API' });
    }

    const parsed = JSON.parse(text);
    return res.json({ success: true, exercise: parsed });
  } catch (err: any) {
    console.error('Gemini exercise generation error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate exercise with AI',
      fallbackRecommended: true,
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
