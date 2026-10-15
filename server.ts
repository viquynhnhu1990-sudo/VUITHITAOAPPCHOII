import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { generateFallbackMatrixCells, generateFallbackQuestions, runQualityInspection } from './src/services/aiFallbackGenerator.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent telemetry
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. API: Đề xuất ma trận kiểm tra
app.post('/api/ai/suggest-matrix', async (req: Request, res: Response) => {
  const { grade, subject, period, textbook, syllabusContent, customRatio } = req.body;

  try {
    if (ai && process.env.GEMINI_API_KEY) {
      const prompt = `Bạn là chuyên gia giáo dục tiểu học Việt Nam theo Chương trình GDPT 2018 và Thông tư 27/2020/TT-BGDĐT.
Hãy xây dựng ma trận đề kiểm tra định kỳ cho:
- Môn: ${subject}
- Khối lớp: ${grade}
- Thời điểm kiểm tra: ${period}
- Bộ sách giáo khoa: ${textbook || 'Kết Nối Tri Thức'}
- Tài liệu / Phạm vi trọng tâm: ${syllabusContent || 'Toàn bộ nội dung trọng tâm theo phân phối chương trình'}
- Tỷ lệ mong muốn: Mức 1 (~40%), Mức 2 (~30%), Mức 3 (~30%). Tổng điểm BẮT BUỘC bằng 10.0 điểm.
- Quy định Thông tư 27: Điểm số bài kiểm tra định kỳ là số nguyên, không có điểm thập phân ở tổng điểm (tổng phải đúng 10.0 điểm).
- 3 mức nhận thức: Mức 1 (Nhận biết/nhắc lại), Mức 2 (Kết nối/sắp xếp tương tự), Mức 3 (Vận dụng giải quyết vấn đề mới).

Trả về định dạng JSON thuần túy (không kèm markdown ngoài) theo cấu trúc:
{
  "cells": [
    {
      "topicName": "Tên chủ đề hoặc mạch kiến thức",
      "outcome": "Yêu cầu cần đạt chuẩn GDPT 2018",
      "sourceRef": "Bài học / SGK tương ứng",
      "level1Count": 2,
      "level1Points": 2.0,
      "level1Type": "multiple_choice",
      "level2Count": 1,
      "level2Points": 1.0,
      "level2Type": "multiple_choice",
      "level3Count": 1,
      "level3Points": 1.5,
      "level3Type": "essay"
    }
  ]
}
Yêu cầu bắt buộc: Tổng điểm của tất cả các cell phải đúng bằng 10.0 điểm.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.cells && Array.isArray(parsed.cells)) {
          // Format cells with ids and totals
          const formattedCells = parsed.cells.map((c: any, idx: number) => {
            const l1Pts = Number(c.level1Points) || 0;
            const l2Pts = Number(c.level2Points) || 0;
            const l3Pts = Number(c.level3Points) || 0;
            const l1Count = Number(c.level1Count) || 0;
            const l2Count = Number(c.level2Count) || 0;
            const l3Count = Number(c.level3Count) || 0;
            return {
              id: `cell_${Date.now()}_${idx + 1}`,
              topicId: `topic_${idx + 1}`,
              topicName: c.topicName || `Chủ đề ${idx + 1}`,
              outcome: c.outcome || 'Đạt chuẩn kiến thức kỹ năng môn học',
              sourceRef: c.sourceRef || `SGK ${subject} ${grade}`,
              level1Count: l1Count,
              level1Points: l1Pts,
              level1Type: c.level1Type || 'multiple_choice',
              level2Count: l2Count,
              level2Points: l2Pts,
              level2Type: c.level2Type || 'multiple_choice',
              level3Count: l3Count,
              level3Points: l3Pts,
              level3Type: c.level3Type || 'essay',
              totalQuestions: l1Count + l2Count + l3Count,
              totalPoints: Math.round((l1Pts + l2Pts + l3Pts) * 10) / 10,
            };
          });

          // Check if total points equals 10, adjust slightly if rounding difference
          const currentSum = formattedCells.reduce((s: number, c: any) => s + c.totalPoints, 0);
          if (Math.abs(currentSum - 10) > 0.01 && formattedCells.length > 0) {
            const diff = 10 - currentSum;
            formattedCells[0].totalPoints = Math.round((formattedCells[0].totalPoints + diff) * 10) / 10;
            formattedCells[0].level1Points = Math.round((formattedCells[0].level1Points + diff) * 10) / 10;
          }

          return res.json({ success: true, cells: formattedCells, source: 'gemini' });
        }
      }
    }
  } catch (err) {
    console.warn('Gemini generateContent error for matrix suggestion, falling back:', err);
  }

  // Pedagogical fallback
  const fallbackCells = generateFallbackMatrixCells(grade, subject, period);
  return res.json({ success: true, cells: fallbackCells, source: 'fallback' });
});

// 2. API: Sinh đề kiểm tra từ ma trận
app.post('/api/ai/generate-exam', async (req: Request, res: Response) => {
  const { matrix } = req.body;
  if (!matrix || !matrix.cells) {
    return res.status(400).json({ error: 'Ma trận không hợp lệ' });
  }

  try {
    if (ai && process.env.GEMINI_API_KEY) {
      const prompt = `Bạn là chuyên gia ra đề kiểm tra tiểu học theo Chương trình GDPT 2018 và Thông tư 27/2020/TT-BGDĐT.
Hãy tạo câu hỏi chi tiết, đáp án và hướng dẫn chấm cho đề kiểm tra môn ${matrix.subject} Lớp ${matrix.grade} theo ma trận sau:
${JSON.stringify(
  matrix.cells.map((c: any) => ({
    topic: c.topicName,
    outcome: c.outcome,
    m1: `${c.level1Count} câu (${c.level1Points}đ, dạng ${c.level1Type})`,
    m2: `${c.level2Count} câu (${c.level2Points}đ, dạng ${c.level2Type})`,
    m3: `${c.level3Count} câu (${c.level3Points}đ, dạng ${c.level3Type})`,
  }))
)}

Quy định bắt buộc:
1. Mỗi câu trắc nghiệm (multiple_choice) có đúng 4 phương án A, B, C, D và chỉ duy nhất 1 đáp án đúng.
2. Không hỏi mẹo, không dùng ngôn ngữ vượt quá lứa tuổi tiểu học.
3. Mỗi câu tự luận (essay/short_answer) phải có hướng dẫn chấm (rubric) chi tiết theo barem điểm từng ý (0.25đ / 0.5đ).
4. Tổng điểm toàn bài phải đúng bằng 10.0 điểm.

Trả về định dạng JSON thuần túy (không markdown bao bọc):
{
  "questions": [
    {
      "matrixCellId": "chuỗi",
      "code": "Câu 1",
      "topic": "Chủ đề",
      "outcome": "Yêu cầu cần đạt",
      "level": 1,
      "type": "multiple_choice",
      "content": "Nội dung câu hỏi...",
      "options": [
        {"key": "A", "text": "Phương án A", "isCorrect": true},
        {"key": "B", "text": "Phương án B", "isCorrect": false},
        {"key": "C", "text": "Phương án C", "isCorrect": false},
        {"key": "D", "text": "Phương án D", "isCorrect": false}
      ],
      "correctAnswer": "A",
      "rubric": "Khoanh đúng A được 1.0 điểm",
      "points": 1.0
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        if (parsed.questions && Array.isArray(parsed.questions)) {
          const formattedQuestions = parsed.questions.map((q: any, i: number) => ({
            ...q,
            id: `q_${Date.now()}_${i + 1}`,
            code: `Câu ${i + 1}`,
            subject: matrix.subject,
            grade: matrix.grade,
            reviewStatus: 'verified',
            points: Number(q.points) || 1.0,
          }));
          return res.json({ success: true, questions: formattedQuestions, source: 'gemini' });
        }
      }
    }
  } catch (err) {
    console.warn('Gemini generateContent error for exam generation, using fallback:', err);
  }

  const fallbackQuestions = generateFallbackQuestions(matrix.cells, matrix.grade, matrix.subject);
  return res.json({ success: true, questions: fallbackQuestions, source: 'fallback' });
});

// 3. API: Thay thế một câu hỏi tương đương bảo toàn ma trận
app.post('/api/ai/replace-question', async (req: Request, res: Response) => {
  const { currentQuestion, grade, subject } = req.body;
  if (!currentQuestion) {
    return res.status(400).json({ error: 'Thiếu câu hỏi cần thay' });
  }

  try {
    if (ai && process.env.GEMINI_API_KEY) {
      const prompt = `Hãy tạo một câu hỏi mới TƯƠNG ĐƯƠNG để thay thế cho câu hỏi sau trong đề kiểm tra môn ${subject} Lớp ${grade}:
- Chủ đề: ${currentQuestion.topic}
- Yêu cầu cần đạt: ${currentQuestion.outcome}
- Mức độ nhận thức: Mức ${currentQuestion.level}
- Dạng câu: ${currentQuestion.type}
- Điểm số: ${currentQuestion.points} điểm
- Câu hỏi hiện tại (KHÔNG ĐƯỢC LẶP LẠI NỘI DUNG NÀY): "${currentQuestion.content}"

Yêu cầu:
1. Đảm bảo đúng mức ${currentQuestion.level}, bám sát chuẩn GDPT 2018.
2. Giữ nguyên điểm số ${currentQuestion.points} điểm.
3. Cung cấp đáp án và barem chấm rõ ràng.

Trả về JSON:
{
  "content": "Nội dung câu hỏi mới",
  "options": [
    {"key": "A", "text": "Phương án A", "isCorrect": true},
    {"key": "B", "text": "Phương án B", "isCorrect": false},
    {"key": "C", "text": "Phương án C", "isCorrect": false},
    {"key": "D", "text": "Phương án D", "isCorrect": false}
  ],
  "correctAnswer": "A",
  "rubric": "Hướng dẫn chấm chi tiết"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        const newQ = {
          ...currentQuestion,
          id: `q_${Date.now()}_rep`,
          content: parsed.content || `[Tương đương] ${currentQuestion.content}`,
          options: parsed.options || currentQuestion.options,
          correctAnswer: parsed.correctAnswer || currentQuestion.correctAnswer,
          rubric: parsed.rubric || currentQuestion.rubric,
          reviewStatus: 'verified',
        };
        return res.json({ success: true, question: newQ, source: 'gemini' });
      }
    }
  } catch (err) {
    console.warn('Gemini replace question error, using fallback variation:', err);
  }

  // Fallback variation
  const fallbackQ = {
    ...currentQuestion,
    id: `q_${Date.now()}_rep`,
    content: `[Biến thể tương đương Mức ${currentQuestion.level}] ` + currentQuestion.content.replace(/(\d+)/g, (match: string) => `${parseInt(match, 10) * 2}`),
  };
  return res.json({ success: true, question: fallbackQ, source: 'fallback' });
});

// 4. API: Kiểm tra chất lượng đề kiểm tra theo 20 tiêu chí
app.post('/api/ai/inspect-quality', async (req: Request, res: Response) => {
  const { examQuestions, grade, subject } = req.body;
  if (!examQuestions || !Array.isArray(examQuestions)) {
    return res.status(400).json({ error: 'Danh sách câu hỏi không hợp lệ' });
  }

  const report = runQualityInspection(examQuestions, grade, subject);
  return res.json({ success: true, report });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Full-stack Vite mounting
async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EDU TEST MATRIX AI Server running on port ${PORT}`);
  });
}

start();
