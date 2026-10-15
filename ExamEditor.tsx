import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  Edit3,
  CheckCircle2,
  FileDown,
  Printer,
  ShieldCheck,
  Send,
  Layers,
  ChevronRight,
  AlertCircle,
  FileText,
  Eye,
  Archive,
  Copy,
  Plus,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Matrix, Exam, Question, ExamVariant } from '../../types';
import { PERIOD_NAMES } from '../../data/curriculumData';
import {
  requestAiExamGeneration,
  requestAiQuestionReplacement,
  requestAiQualityAudit,
} from '../../services/aiService';
import {
  exportExamDocx,
  exportAnswerKeyDocx,
  exportFullDossierZip,
} from '../../utils/exportUtils';
import { QualityInspectorModal } from './QualityInspectorModal';

interface ExamEditorProps {
  initialMatrixId?: string;
  initialExamId?: string;
  onNavigateToReviews?: () => void;
}

export const ExamEditor: React.FC<ExamEditorProps> = ({
  initialMatrixId,
  initialExamId,
  onNavigateToReviews,
}) => {
  const {
    matrices,
    exams,
    saveExam,
    replaceExamQuestion,
    toggleLockQuestion,
    generateVariants,
    attachQualityReport,
    submitForReview,
  } = useData();
  const { currentUser } = useAuth();

  // Find matrix
  const approvedMatrices = matrices.filter((m) => m.status === 'approved');
  const [selectedMatrixId, setSelectedMatrixId] = useState<string>(
    initialMatrixId || approvedMatrices[0]?.id || matrices[0]?.id || ''
  );

  const selectedMatrix = matrices.find((m) => m.id === selectedMatrixId);

  // Active exam being edited
  const [currentExam, setCurrentExam] = useState<Exam | null>(() => {
    if (initialExamId) {
      const found = exams.find((e) => e.id === initialExamId);
      if (found) return found;
    }
    return exams[0] || null;
  });

  // Selected variant view (A, B, C, D)
  const [activeVariantCode, setActiveVariantCode] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [replacingQId, setReplacingQId] = useState<string | null>(null);

  // Inspector modal
  const [showInspector, setShowInspector] = useState(false);

  // Editing single question inline
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Print mode preview toggle
  const [showStudentPreview, setShowStudentPreview] = useState(false);

  // If initialExamId changes, sync
  useEffect(() => {
    if (initialExamId) {
      const found = exams.find((e) => e.id === initialExamId);
      if (found) {
        setCurrentExam(found);
        setSelectedMatrixId(found.matrixId);
      }
    }
  }, [initialExamId, exams]);

  // Generate new exam from selected confirmed matrix
  const handleGenerateExamFromMatrix = async () => {
    if (!selectedMatrix) {
      alert('Vui lòng chọn một ma trận kiểm tra đã xác nhận.');
      return;
    }

    if (selectedMatrix.status !== 'approved') {
      const proceed = window.confirm(
        'Ma trận này chưa được xác nhận chính thức. Bạn có chắc chắn muốn sinh đề thử nghiệm?'
      );
      if (!proceed) return;
    }

    setIsGenerating(true);
    try {
      const generatedQuestions = await requestAiExamGeneration(selectedMatrix);

      const newExam: Exam = {
        id: `exam_${Date.now()}`,
        code: `DE-${selectedMatrix.subject.toUpperCase().slice(0, 4)}-L${selectedMatrix.grade}-${selectedMatrix.period.toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
        title: `Đề kiểm tra định kỳ môn ${selectedMatrix.subject} Lớp ${selectedMatrix.grade} - ${PERIOD_NAMES[selectedMatrix.period]}`,
        matrixId: selectedMatrix.id,
        matrixCode: selectedMatrix.code,
        schoolName: selectedMatrix.schoolName,
        academicYear: selectedMatrix.academicYear,
        term: selectedMatrix.term,
        period: selectedMatrix.period,
        grade: selectedMatrix.grade,
        subject: selectedMatrix.subject,
        textbook: selectedMatrix.textbook,
        durationMinutes: selectedMatrix.durationMinutes,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        department: selectedMatrix.department,
        status: 'draft',
        version: 'v1.0',
        questions: generatedQuestions,
        variants: [{ variantCode: 'A', questions: generatedQuestions }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveExam(newExam);
      setCurrentExam(newExam);
      setActiveVariantCode('A');
    } finally {
      setIsGenerating(false);
    }
  };

  // Replace single question
  const handleReplaceQuestion = async (q: Question) => {
    if (q.isLocked) {
      alert('Câu hỏi này đang bị khóa. Vui lòng mở khóa trước khi thay thế.');
      return;
    }

    if (!currentExam) return;

    setReplacingQId(q.id);
    try {
      const newQuestion = await requestAiQuestionReplacement({
        currentQuestion: q,
        grade: currentExam.grade,
        subject: currentExam.subject,
      });

      replaceExamQuestion(currentExam.id, q.id, newQuestion);

      // Update local state
      setCurrentExam((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          questions: prev.questions.map((item) => (item.id === q.id ? newQuestion : item)),
        };
      });
    } finally {
      setReplacingQId(null);
    }
  };

  // Run AI Quality Audit
  const handleRunQualityAudit = async () => {
    if (!currentExam) return;
    setIsGenerating(true);
    try {
      const report = await requestAiQualityAudit({
        examQuestions: currentExam.questions,
        grade: currentExam.grade,
        subject: currentExam.subject,
      });

      report.examId = currentExam.id;
      attachQualityReport(currentExam.id, report);

      setCurrentExam((prev) => (prev ? { ...prev, qualityReport: report } : null));
      setShowInspector(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate 4 variants (A, B, C, D)
  const handleGenerateVariants = () => {
    if (!currentExam) return;
    generateVariants(currentExam.id);
    alert('Đã sinh thành công 4 mã đề tương đương (Mã A, B, C, D) với đáp án được xáo trộn chuẩn!');
  };

  // Submit for review
  const handleSubmitForReview = () => {
    if (!currentExam) return;
    submitForReview('exam', currentExam.id);
    setCurrentExam((prev) => (prev ? { ...prev, status: 'pending_approval' } : null));
    alert('Đã gửi đề kiểm tra đến Tổ trưởng chuyên môn và Ban Giám hiệu để phê duyệt!');
    if (onNavigateToReviews) onNavigateToReviews();
  };

  // Active question set based on variant
  const activeQuestions =
    activeVariantCode === 'A'
      ? currentExam?.questions || []
      : currentExam?.variants?.find((v) => v.variantCode === activeVariantCode)?.questions ||
        currentExam?.questions ||
        [];

  const totalExamPoints = Math.round(activeQuestions.reduce((s, q) => s + q.points, 0) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Top Header / Matrix Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center">
              <span className="w-2 h-6 bg-emerald-600 rounded-sm mr-2.5"></span>
              Không Gian Soạn Thảo & Tinh Chỉnh Đề Kiểm Tra
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sinh đề tự động bám sát 100% ma trận đã xác nhận. Hỗ trợ thay thế câu hỏi, sinh biến thể mã đề A-B-C-D.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Matrix dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Chọn ma trận:</span>
              <select
                value={selectedMatrixId}
                onChange={(e) => setSelectedMatrixId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-semibold text-slate-800 max-w-xs truncate"
              >
                {matrices.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.subject} Lớp {m.grade} ({m.status === 'approved' ? 'Đã duyệt' : 'Nháp'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateExamFromMatrix}
              disabled={isGenerating || !selectedMatrix}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center transition"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {isGenerating ? 'AI đang tạo đề...' : 'Tạo đề từ ma trận này'}
            </button>
          </div>
        </div>
      </div>

      {!currentExam ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Chưa có đề kiểm tra nào được chọn</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Chọn ma trận đã duyệt ở trên và nhấn <strong>"Tạo đề từ ma trận này"</strong> để AI sinh đề hoàn chỉnh với đáp án và barem chấm.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Action Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Left: Exam Info & Variant Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {currentExam.code}
              </span>

              {/* Variant switcher */}
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-bold">
                {(['A', 'B', 'C', 'D'] as const).map((vCode) => (
                  <button
                    key={vCode}
                    onClick={() => setActiveVariantCode(vCode)}
                    className={`px-3 py-1 rounded-md transition ${
                      activeVariantCode === vCode
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Đề {vCode}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateVariants}
                className="px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded border border-slate-200 inline-flex items-center font-medium"
                title="Sinh 4 mã đề tương đương A, B, C, D"
              >
                <RefreshCw className="w-3 h-3 mr-1 text-blue-600" />
                Sinh 4 mã đề
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Quality Audit Button */}
              <button
                onClick={handleRunQualityAudit}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-xs inline-flex items-center transition"
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Kiểm tra đề (20 tiêu chí AI)
              </button>

              {/* Toggle Student View vs Teacher View */}
              <button
                onClick={() => setShowStudentPreview(!showStudentPreview)}
                className={`px-3 py-1.5 border rounded-lg text-xs font-semibold inline-flex items-center transition ${
                  showStudentPreview
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                {showStudentPreview ? 'Bản đề học sinh' : 'Bản giáo viên (kèm đáp án)'}
              </button>

              {/* Export Word Exam */}
              <button
                onClick={() => exportExamDocx(currentExam, activeVariantCode)}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold inline-flex items-center transition"
                title="Tải tệp Word bài làm học sinh (không lộ đáp án)"
              >
                <FileDown className="w-3.5 h-3.5 mr-1" />
                Đề bài (.docx)
              </button>

              {/* Export Word Answer Key */}
              <button
                onClick={() => exportAnswerKeyDocx(currentExam, activeVariantCode)}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold inline-flex items-center transition"
                title="Tải tệp Word Hướng dẫn chấm & Đáp án"
              >
                <FileDown className="w-3.5 h-3.5 mr-1" />
                Đáp án (.docx)
              </button>

              {/* Full ZIP Dossier */}
              <button
                onClick={() => {
                  const m = selectedMatrix || matrices[0];
                  exportFullDossierZip(m, currentExam);
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold inline-flex items-center transition shadow-xs"
                title="Tải trọn bộ 5 hồ sơ kiểm tra dạng ZIP"
              >
                <Archive className="w-3.5 h-3.5 mr-1" />
                Trọn bộ (ZIP)
              </button>

              {/* Submit for review */}
              {currentExam.status === 'draft' && (
                <button
                  onClick={handleSubmitForReview}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center transition shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Gửi duyệt
                </button>
              )}
            </div>
          </div>

          {/* Exam Header Preview Banner (Vietnamese Primary School standard) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-xs space-y-4">
            <div className="grid grid-cols-2 border-b border-slate-200 pb-4">
              <div>
                <div className="font-bold text-slate-800 uppercase text-xs">{currentExam.schoolName}</div>
                <div className="text-slate-500 text-[11px]">Tổ: {currentExam.department}</div>
                <div className="text-slate-700 mt-2">Họ và tên học sinh: .....................................................................</div>
                <div className="text-slate-700 mt-1">Lớp: {currentExam.grade}.... • Năm học: {currentExam.academicYear}</div>
              </div>

              <div className="text-center border-l border-slate-200 pl-4">
                <div className="font-extrabold text-slate-900 text-sm uppercase">
                  BÀI KIỂM TRA ĐỊNH KỲ {PERIOD_NAMES[currentExam.period].toUpperCase()}
                </div>
                <div className="font-bold text-blue-900 text-sm mt-0.5">
                  MÔN: {currentExam.subject.toUpperCase()} - LỚP {currentExam.grade}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  Thời gian: {currentExam.durationMinutes} phút • Mã đề: <strong>{activeVariantCode}</strong>
                </div>
              </div>
            </div>

            {/* Score & comments box */}
            <div className="grid grid-cols-3 border border-slate-300 rounded-lg overflow-hidden text-center">
              <div className="p-2 border-r border-slate-300 bg-slate-50">
                <div className="font-bold text-slate-700">ĐIỂM SỐ</div>
                <div className="h-10"></div>
              </div>
              <div className="col-span-2 p-2 text-left bg-slate-50">
                <div className="font-bold text-slate-700">NHẬN XÉT CỦA GIÁO VIÊN</div>
                <div className="text-slate-400 text-[11px] mt-1">.....................................................................................................................................</div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
              <span>DANH SÁCH CÂU HỎI ({activeQuestions.length} câu - Tổng {totalExamPoints} điểm)</span>
              <span className="text-[11px] text-slate-500">
                {showStudentPreview ? 'Đang ở chế độ xem bản học sinh (Ẩn đáp án)' : 'Đang ở chế độ xem bản giáo viên (Hiển thị đáp án & barem)'}
              </span>
            </div>

            {activeQuestions.map((q, idx) => {
              const isReplacing = replacingQId === q.id;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-xl border p-5 transition shadow-xs ${
                    q.isLocked ? 'border-slate-300 bg-slate-50/40' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {/* Question Header & Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">
                        Câu {idx + 1}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                        {q.points} điểm
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          q.level === 1
                            ? 'bg-blue-100 text-blue-800'
                            : q.level === 2
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        Mức {q.level}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
                        [{q.topic}]
                      </span>
                    </div>

                    {/* Action buttons on question */}
                    {!showStudentPreview && (
                      <div className="flex items-center space-x-1.5">
                        {/* Lock / Unlock */}
                        <button
                          onClick={() => toggleLockQuestion(currentExam.id, q.id)}
                          className={`p-1.5 rounded text-xs inline-flex items-center ${
                            q.isLocked
                              ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={q.isLocked ? 'Câu hỏi đã khóa không bị đổi' : 'Khóa câu hỏi này'}
                        >
                          {q.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>

                        {/* Replace with equivalent */}
                        <button
                          onClick={() => handleReplaceQuestion(q)}
                          disabled={isReplacing || q.isLocked}
                          className={`px-2 py-1 text-[11px] font-semibold rounded border transition inline-flex items-center ${
                            q.isLocked
                              ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                              : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100'
                          }`}
                          title="Sinh câu hỏi tương đương bảo toàn ma trận và điểm số"
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${isReplacing ? 'animate-spin' : ''}`} />
                          {isReplacing ? 'Đang đổi...' : 'Đổi câu tương đương'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Question Content */}
                  <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line mb-3">
                    {q.content}
                  </div>

                  {/* Options if Multiple Choice */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                      {q.options.map((opt) => {
                        const isCorrect = opt.key === q.correctAnswer;
                        const highlight = !showStudentPreview && isCorrect;

                        return (
                          <div
                            key={opt.key}
                            className={`p-2.5 rounded-lg border flex items-start space-x-2 transition ${
                              highlight
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                                highlight ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {opt.key}
                            </span>
                            <span className="flex-1 mt-0.5">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Teacher Rubric & Answer (Hidden in Student view) */}
                  {!showStudentPreview && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-emerald-700">Đáp án chuẩn:</span>
                        <span className="font-bold text-slate-900">{q.correctAnswer}</span>
                      </div>
                      <div className="text-slate-600 whitespace-pre-line">
                        <span className="font-semibold text-slate-700">Barem chấm điểm:</span> {q.rubric}
                      </div>
                    </div>
                  )}

                  {/* Student answer lines when student preview */}
                  {showStudentPreview && (!q.options || q.options.length === 0) && (
                    <div className="mt-4 space-y-2 text-slate-300">
                      <div className="text-xs text-slate-500 italic">Bài làm:</div>
                      <div className="border-b border-dotted border-slate-300 h-6"></div>
                      <div className="border-b border-dotted border-slate-300 h-6"></div>
                      <div className="border-b border-dotted border-slate-300 h-6"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Inspector Modal */}
      {currentExam && (
        <QualityInspectorModal
          report={currentExam.qualityReport || null}
          isOpen={showInspector}
          onClose={() => setShowInspector(false)}
          examCode={currentExam.code}
          subject={currentExam.subject}
          grade={currentExam.grade}
        />
      )}
    </div>
  );
};
