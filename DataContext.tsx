import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Matrix,
  Exam,
  Question,
  SchoolSettings,
  AuditLog,
  ReviewComment,
  QualityInspectionReport,
  ExamVariant,
} from '../types';
import {
  SEED_MATRICES,
  SEED_EXAMS,
  DEFAULT_SCHOOL_SETTINGS,
} from '../data/curriculumData';
import { SEED_QUESTION_BANK } from '../data/questionBankSeed';

interface DataContextType {
  schoolSettings: SchoolSettings;
  updateSchoolSettings: (settings: Partial<SchoolSettings>) => void;
  matrices: Matrix[];
  getMatrixById: (id: string) => Matrix | undefined;
  saveMatrix: (matrix: Matrix) => void;
  deleteMatrix: (id: string) => void;
  confirmMatrix: (id: string, reviewerName?: string) => void;
  exams: Exam[];
  getExamById: (id: string) => Exam | undefined;
  saveExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  replaceExamQuestion: (examId: string, questionId: string, newQuestion: Question) => void;
  toggleLockQuestion: (examId: string, questionId: string) => void;
  updateExamQuestionsOrder: (examId: string, newQuestions: Question[]) => void;
  generateVariants: (examId: string) => void;
  attachQualityReport: (examId: string, report: QualityInspectionReport) => void;
  submitForReview: (type: 'matrix' | 'exam', id: string) => void;
  addReviewComment: (comment: Omit<ReviewComment, 'id' | 'createdAt'>) => void;
  reviewComments: ReviewComment[];
  getReviewCommentsFor: (targetId: string) => ReviewComment[];
  questionBank: Question[];
  saveQuestionToBank: (question: Question) => void;
  deleteQuestionFromBank: (id: string) => void;
  auditLogs: AuditLog[];
  logAction: (action: string, target: string, targetType: AuditLog['targetType'], details?: string) => void;
  resetToSampleData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'edu_settings',
  MATRICES: 'edu_matrices',
  EXAMS: 'edu_exams',
  QUESTION_BANK: 'edu_question_bank',
  REVIEWS: 'edu_reviews',
  AUDIT_LOGS: 'edu_audit_logs',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_SETTINGS;
  });

  // Matrices
  const [matrices, setMatrices] = useState<Matrix[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATRICES);
    return saved ? JSON.parse(saved) : SEED_MATRICES;
  });

  // Exams
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return saved ? JSON.parse(saved) : SEED_EXAMS;
  });

  // Question bank
  const [questionBank, setQuestionBank] = useState<Question[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTION_BANK);
    return saved ? JSON.parse(saved) : SEED_QUESTION_BANK;
  });

  // Reviews
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'rev_1',
        targetId: 'mat_toan_4_ghk1',
        targetType: 'matrix',
        authorId: 'user_dept_head',
        authorName: 'Lê Hoàng Anh',
        authorRole: 'dept_head',
        content: 'Ma trận bám sát yêu cầu cần đạt của Thông tư 27. Phân bố 40% Mức 1 - 30% Mức 2 - 30% Mức 3 rất chuẩn.',
        action: 'approve',
        createdAt: '2024-10-12T16:00:00Z',
      },
      {
        id: 'rev_2',
        targetId: 'exam_toan_4_ghk1_01',
        targetType: 'exam',
        authorId: 'user_principal',
        authorName: 'Trần Thị Thu Hiệu',
        authorRole: 'principal',
        content: 'Đề thi đảm bảo tính phân hóa, câu 9 vận dụng tốt. Duyệt cho in và phát hành.',
        action: 'publish',
        createdAt: '2024-10-13T09:00:00Z',
      },
    ];
  });

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : [
      {
        id: 'log_1',
        userId: 'user_teacher',
        userName: 'Phạm Thu Hà',
        userRole: 'teacher',
        action: 'Tạo ma trận kiểm tra',
        target: 'MT-TOAN4-GHK1-01',
        targetType: 'matrix',
        timestamp: '2024-10-10T08:00:00Z',
        details: 'Khởi tạo ma trận Toán 4 Giữa HKI',
      },
      {
        id: 'log_2',
        userId: 'user_dept_head',
        userName: 'Lê Hoàng Anh',
        userRole: 'dept_head',
        action: 'Phê duyệt ma trận',
        target: 'MT-TOAN4-GHK1-01',
        targetType: 'matrix',
        timestamp: '2024-10-12T16:00:00Z',
        details: 'Xác nhận đạt chuẩn chuyên môn Thông tư 27',
      },
      {
        id: 'log_3',
        userId: 'user_principal',
        userName: 'Trần Thị Thu Hiệu',
        userRole: 'principal',
        action: 'Phê duyệt & phát hành đề thi',
        target: 'DE-TOAN4-GHK1-101',
        targetType: 'exam',
        timestamp: '2024-10-13T09:00:00Z',
        details: 'Phê duyệt phát hành đề kiểm tra chính thức',
      },
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(schoolSettings));
  }, [schoolSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATRICES, JSON.stringify(matrices));
  }, [matrices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTION_BANK, JSON.stringify(questionBank));
  }, [questionBank]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviewComments));
  }, [reviewComments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Methods
  const updateSchoolSettings = (newSettings: Partial<SchoolSettings>) => {
    setSchoolSettings((prev) => ({ ...prev, ...newSettings }));
    logAction('Cập nhật cấu hình trường', 'Cài đặt hệ thống', 'system');
  };

  const logAction = (
    action: string,
    target: string,
    targetType: AuditLog['targetType'],
    details?: string
  ) => {
    const savedUser = localStorage.getItem('edu_matrix_user_id') || 'user_teacher';
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: savedUser,
      userName: savedUser === 'user_admin' ? 'Nguyễn Văn Quản' : savedUser === 'user_principal' ? 'Trần Thị Thu Hiệu' : savedUser === 'user_dept_head' ? 'Lê Hoàng Anh' : 'Phạm Thu Hà',
      userRole: savedUser === 'user_admin' ? 'admin' : savedUser === 'user_principal' ? 'principal' : savedUser === 'user_dept_head' ? 'dept_head' : 'teacher',
      action,
      target,
      targetType,
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]);
  };

  const getMatrixById = (id: string) => matrices.find((m) => m.id === id);

  const saveMatrix = (matrix: Matrix) => {
    setMatrices((prev) => {
      const idx = prev.findIndex((m) => m.id === matrix.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...matrix, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [matrix, ...prev];
    });
    logAction('Lưu ma trận', matrix.code, 'matrix', `Lớp ${matrix.grade} - Môn ${matrix.subject}`);
  };

  const deleteMatrix = (id: string) => {
    const m = matrices.find((item) => item.id === id);
    setMatrices((prev) => prev.filter((item) => item.id !== id));
    if (m) logAction('Xóa ma trận', m.code, 'matrix');
  };

  const confirmMatrix = (id: string, reviewerName = 'Tổ trưởng Chuyên môn') => {
    setMatrices((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            status: 'approved',
            approvedBy: reviewerName,
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      })
    );
    const m = matrices.find((item) => item.id === id);
    if (m) logAction('Xác nhận ma trận', m.code, 'matrix', `Phê duyệt bởi ${reviewerName}`);
  };

  const getExamById = (id: string) => exams.find((e) => e.id === id);

  const saveExam = (exam: Exam) => {
    setExams((prev) => {
      const idx = prev.findIndex((e) => e.id === exam.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...exam, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [exam, ...prev];
    });
    logAction('Lưu đề kiểm tra', exam.code, 'exam', `Môn ${exam.subject} - Lớp ${exam.grade}`);
  };

  const deleteExam = (id: string) => {
    const e = exams.find((item) => item.id === id);
    setExams((prev) => prev.filter((item) => item.id !== id));
    if (e) logAction('Xóa đề kiểm tra', e.code, 'exam');
  };

  const replaceExamQuestion = (examId: string, questionId: string, newQuestion: Question) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const updatedQuestions = e.questions.map((q) => (q.id === questionId ? newQuestion : q));
          return { ...e, questions: updatedQuestions, updatedAt: new Date().toISOString() };
        }
        return e;
      })
    );
    logAction('Thay đổi câu hỏi', questionId, 'exam', `Trong đề ${examId}`);
  };

  const toggleLockQuestion = (examId: string, questionId: string) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const updatedQuestions = e.questions.map((q) =>
            q.id === questionId ? { ...q, isLocked: !q.isLocked } : q
          );
          return { ...e, questions: updatedQuestions };
        }
        return e;
      })
    );
  };

  const updateExamQuestionsOrder = (examId: string, newQuestions: Question[]) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          return { ...e, questions: newQuestions, updatedAt: new Date().toISOString() };
        }
        return e;
      })
    );
  };

  const generateVariants = (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;

    // Generate variants B, C, D by shuffling MC question order and option orders without affecting points, cells, or answer keys
    const createVariant = (code: 'B' | 'C' | 'D'): ExamVariant => {
      // Keep essay questions in chronological order at end, shuffle MC questions slightly
      const mcQs = exam.questions.filter((q) => q.type === 'multiple_choice');
      const otherQs = exam.questions.filter((q) => q.type !== 'multiple_choice');

      // Controlled shuffle
      const shuffledMc = [...mcQs].sort(() => 0.5 - Math.random());

      // Shuffle options of MC and update correctAnswer
      const newMcQuestions: Question[] = shuffledMc.map((q, idx) => {
        if (!q.options || q.options.length === 0) return { ...q, code: `Câu ${idx + 1}` };

        const originalCorrectOption = q.options.find((o) => o.key === q.correctAnswer);
        const correctText = originalCorrectOption ? originalCorrectOption.text : '';

        // Shuffle options text
        const shuffledOptionsText = [...q.options.map((o) => o.text)].sort(() => 0.5 - Math.random());
        const keys: ('A' | 'B' | 'C' | 'D' | 'E')[] = ['A', 'B', 'C', 'D', 'E'];

        const newOptions = shuffledOptionsText.map((text, optIdx) => ({
          key: keys[optIdx],
          text,
          isCorrect: text === correctText,
        }));

        const newCorrectKey = newOptions.find((o) => o.isCorrect)?.key || 'A';

        return {
          ...q,
          id: `${q.id}_var_${code}`,
          code: `Câu ${idx + 1}`,
          options: newOptions,
          correctAnswer: newCorrectKey,
          rubric: `Khoanh vào ${newCorrectKey}. Cho ${q.points} điểm.`,
        };
      });

      const newOtherQuestions: Question[] = otherQs.map((q, idx) => ({
        ...q,
        id: `${q.id}_var_${code}`,
        code: `Câu ${newMcQuestions.length + idx + 1}`,
      }));

      return {
        variantCode: code,
        questions: [...newMcQuestions, ...newOtherQuestions],
      };
    };

    const variants: ExamVariant[] = [
      { variantCode: 'A', questions: exam.questions },
      createVariant('B'),
      createVariant('C'),
      createVariant('D'),
    ];

    setExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          return { ...e, variants, updatedAt: new Date().toISOString() };
        }
        return e;
      })
    );
    logAction('Sinh 4 mã đề tương đương (A, B, C, D)', exam.code, 'exam');
  };

  const attachQualityReport = (examId: string, report: QualityInspectionReport) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          return { ...e, qualityReport: report, updatedAt: new Date().toISOString() };
        }
        return e;
      })
    );
    logAction('Kiểm tra chất lượng AI', examId, 'exam', `Điểm đạt: ${report.score}/100`);
  };

  const submitForReview = (type: 'matrix' | 'exam', id: string) => {
    if (type === 'matrix') {
      setMatrices((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: 'pending_approval' } : m))
      );
      logAction('Gửi duyệt ma trận', id, 'matrix');
    } else {
      setExams((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'pending_approval' } : e))
      );
      logAction('Gửi duyệt đề kiểm tra', id, 'exam');
    }
  };

  const addReviewComment = (commentData: Omit<ReviewComment, 'id' | 'createdAt'>) => {
    const newComment: ReviewComment = {
      ...commentData,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setReviewComments((prev) => [newComment, ...prev]);

    // Update target status based on review action
    if (commentData.targetType === 'matrix') {
      setMatrices((prev) =>
        prev.map((m) => {
          if (m.id === commentData.targetId) {
            let nextStatus: Matrix['status'] = m.status;
            if (commentData.action === 'approve') nextStatus = 'approved';
            else if (commentData.action === 'reject') nextStatus = 'revision_needed';
            return {
              ...m,
              status: nextStatus,
              approvedBy: commentData.authorName,
              approvalComment: commentData.content,
              approvedAt: commentData.action === 'approve' ? new Date().toISOString() : m.approvedAt,
            };
          }
          return m;
        })
      );
    } else {
      setExams((prev) =>
        prev.map((e) => {
          if (e.id === commentData.targetId) {
            let nextStatus: Exam['status'] = e.status;
            if (commentData.action === 'approve') nextStatus = 'approved';
            else if (commentData.action === 'reject') nextStatus = 'revision_needed';
            else if (commentData.action === 'publish') nextStatus = 'published';
            return {
              ...e,
              status: nextStatus,
              approvedBy: commentData.authorName,
              approvalComment: commentData.content,
              approvedAt: ['approve', 'publish'].includes(commentData.action) ? new Date().toISOString() : e.approvedAt,
              publishedAt: commentData.action === 'publish' ? new Date().toISOString() : e.publishedAt,
            };
          }
          return e;
        })
      );
    }
    logAction(
      commentData.action === 'approve' ? 'Phê duyệt' : commentData.action === 'publish' ? 'Phát hành' : 'Yêu cầu sửa',
      commentData.targetId,
      commentData.targetType,
      commentData.content
    );
  };

  const getReviewCommentsFor = (targetId: string) => {
    return reviewComments.filter((c) => c.targetId === targetId);
  };

  const saveQuestionToBank = (q: Question) => {
    setQuestionBank((prev) => {
      const idx = prev.findIndex((item) => item.id === q.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = q;
        return updated;
      }
      return [q, ...prev];
    });
    logAction('Lưu câu hỏi vào ngân hàng', q.code, 'question_bank');
  };

  const deleteQuestionFromBank = (id: string) => {
    setQuestionBank((prev) => prev.filter((item) => item.id !== id));
    logAction('Xóa câu hỏi khỏi ngân hàng', id, 'question_bank');
  };

  const resetToSampleData = () => {
    setSchoolSettings(DEFAULT_SCHOOL_SETTINGS);
    setMatrices(SEED_MATRICES);
    setExams(SEED_EXAMS);
    setQuestionBank(SEED_QUESTION_BANK);
    localStorage.clear();
  };

  return (
    <DataContext.Provider
      value={{
        schoolSettings,
        updateSchoolSettings,
        matrices,
        getMatrixById,
        saveMatrix,
        deleteMatrix,
        confirmMatrix,
        exams,
        getExamById,
        saveExam,
        deleteExam,
        replaceExamQuestion,
        toggleLockQuestion,
        updateExamQuestionsOrder,
        generateVariants,
        attachQualityReport,
        submitForReview,
        addReviewComment,
        reviewComments,
        getReviewCommentsFor,
        questionBank,
        saveQuestionToBank,
        deleteQuestionFromBank,
        auditLogs,
        logAction,
        resetToSampleData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
