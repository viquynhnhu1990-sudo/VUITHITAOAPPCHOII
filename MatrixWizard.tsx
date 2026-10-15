import React, { useState, useId } from 'react';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  FileDown,
  Save,
  CheckCircle2,
  FileText,
  Upload,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { GradeLevel, TermPeriod, Matrix, MatrixCell, QuestionType } from '../../types';
import {
  CURRICULUM_SUBJECT_RULES,
  validateExamEligibility,
  PERIOD_NAMES,
  TOPIC_TEMPLATES,
} from '../../data/curriculumData';
import { requestAiMatrixSuggestion } from '../../services/aiService';
import { exportMatrixDocx, exportMatrixXlsx } from '../../utils/exportUtils';

interface MatrixWizardProps {
  onMatrixConfirmed: (matrix: Matrix) => void;
  onNavigateToExamCreator: (matrixId: string) => void;
  editingMatrix?: Matrix;
}

export const MatrixWizard: React.FC<MatrixWizardProps> = ({
  onMatrixConfirmed,
  onNavigateToExamCreator,
  editingMatrix,
}) => {
  const { schoolSettings, saveMatrix, confirmMatrix } = useData();
  const { currentUser } = useAuth();

  // Wizard Step (1: Thông tin chung, 2: Phạm vi kiểm tra, 3: Cấu hình ma trận, 4: Bảng ma trận)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Thông tin chung
  const [grade, setGrade] = useState<GradeLevel>(editingMatrix?.grade || 4);
  const [period, setPeriod] = useState<TermPeriod>(editingMatrix?.period || 'mid_term_1');
  const [subject, setSubject] = useState<string>(editingMatrix?.subject || 'Toán');
  const [className, setClassName] = useState<string>(editingMatrix?.className || 'Khối 4');
  const [textbook, setTextbook] = useState<string>(editingMatrix?.textbook || 'Kết Nối Tri Thức');
  const [durationMinutes, setDurationMinutes] = useState<number>(editingMatrix?.durationMinutes || 40);
  const [examForm, setExamForm] = useState<Matrix['examForm']>(
    editingMatrix?.examForm || 'Tự luận kết hợp trắc nghiệm'
  );
  const [matrixNotes, setMatrixNotes] = useState<string>('');

  // Step 2: Phạm vi kiểm tra
  const [inputMode, setInputMode] = useState<'upload' | 'manual'>('manual');
  const [uploadedFileName, setUploadedFileName] = useState<string>(editingMatrix?.syllabusDocName || '');
  const [syllabusText, setSyllabusText] = useState<string>(
    editingMatrix?.syllabusContent ||
      'Phần 1: Số có nhiều chữ số. Phép cộng và trừ số tự nhiên.\nPhần 2: Hình học (Góc nhọn, góc tù, đường vuông góc, song song).\nPhần 3: Đo lường khối lượng và thời gian (yến, tạ, tấn, thế kỉ).'
  );

  // Step 3 & 4: Cells & Matrix
  const [cells, setCells] = useState<MatrixCell[]>(
    editingMatrix?.cells || [
      {
        id: 'cell_init_1',
        topicId: 'topic_1',
        topicName: 'Số có nhiều chữ số và phép tính',
        outcome: 'Đọc, viết, so sánh số tự nhiên; thực hiện phép cộng, trừ có nhớ.',
        sourceRef: 'SGK Bài 1 - 15',
        level1Count: 2,
        level1Points: 2.0,
        level1Type: 'multiple_choice',
        level2Count: 2,
        level2Points: 2.0,
        level2Type: 'multiple_choice',
        level3Count: 1,
        level3Points: 1.5,
        level3Type: 'essay',
        totalQuestions: 5,
        totalPoints: 5.5,
      },
      {
        id: 'cell_init_2',
        topicId: 'topic_2',
        topicName: 'Hình học và đại lượng đo lường',
        outcome: 'Nhận biết góc, đường vuông góc, song song; chuyển đổi đơn vị đo.',
        sourceRef: 'SGK Bài 16 - 25',
        level1Count: 2,
        level1Points: 2.0,
        level1Type: 'multiple_choice',
        level2Count: 1,
        level2Points: 1.0,
        level2Type: 'short_answer',
        level3Count: 1,
        level3Points: 1.5,
        level3Type: 'essay',
        totalQuestions: 4,
        totalPoints: 4.5,
      },
    ]
  );

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [matrixStatus, setMatrixStatus] = useState<Matrix['status']>(editingMatrix?.status || 'draft');
  const [savedMatrixId, setSavedMatrixId] = useState<string>(editingMatrix?.id || '');

  // Validation according to legal rules
  const eligibility = validateExamEligibility(grade, subject, period);

  // List of allowed subjects for currently selected grade
  const allowedSubjects = CURRICULUM_SUBJECT_RULES.filter((rule) =>
    rule.gradesAllowed.includes(grade)
  );

  // Auto-switch subject if current subject is not allowed in new grade
  const handleGradeChange = (newGrade: GradeLevel) => {
    setGrade(newGrade);
    const validSubs = CURRICULUM_SUBJECT_RULES.filter((r) => r.gradesAllowed.includes(newGrade));
    if (!validSubs.some((s) => s.name === subject)) {
      setSubject(validSubs[0]?.name || 'Toán');
    }
  };

  // Calculations
  const totalM1Pts = Math.round(cells.reduce((s, c) => s + c.level1Points, 0) * 10) / 10;
  const totalM2Pts = Math.round(cells.reduce((s, c) => s + c.level2Points, 0) * 10) / 10;
  const totalM3Pts = Math.round(cells.reduce((s, c) => s + c.level3Points, 0) * 10) / 10;
  const grandTotalPoints = Math.round((totalM1Pts + totalM2Pts + totalM3Pts) * 10) / 10;
  const totalQuestions = cells.reduce((s, c) => s + c.totalQuestions, 0);

  const isTotalPointsValid = Math.abs(grandTotalPoints - 10) < 0.01;

  // File upload simulation (Genuine text extractor)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSyllabusText(
          `[Nội dung trích xuất từ tệp ${file.name}]\n` + content.slice(0, 1500)
        );
      } else {
        setSyllabusText(
          `[Tài liệu đính kèm: ${file.name}]\nPhạm vi kiến thức trọng tâm bám sát SGK ${subject} Lớp ${grade} (${textbook}).`
        );
      }
    };
    reader.readAsText(file);
  };

  // AI Suggest Matrix
  const handleAiSuggestMatrix = async () => {
    setIsAiGenerating(true);
    try {
      const suggestedCells = await requestAiMatrixSuggestion({
        grade,
        subject,
        period,
        textbook,
        syllabusContent: syllabusText,
      });

      if (suggestedCells && suggestedCells.length > 0) {
        setCells(suggestedCells);
      }
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Row operations in Step 4
  const updateCell = (id: string, updates: Partial<MatrixCell>) => {
    setCells((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          updated.totalQuestions = (updated.level1Count || 0) + (updated.level2Count || 0) + (updated.level3Count || 0);
          updated.totalPoints = Math.round(((updated.level1Points || 0) + (updated.level2Points || 0) + (updated.level3Points || 0)) * 10) / 10;
          return updated;
        }
        return c;
      })
    );
  };

  const addCell = () => {
    const newCell: MatrixCell = {
      id: `cell_${Date.now()}`,
      topicId: `topic_${cells.length + 1}`,
      topicName: `Mạch kiến thức mới ${cells.length + 1}`,
      outcome: 'Yêu cầu cần đạt chuẩn năng lực học sinh tiểu học',
      level1Count: 1,
      level1Points: 1.0,
      level1Type: 'multiple_choice',
      level2Count: 1,
      level2Points: 1.0,
      level2Type: 'multiple_choice',
      level3Count: 0,
      level3Points: 0,
      level3Type: 'essay',
      totalQuestions: 2,
      totalPoints: 2.0,
    };
    setCells([...cells, newCell]);
  };

  const removeCell = (id: string) => {
    if (cells.length <= 1) {
      alert('Ma trận phải có ít nhất 1 mạch kiến thức.');
      return;
    }
    setCells(cells.filter((c) => c.id !== id));
  };

  // Build Matrix Object
  const buildCurrentMatrix = (): Matrix => {
    const matrixId = savedMatrixId || `mat_${Date.now()}`;
    const code = editingMatrix?.code || `MT-${subject.toUpperCase().slice(0, 4)}-L${grade}-${period.toUpperCase().slice(0, 4)}-${Math.floor(10 + Math.random() * 90)}`;
    return {
      id: matrixId,
      code,
      title: `Ma trận đề kiểm tra môn ${subject} Lớp ${grade} - ${PERIOD_NAMES[period]}`,
      schoolName: schoolSettings.schoolName,
      academicYear: schoolSettings.academicYear,
      term: schoolSettings.currentTerm,
      period,
      grade,
      className,
      subject,
      textbook,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      department: currentUser.title.includes('Khối 4') ? 'Tổ Chuyên môn Khối 4 - 5' : 'Tổ Chuyên môn Nhà trường',
      durationMinutes,
      examForm,
      totalScore: 10,
      status: matrixStatus,
      version: editingMatrix?.version || 'v1.0',
      cells,
      syllabusDocName: uploadedFileName,
      syllabusContent: syllabusText,
      createdAt: editingMatrix?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // Save draft
  const handleSaveDraft = () => {
    const matrix = buildCurrentMatrix();
    saveMatrix(matrix);
    setSavedMatrixId(matrix.id);
    alert('Đã lưu nháp ma trận thành công vào hệ thống!');
  };

  // Confirm Matrix
  const handleConfirmMatrix = () => {
    if (!isTotalPointsValid) {
      alert(`LỖI: Tổng điểm của ma trận hiện tại là ${grandTotalPoints} điểm. Tổng điểm bắt buộc phải bằng 10.0 điểm theo quy định Thông tư 27!`);
      return;
    }

    const matrix = buildCurrentMatrix();
    matrix.status = 'approved';
    matrix.approvedBy = currentUser.name;
    matrix.approvedAt = new Date().toISOString();
    saveMatrix(matrix);
    confirmMatrix(matrix.id, currentUser.name);
    setMatrixStatus('approved');
    setSavedMatrixId(matrix.id);
    onMatrixConfirmed(matrix);
    alert('Đã xác nhận ma trận đạt chuẩn chuyên môn thành công! Bạn có thể chuyển sang tạo đề thi.');
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header & Steps Progress */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center">
              <span className="w-2 h-6 bg-blue-700 rounded-sm mr-2.5"></span>
              Quy Trình Xây Dựng Ma Trận Kiểm Tra Định Kỳ
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Chuẩn hóa theo Chương trình GDPT 2018 và Thông tư 27/2020/TT-BGDĐT
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveDraft}
              className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Lưu nháp
            </button>
            {matrixStatus === 'approved' && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Ma trận đã xác nhận
              </span>
            )}
          </div>
        </div>

        {/* Step indicator */}
        <div className="grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">
          {[
            { num: 1, title: 'Bước 1', desc: 'Thông tin chung' },
            { num: 2, title: 'Bước 2', desc: 'Phạm vi kiểm tra' },
            { num: 3, title: 'Bước 3', desc: 'Thiết lập ma trận' },
            { num: 4, title: 'Bước 4', desc: 'Bảng ma trận & Duyệt' },
          ].map((st) => (
            <button
              key={st.num}
              onClick={() => setCurrentStep(st.num as any)}
              className={`text-left p-2.5 rounded-lg transition ${
                currentStep === st.num
                  ? 'bg-blue-50 border-2 border-blue-600'
                  : currentStep > st.num
                  ? 'bg-slate-50 border border-emerald-300'
                  : 'bg-slate-50 border border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === st.num
                      ? 'bg-blue-600 text-white'
                      : currentStep > st.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {currentStep > st.num ? <Check className="w-3 h-3" /> : st.num}
                </span>
                <span>{st.title}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium truncate">{st.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: THÔNG TIN CHUNG */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">Bước 1: Thiết lập Thông tin chung</h2>
            <p className="text-xs text-slate-500">
              Lựa chọn khối lớp, môn học và thời điểm. Hệ thống tự động kiểm tra tính hợp pháp theo Thông tư 27.
            </p>
          </div>

          {/* Legal Warning Notice if invalid */}
          {!eligibility.isValid && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-900">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <div className="font-bold">Cảnh báo quy định pháp lý (Thông tư 27/2020/TT-BGDĐT):</div>
                <div className="mt-1">{eligibility.reason}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Khối lớp */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Khối lớp <span className="text-red-500">*</span>
              </label>
              <select
                value={grade}
                onChange={(e) => handleGradeChange(parseInt(e.target.value, 10) as GradeLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value={1}>Lớp 1 (Tiếng Việt, Toán)</option>
                <option value={2}>Lớp 2 (Tiếng Việt, Toán)</option>
                <option value={3}>Lớp 3 (Toán, Tiếng Việt, Ngoại ngữ 1, Tin học, Công nghệ)</option>
                <option value={4}>Lớp 4 (Toán, Tiếng Việt, Ngoại ngữ 1, Khoa học, Lịch sử - Địa lí, Tin học, Công nghệ)</option>
                <option value={5}>Lớp 5 (Toán, Tiếng Việt, Ngoại ngữ 1, Khoa học, Lịch sử - Địa lí, Tin học, Công nghệ)</option>
              </select>
            </div>

            {/* Thời điểm kiểm tra */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Thời điểm kiểm tra <span className="text-red-500">*</span>
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as TermPeriod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-600"
              >
                <option value="mid_term_1">Giữa Học kỳ I (Chỉ áp dụng Toán & TV Lớp 4, 5)</option>
                <option value="end_term_1">Cuối Học kỳ I (Tất cả các môn quy định)</option>
                <option value="mid_term_2">Giữa Học kỳ II (Chỉ áp dụng Toán & TV Lớp 4, 5)</option>
                <option value="end_term_2">Cuối Năm học / Cuối HKII (Tất cả các môn quy định)</option>
              </select>
            </div>

            {/* Môn học */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Môn học <span className="text-red-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:ring-2 focus:ring-blue-600"
              >
                {allowedSubjects.map((rule) => (
                  <option key={rule.id} value={rule.name}>
                    {rule.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bộ sách giáo khoa */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Bộ sách giáo khoa</label>
              <select
                value={textbook}
                onChange={(e) => setTextbook(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                <option value="Kết Nối Tri Thức">Kết Nối Tri Thức Với Cuộc Sống</option>
                <option value="Cánh Diều">Cánh Diều</option>
                <option value="Chân Trời Sáng Tạo">Chân Trời Sáng Tạo</option>
              </select>
            </div>

            {/* Thời lượng */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Thời lượng làm bài (phút)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 40)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
                min={30}
                max={60}
              />
            </div>

            {/* Hình thức */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Hình thức kiểm tra</label>
              <select
                value={examForm}
                onChange={(e) => setExamForm(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
              >
                <option value="Tự luận kết hợp trắc nghiệm">Tự luận kết hợp trắc nghiệm khách quan</option>
                <option value="Trắc nghiệm khách quan">Trắc nghiệm khách quan 100%</option>
                <option value="Đọc và Viết">Đọc và Viết (Tiếng Việt)</option>
                <option value="Thực hành kết hợp lý thuyết">Lý thuyết kết hợp nhiệm vụ thực hành (Tin học/Công nghệ)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!eligibility.isValid}
              className={`inline-flex items-center px-5 py-2.5 rounded-lg text-xs font-bold shadow transition ${
                eligibility.isValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Tiếp tục: Phạm vi kiểm tra</span>
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PHẠM VI KIỂM TRA & TÀI LIỆU */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">Bước 2: Xác định Phạm vi Kiểm tra & Tài liệu Nguồn</h2>
            <p className="text-xs text-slate-500">
              Nhập nội dung trọng tâm hoặc tải tệp tài liệu (PDF, DOCX, XLSX, TXT) để làm căn cứ ra đề. Tuyệt đối không bịa đặt nguồn.
            </p>
          </div>

          {/* Mode switch */}
          <div className="flex space-x-3 text-xs font-semibold">
            <button
              onClick={() => setInputMode('manual')}
              className={`px-4 py-2 rounded-lg border transition ${
                inputMode === 'manual'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Cách B: Nhập nội dung & yêu cầu cần đạt thủ công
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`px-4 py-2 rounded-lg border transition ${
                inputMode === 'upload'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Cách A: Tải tệp phân phối chương trình / đề cương
            </button>
          </div>

          {inputMode === 'upload' ? (
            <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 text-center">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-700">Tải lên tệp tài liệu kế hoạch bài dạy / đề cương</div>
              <div className="text-[11px] text-slate-500 mt-1">Định dạng hỗ trợ: TXT, DOCX, XLSX, PDF (Tối đa 10MB)</div>
              <input
                type="file"
                id="docUploadInput"
                onChange={handleFileUpload}
                accept=".txt,.docx,.pdf,.xlsx"
                className="hidden"
              />
              <label
                htmlFor="docUploadInput"
                className="mt-3 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition shadow-xs"
              >
                Chọn tệp từ máy tính
              </label>

              {uploadedFileName && (
                <div className="mt-3 text-xs text-emerald-700 font-semibold flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  Đã tải tệp: {uploadedFileName}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Nội dung trọng tâm & Yêu cầu cần đạt theo Chương trình GDPT 2018:
              </label>
              <textarea
                rows={6}
                value={syllabusText}
                onChange={(e) => setSyllabusText(e.target.value)}
                placeholder="Nhập các mạch kiến thức, bài học và chuẩn yêu cầu cần đạt..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600"
              />
              <div className="text-[11px] text-slate-500 italic">
                Ghi chú: Căn cứ vào kế hoạch dạy học thực tế của trường đến thời điểm kiểm tra.
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại Bước 1
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow"
            >
              <span>Tiếp tục: Thiết lập ma trận</span>
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: THIẾT LẬP CẤU HÌNH MA TRẬN */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">Bước 3: Lựa chọn Phương thức Thiết lập Ma Trận</h2>
            <p className="text-xs text-slate-500">
              Chọn phương án khởi tạo ma trận tối ưu nhất cho tổ chuyên môn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Option 1: AI đề xuất */}
            <div className="p-5 border-2 border-blue-500 bg-blue-50/40 rounded-xl relative flex flex-col justify-between">
              <span className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Khuyên Dùng
              </span>
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">AI Đề Xuất Ma Trận Chuẩn</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Tự động phân bổ đúng 3 mức độ (40% Mức 1 - 30% Mức 2 - 30% Mức 3), bám sát chuẩn kiến thức GDPT 2018 và Thông tư 27.
                </p>
              </div>
              <button
                onClick={() => {
                  handleAiSuggestMatrix();
                  setCurrentStep(4);
                }}
                disabled={isAiGenerating}
                className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center transition"
              >
                {isAiGenerating ? 'Đang phân tích...' : 'Sinh ma trận thông minh'}
              </button>
            </div>

            {/* Option 2: Thủ công */}
            <div className="p-5 border border-slate-200 hover:border-slate-300 bg-white rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Tự Nhập Thủ Công</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Giáo viên tự quy định số câu, số điểm cho từng mạch kiến thức và mức độ theo kế hoạch riêng của trường.
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(4)}
                className="mt-4 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
              >
                Vào bảng ma trận
              </button>
            </div>

            {/* Option 3: Ma trận mẫu */}
            <div className="p-5 border border-slate-200 hover:border-slate-300 bg-white rounded-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Sử Dụng Ma Trận Mẫu</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Tải cấu trúc chuẩn mẫu đã được phê duyệt của Phòng GD&ĐT và tổ chuyên môn trường.
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(4)}
                className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition"
              >
                Áp dụng mẫu có sẵn
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại Bước 2
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow"
            >
              <span>Vào bảng ma trận</span>
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: BẢNG MA TRẬN TRỰC TIẾP & KIỂM TRA ĐIỀU KIỆN */}
      {currentStep === 4 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <span>Ma Trận Đề Kiểm Tra Định Kỳ - Môn {subject} Lớp {grade}</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                  {PERIOD_NAMES[period]}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chỉnh sửa trực tiếp số câu, số điểm của từng mức độ. Hệ thống kiểm tra điều kiện tự động.
              </p>
            </div>

            {/* Live verification stats pill */}
            <div className="flex items-center space-x-2">
              <div
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 ${
                  isTotalPointsValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-red-50 text-red-800 border-red-300 animate-pulse'
                }`}
              >
                <span>Tổng điểm: {grandTotalPoints} / 10.0đ</span>
                {isTotalPointsValid ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>

              <button
                onClick={handleAiSuggestMatrix}
                disabled={isAiGenerating}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold inline-flex items-center transition"
                title="AI tối ưu lại phân bổ điểm"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {isAiGenerating ? 'Đang tính...' : 'AI cân bằng lại'}
              </button>
            </div>
          </div>

          {/* Validation Alert Box if invalid total */}
          {!isTotalPointsValid && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Cảnh báo Thông tư 27:</strong> Tổng điểm toàn bài phải đúng <strong>10.0 điểm</strong> (Hiện tại: {grandTotalPoints}đ). Vui lòng tăng/giảm điểm các ô bên dưới.
                </span>
              </div>
            </div>
          )}

          {/* Matrix Interactive Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">STT</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Chủ đề / Mạch kiến thức</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Yêu cầu cần đạt chuẩn GDPT 2018</th>
                  <th className="py-2.5 px-3 text-center bg-blue-50/80 min-w-[130px]">
                    Mức 1 (Nhận biết)
                    <div className="text-[10px] text-blue-700 font-normal">Số câu | Điểm</div>
                  </th>
                  <th className="py-2.5 px-3 text-center bg-emerald-50/80 min-w-[130px]">
                    Mức 2 (Kết nối)
                    <div className="text-[10px] text-emerald-700 font-normal">Số câu | Điểm</div>
                  </th>
                  <th className="py-2.5 px-3 text-center bg-purple-50/80 min-w-[130px]">
                    Mức 3 (Vận dụng)
                    <div className="text-[10px] text-purple-700 font-normal">Số câu | Điểm</div>
                  </th>
                  <th className="py-2.5 px-3 text-center font-bold min-w-[90px]">Tổng điểm</th>
                  <th className="py-2.5 px-2 w-12 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cells.map((cell, idx) => (
                  <tr key={cell.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2 px-3 text-center font-semibold text-slate-500">
                      {idx + 1}
                    </td>

                    {/* Topic name */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={cell.topicName}
                        onChange={(e) => updateCell(cell.id, { topicName: e.target.value })}
                        className="w-full font-semibold text-slate-800 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-1.5 py-1"
                      />
                    </td>

                    {/* Outcome */}
                    <td className="py-2 px-3">
                      <textarea
                        rows={2}
                        value={cell.outcome}
                        onChange={(e) => updateCell(cell.id, { outcome: e.target.value })}
                        className="w-full text-slate-600 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-1.5 py-1 resize-y"
                      />
                    </td>

                    {/* Level 1: Count & Points */}
                    <td className="py-2 px-3 bg-blue-50/30 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <input
                          type="number"
                          value={cell.level1Count}
                          min={0}
                          max={10}
                          onChange={(e) => updateCell(cell.id, { level1Count: parseInt(e.target.value, 10) || 0 })}
                          className="w-12 text-center bg-white border border-slate-300 rounded py-1 font-bold text-slate-800"
                        />
                        <span className="text-slate-400">câu</span>
                        <input
                          type="number"
                          step={0.5}
                          value={cell.level1Points}
                          min={0}
                          max={10}
                          onChange={(e) => updateCell(cell.id, { level1Points: parseFloat(e.target.value) || 0 })}
                          className="w-14 text-center bg-white border border-blue-300 rounded py-1 font-bold text-blue-700"
                        />
                        <span className="text-slate-400">đ</span>
                      </div>
                    </td>

                    {/* Level 2: Count & Points */}
                    <td className="py-2 px-3 bg-emerald-50/30 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <input
                          type="number"
                          value={cell.level2Count}
                          min={0}
                          max={10}
                          onChange={(e) => updateCell(cell.id, { level2Count: parseInt(e.target.value, 10) || 0 })}
                          className="w-12 text-center bg-white border border-slate-300 rounded py-1 font-bold text-slate-800"
                        />
                        <span className="text-slate-400">câu</span>
                        <input
                          type="number"
                          step={0.5}
                          value={cell.level2Points}
                          min={0}
                          max={10}
                          onChange={(e) => updateCell(cell.id, { level2Points: parseFloat(e.target.value) || 0 })}
                          className="w-14 text-center bg-white border border-emerald-300 rounded py-1 font-bold text-emerald-700"
                        />
                        <span className="text-slate-400">đ</span>
                      </div>
                    </td>

                    {/* Level 3: Count & Points */}
                    <td className="py-2 px-3 bg-purple-50/30 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <input
                          type="number"
                          value={cell.level3Count}
                          min={0}
                          max={10}
                          onChange={(e) => updateCell(cell.id, { level3Count: parseInt(e.target.value, 10) || 0 })}
                          className="w-12 text-center bg-white border border-slate-300 rounded py-1 font-bold text-slate-800"
                        />
                        <span className="text-slate-400">câu</span>
                        <input
                          type="number"
                          step={0.5}
                          value={cell.level3Points}
                          min={0}
                          max={10}
                          onChange={(e) => updateCell(cell.id, { level3Points: parseFloat(e.target.value) || 0 })}
                          className="w-14 text-center bg-white border border-purple-300 rounded py-1 font-bold text-purple-700"
                        />
                        <span className="text-slate-400">đ</span>
                      </div>
                    </td>

                    {/* Total Cell Points */}
                    <td className="py-2 px-3 text-center font-bold text-slate-900 bg-slate-50">
                      {cell.totalPoints}đ
                    </td>

                    {/* Delete action */}
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => removeCell(cell.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                        title="Xóa mạch kiến thức"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Total Footer */}
              <tfoot className="bg-slate-100 font-extrabold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-left">
                    TỔNG CỘNG TOÀN MA TRẬN ({totalQuestions} câu hỏi)
                    <div className="text-[11px] text-slate-500 font-normal">
                      Tỷ lệ nhận thức: Mức 1 ({Math.round((totalM1Pts / 10) * 100)}%) - Mức 2 ({Math.round((totalM2Pts / 10) * 100)}%) - Mức 3 ({Math.round((totalM3Pts / 10) * 100)}%)
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-blue-800 bg-blue-100/70">
                    {totalM1Pts}đ ({Math.round((totalM1Pts / 10) * 100)}%)
                  </td>
                  <td className="py-3 px-3 text-center text-emerald-800 bg-emerald-100/70">
                    {totalM2Pts}đ ({Math.round((totalM2Pts / 10) * 100)}%)
                  </td>
                  <td className="py-3 px-3 text-center text-purple-800 bg-purple-100/70">
                    {totalM3Pts}đ ({Math.round((totalM3Pts / 10) * 100)}%)
                  </td>
                  <td
                    className={`py-3 px-3 text-center text-sm font-black ${
                      isTotalPointsValid ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'
                    }`}
                  >
                    {grandTotalPoints}đ
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Add row button */}
          <div className="flex justify-between items-center">
            <button
              onClick={addCell}
              className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
            >
              <Plus className="w-4 h-4 mr-1 text-slate-600" />
              Thêm mạch kiến thức / chủ đề
            </button>

            {/* Export buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportMatrixDocx(buildCurrentMatrix())}
                className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition"
                title="Xuất file Word DOCX đúng chuẩn"
              >
                <FileDown className="w-3.5 h-3.5 mr-1" />
                Xuất Word (.docx)
              </button>
              <button
                onClick={() => exportMatrixXlsx(buildCurrentMatrix())}
                className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold transition"
                title="Xuất file Excel XLSX"
              >
                <FileDown className="w-3.5 h-3.5 mr-1" />
                Xuất Excel (.xlsx)
              </button>
            </div>
          </div>

          {/* Step 4 Footer Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại Bước 3
            </button>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={handleSaveDraft}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
              >
                <Save className="w-4 h-4 mr-1.5" />
                Lưu bản nháp
              </button>

              <button
                onClick={handleConfirmMatrix}
                disabled={!isTotalPointsValid}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2 text-xs font-bold rounded-lg shadow transition ${
                  isTotalPointsValid
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Xác nhận Ma Trận
              </button>

              {matrixStatus === 'approved' && (
                <button
                  onClick={() => onNavigateToExamCreator(savedMatrixId || 'current')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition"
                >
                  <span>Chuyển sang tạo đề</span>
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
