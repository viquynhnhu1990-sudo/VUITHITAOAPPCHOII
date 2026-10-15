export type UserRole = 'admin' | 'principal' | 'dept_head' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  gradeAssigned?: number; // 1, 2, 3, 4, 5
  avatar?: string;
  title: string; // e.g. "Giáo viên chủ nhiệm 4A1", "Tổ trưởng Chuyên môn Khối 4-5"
}

export type GradeLevel = 1 | 2 | 3 | 4 | 5;

export type TermPeriod = 'mid_term_1' | 'end_term_1' | 'mid_term_2' | 'end_term_2';

export interface SubjectRule {
  id: string;
  name: string;
  gradesAllowed: GradeLevel[];
  periodsAllowed: Record<GradeLevel, TermPeriod[]>;
  defaultDurationMin: number;
  requiresPracticalPart?: boolean;
  notes?: string;
}

export type CognitiveLevel = 1 | 2 | 3; // Mức 1: Nhận biết, Mức 2: Kết nối, Mức 3: Vận dụng

export type QuestionType =
  | 'multiple_choice' // Trắc nghiệm 1 lựa chọn
  | 'true_false'       // Đúng / Sai
  | 'matching'         // Nối tiếp / Ghép đôi
  | 'fill_blank'       // Điền vào chỗ trống
  | 'short_answer'     // Trả lời ngắn
  | 'essay'            // Tự luận
  | 'reading_comp'     // Đọc hiểu (Tiếng Việt)
  | 'writing_essay'    // Viết / Tập làm văn (Tiếng Việt)
  | 'practical_task';  // Nhiệm vụ thực hành (Tin học / Công nghệ)

export type MatrixStatus =
  | 'draft'               // Nháp
  | 'pending_approval'   // Chờ duyệt ma trận
  | 'revision_needed'    // Cần sửa ma trận
  | 'approved';           // Ma trận đã xác nhận

export type ExamStatus =
  | 'draft'               // Đang soạn đề
  | 'pending_approval'   // Chờ duyệt đề
  | 'revision_needed'    // Cần chỉnh sửa đề
  | 'approved'            // Đã phê duyệt
  | 'published'           // Đã phát hành
  | 'archived';           // Lưu trữ

export interface MatrixCell {
  id: string;
  topicId: string;
  topicName: string;
  outcome: string; // Yêu cầu cần đạt
  sourceRef?: string; // Nguồn SGK/Trang nếu có
  // Mức 1
  level1Count: number;
  level1Points: number;
  level1Type: QuestionType;
  // Mức 2
  level2Count: number;
  level2Points: number;
  level2Type: QuestionType;
  // Mức 3
  level3Count: number;
  level3Points: number;
  level3Type: QuestionType;
  // Subtotals
  totalQuestions: number;
  totalPoints: number;
  notes?: string;
}

export interface Matrix {
  id: string;
  code: string;
  title: string;
  schoolName: string;
  academicYear: string; // e.g. "2024-2025"
  term: 'HK1' | 'HK2';
  period: TermPeriod;
  grade: GradeLevel;
  className?: string; // Tùy chọn, ví dụ "Khối 4" hoặc "4A1"
  subject: string;
  textbook: string; // "Cánh Diều" | "Kết Nối Tri Thức" | "Chân Trời Sáng Tạo"
  creatorId: string;
  creatorName: string;
  department: string;
  durationMinutes: number;
  examForm: 'Tự luận kết hợp trắc nghiệm' | 'Trắc nghiệm khách quan' | 'Thực hành kết hợp lý thuyết' | 'Đọc và Viết';
  totalScore: number; // Must equal 10
  status: MatrixStatus;
  version: string; // "v1.0"
  cells: MatrixCell[];
  syllabusDocName?: string;
  syllabusContent?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvalComment?: string;
  approvedAt?: string;
}

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  matrixCellId: string;
  code: string; // e.g. "Q1", "Q2"
  subject: string;
  grade: GradeLevel;
  topic: string;
  outcome: string;
  level: CognitiveLevel; // 1, 2, 3
  type: QuestionType;
  content: string; // Câu hỏi
  options?: QuestionOption[];
  correctAnswer: string; // "A" or text or explanation
  rubric: string; // Lời giải / Hướng dẫn chấm
  points: number;
  sourceDoc?: string;
  isLocked?: boolean; // Khóa câu hỏi để không bị đổi khi tái sinh
  reviewStatus: 'draft' | 'verified' | 'flagged';
  imageUrl?: string;
}

export interface ExamVariant {
  variantCode: 'A' | 'B' | 'C' | 'D'; // Mã đề A, B, C, D hoặc 101, 102...
  questions: Question[];
}

export interface Exam {
  id: string;
  code: string; // e.g. "DE-TOAN-L4-GHK1-01"
  title: string;
  matrixId: string;
  matrixCode: string;
  schoolName: string;
  academicYear: string;
  term: 'HK1' | 'HK2';
  period: TermPeriod;
  grade: GradeLevel;
  subject: string;
  textbook: string;
  durationMinutes: number;
  creatorId: string;
  creatorName: string;
  department: string;
  status: ExamStatus;
  version: string;
  questions: Question[]; // Default variant A
  variants: ExamVariant[];
  qualityReport?: QualityInspectionReport;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvalComment?: string;
  approvedAt?: string;
  publishedAt?: string;
}

export interface QualityCheckItem {
  id: number;
  title: string;
  category: 'legal' | 'pedagogical' | 'content' | 'presentation';
  status: 'passed' | 'warning' | 'critical' | 'unverifiable';
  message: string;
  detail?: string;
}

export interface QualityInspectionReport {
  id: string;
  examId: string;
  inspectedAt: string;
  inspector: 'AI Hệ Thống (Gemini 3.8)' | 'Tổ Chuyên Môn';
  score: number; // 0-100
  passedCount: number;
  warningCount: number;
  criticalCount: number;
  unverifiableCount: number;
  items: QualityCheckItem[];
  summary: string;
  canProceedToApproval: boolean;
}

export interface ReviewComment {
  id: string;
  targetId: string; // matrixId or examId
  targetType: 'matrix' | 'exam';
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  action: 'approve' | 'reject' | 'comment' | 'publish';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target: string;
  targetType: 'matrix' | 'exam' | 'system' | 'question_bank';
  timestamp: string;
  ipAddress?: string;
  details?: string;
}

export interface SchoolSettings {
  schoolName: string;
  governingBody: string; // e.g. "PHÒNG GIÁO DỤC VÀ ĐÀO TẠO QUẬN BA ĐÌNH"
  address: string;
  principalName: string;
  academicYear: string;
  currentTerm: 'HK1' | 'HK2';
  logoUrl?: string;
  allowCustomDecimals: boolean; // Always false by default per TT27
  strictTT27Enforcement: boolean;
  departments: { id: string; name: string; headTeacher: string }[];
}
