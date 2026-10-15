import { Matrix, MatrixCell, Question, QualityInspectionReport, GradeLevel, TermPeriod } from '../types';
import { generateFallbackMatrixCells, generateFallbackQuestions, runQualityInspection } from './aiFallbackGenerator';

export async function requestAiMatrixSuggestion(params: {
  grade: GradeLevel;
  subject: string;
  period: TermPeriod;
  textbook: string;
  syllabusContent?: string;
}): Promise<MatrixCell[]> {
  try {
    const res = await fetch('/api/ai/suggest-matrix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.cells) && data.cells.length > 0) {
        return data.cells;
      }
    }
  } catch (err) {
    console.warn('Network call to suggest-matrix failed, using local pedagogical engine:', err);
  }

  // Graceful client fallback
  return generateFallbackMatrixCells(params.grade, params.subject, params.period);
}

export async function requestAiExamGeneration(matrix: Matrix): Promise<Question[]> {
  try {
    const res = await fetch('/api/ai/generate-exam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matrix }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
    }
  } catch (err) {
    console.warn('Network call to generate-exam failed, using local pedagogical engine:', err);
  }

  return generateFallbackQuestions(matrix.cells, matrix.grade, matrix.subject);
}

export async function requestAiQuestionReplacement(params: {
  currentQuestion: Question;
  grade: GradeLevel;
  subject: string;
}): Promise<Question> {
  try {
    const res = await fetch('/api/ai/replace-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.question) {
        return data.question;
      }
    }
  } catch (err) {
    console.warn('Network call to replace-question failed, using local variation:', err);
  }

  return {
    ...params.currentQuestion,
    id: `q_${Date.now()}_rep`,
    content: `[Biến thể thay thế Mức ${params.currentQuestion.level}] ${params.currentQuestion.content} (Đổi dữ liệu số hoặc tình huống)`,
  };
}

export async function requestAiQualityAudit(params: {
  examQuestions: Question[];
  grade: GradeLevel;
  subject: string;
}): Promise<QualityInspectionReport> {
  try {
    const res = await fetch('/api/ai/inspect-quality', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.report) {
        return data.report;
      }
    }
  } catch (err) {
    console.warn('Network call to inspect-quality failed, using local inspection engine:', err);
  }

  return runQualityInspection(params.examQuestions, params.grade, params.subject);
}
