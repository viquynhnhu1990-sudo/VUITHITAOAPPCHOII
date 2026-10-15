import React, { useState } from 'react';
import {
  Database,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  FileDown,
  Upload,
  BookOpen,
  ChevronDown,
  Tag,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Question, GradeLevel, CognitiveLevel, QuestionType } from '../../types';
import * as XLSX from 'xlsx';

export const QuestionBank: React.FC = () => {
  const { questionBank, saveQuestionToBank, deleteQuestionFromBank } = useData();
  const { currentUser } = useAuth();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form states
  const [formSubject, setFormSubject] = useState('Toán');
  const [formGrade, setFormGrade] = useState<GradeLevel>(4);
  const [formTopic, setFormTopic] = useState('');
  const [formOutcome, setFormOutcome] = useState('');
  const [formLevel, setFormLevel] = useState<CognitiveLevel>(1);
  const [formType, setFormType] = useState<QuestionType>('multiple_choice');
  const [formContent, setFormContent] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formCorrectAns, setFormCorrectAns] = useState('A');
  const [formRubric, setFormRubric] = useState('');
  const [formPoints, setFormPoints] = useState(1.0);

  // Filter questions
  const filteredQuestions = questionBank.filter((q) => {
    if (filterGrade !== 'all' && q.grade !== filterGrade) return false;
    if (filterSubject !== 'all' && q.subject.toLowerCase() !== filterSubject.toLowerCase()) return false;
    if (filterLevel !== 'all' && q.level !== filterLevel) return false;
    if (filterType !== 'all' && q.type !== filterType) return false;
    if (searchQuery.trim()) {
      const qText = `${q.code} ${q.content} ${q.topic} ${q.outcome}`.toLowerCase();
      if (!qText.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormSubject('Toán');
    setFormGrade(4);
    setFormTopic('Số và phép tính');
    setFormOutcome('Nhận biết và vận dụng kiến thức cơ bản');
    setFormLevel(1);
    setFormType('multiple_choice');
    setFormContent('');
    setFormOptA('');
    setFormOptB('');
    setFormOptC('');
    setFormOptD('');
    setFormCorrectAns('A');
    setFormRubric('Khoanh vào phương án A được 1.0 điểm.');
    setFormPoints(1.0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormSubject(q.subject);
    setFormGrade(q.grade);
    setFormTopic(q.topic);
    setFormOutcome(q.outcome);
    setFormLevel(q.level);
    setFormType(q.type);
    setFormContent(q.content);
    setFormOptA(q.options?.find((o) => o.key === 'A')?.text || '');
    setFormOptB(q.options?.find((o) => o.key === 'B')?.text || '');
    setFormOptC(q.options?.find((o) => o.key === 'C')?.text || '');
    setFormOptD(q.options?.find((o) => o.key === 'D')?.text || '');
    setFormCorrectAns(q.correctAnswer);
    setFormRubric(q.rubric);
    setFormPoints(q.points);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();

    const options =
      formType === 'multiple_choice'
        ? [
            { key: 'A' as const, text: formOptA, isCorrect: formCorrectAns === 'A' },
            { key: 'B' as const, text: formOptB, isCorrect: formCorrectAns === 'B' },
            { key: 'C' as const, text: formOptC, isCorrect: formCorrectAns === 'C' },
            { key: 'D' as const, text: formOptD, isCorrect: formCorrectAns === 'D' },
          ]
        : undefined;

    const newQuestion: Question = {
      id: editingQuestion?.id || `qb_${Date.now()}`,
      matrixCellId: editingQuestion?.matrixCellId || 'general_cell',
      code: editingQuestion?.code || `${formSubject.toUpperCase().slice(0, 3)}${formGrade}-M${formLevel}-${Math.floor(10 + Math.random() * 90)}`,
      subject: formSubject,
      grade: formGrade,
      topic: formTopic,
      outcome: formOutcome,
      level: formLevel,
      type: formType,
      content: formContent,
      options,
      correctAnswer: formCorrectAns,
      rubric: formRubric,
      points: formPoints,
      reviewStatus: 'verified',
    };

    saveQuestionToBank(newQuestion);
    setIsModalOpen(false);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const rows: (string | number)[][] = [
      ['Mã câu', 'Môn', 'Lớp', 'Mức độ', 'Dạng câu', 'Nội dung câu hỏi', 'Đáp án', 'Biểu điểm', 'Chủ đề', 'Yêu cầu cần đạt'],
    ];

    filteredQuestions.forEach((q) => {
      rows.push([
        q.code,
        q.subject,
        `Lớp ${q.grade}`,
        `Mức ${q.level}`,
        q.type,
        q.content,
        q.correctAnswer,
        q.points,
        q.topic,
        q.outcome,
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ngân Hàng Câu Hỏi');
    XLSX.writeFile(wb, `Ngan_hang_cau_hoi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center">
            <span className="w-2 h-6 bg-blue-700 rounded-sm mr-2.5"></span>
            Ngân Hàng Câu Hỏi Dùng Chung
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kho dữ liệu câu hỏi kiểm tra phân loại theo 3 mức độ nhận thức của Thông tư 27.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition inline-flex items-center"
          >
            <FileDown className="w-3.5 h-3.5 mr-1" />
            Xuất Excel
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Thêm câu hỏi mới
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nội dung câu hỏi, mã câu, chủ đề..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Grade filter */}
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
            >
              <option value="all">Tất cả Khối lớp</option>
              <option value={1}>Lớp 1</option>
              <option value={2}>Lớp 2</option>
              <option value={3}>Lớp 3</option>
              <option value={4}>Lớp 4</option>
              <option value={5}>Lớp 5</option>
            </select>

            {/* Subject filter */}
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
            >
              <option value="all">Tất cả Môn học</option>
              <option value="Toán">Toán</option>
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="Tin học">Tin học</option>
              <option value="Khoa học">Khoa học</option>
              <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
              <option value="Công nghệ">Công nghệ</option>
            </select>

            {/* Level filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
            >
              <option value="all">Tất cả Mức độ</option>
              <option value={1}>Mức 1 (Nhận biết)</option>
              <option value={2}>Mức 2 (Kết nối)</option>
              <option value={3}>Mức 3 (Vận dụng)</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-medium">
          Tìm thấy <strong>{filteredQuestions.length}</strong> câu hỏi phù hợp tiêu chí.
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 p-4 shadow-xs flex flex-col justify-between transition"
          >
            <div>
              {/* Question tags */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                    {q.code}
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px]">
                    {q.subject} Lớp {q.grade}
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      q.level === 1
                        ? 'bg-blue-100 text-blue-800'
                        : q.level === 2
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    Mức {q.level}
                  </span>
                  <span className="bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                    {q.points}đ
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1 text-slate-400 hover:text-blue-700 rounded hover:bg-slate-100"
                    title="Chỉnh sửa câu hỏi"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Xóa câu hỏi ${q.code}?`)) {
                        deleteQuestionFromBank(q.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="text-xs font-semibold text-slate-800 mb-2 leading-relaxed whitespace-pre-line">
                {q.content}
              </div>

              {/* Options if MC */}
              {q.options && q.options.length > 0 && (
                <div className="space-y-1 text-xs mb-3">
                  {q.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`px-2 py-1 rounded text-[11px] flex items-center space-x-2 ${
                        opt.key === q.correctAnswer
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                          : 'text-slate-600'
                      }`}
                    >
                      <span className="w-4 font-bold">{opt.key}.</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Rubric */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="truncate">
                <strong>Đáp án:</strong> {q.correctAnswer}
              </div>
              <div className="truncate text-slate-400 mt-0.5">
                <strong>Chủ đề:</strong> {q.topic}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Question */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white font-bold text-sm flex items-center justify-between">
              <span>{editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới vào ngân hàng'}</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded font-medium"
                  >
                    <option value="Toán">Toán</option>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Tin học">Tin học</option>
                    <option value="Khoa học">Khoa học</option>
                    <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
                    <option value="Công nghệ">Công nghệ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(parseInt(e.target.value, 10) as GradeLevel)}
                    className="w-full p-2 bg-slate-50 border rounded font-medium"
                  >
                    <option value={1}>Lớp 1</option>
                    <option value={2}>Lớp 2</option>
                    <option value={3}>Lớp 3</option>
                    <option value={4}>Lớp 4</option>
                    <option value={5}>Lớp 5</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ nhận thức</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(parseInt(e.target.value, 10) as CognitiveLevel)}
                    className="w-full p-2 bg-slate-50 border rounded font-medium"
                  >
                    <option value={1}>Mức 1: Nhận biết</option>
                    <option value={2}>Mức 2: Kết nối</option>
                    <option value={3}>Mức 3: Vận dụng</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dạng câu hỏi</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as QuestionType)}
                    className="w-full p-2 bg-slate-50 border rounded font-medium"
                  >
                    <option value="multiple_choice">Trắc nghiệm 4 lựa chọn</option>
                    <option value="short_answer">Trả lời ngắn / Điền khuyết</option>
                    <option value="essay">Tự luận giải toán / Viết</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chủ đề / Mạch kiến thức</label>
                <input
                  type="text"
                  required
                  value={formTopic}
                  onChange={(e) => setFormTopic(e.target.value)}
                  placeholder="Ví dụ: Số có nhiều chữ số, Đo lường..."
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi</label>
                <textarea
                  required
                  rows={3}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Nhập nội dung đề bài..."
                  className="w-full p-2 bg-slate-50 border rounded"
                />
              </div>

              {formType === 'multiple_choice' && (
                <div className="space-y-2 border p-3 rounded-lg bg-slate-50">
                  <div className="font-bold text-slate-700">Các phương án lựa chọn:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Phương án A"
                      value={formOptA}
                      onChange={(e) => setFormOptA(e.target.value)}
                      className="p-1.5 bg-white border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Phương án B"
                      value={formOptB}
                      onChange={(e) => setFormOptB(e.target.value)}
                      className="p-1.5 bg-white border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Phương án C"
                      value={formOptC}
                      onChange={(e) => setFormOptC(e.target.value)}
                      className="p-1.5 bg-white border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Phương án D"
                      value={formOptD}
                      onChange={(e) => setFormOptD(e.target.value)}
                      className="p-1.5 bg-white border rounded"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <label className="font-bold text-slate-700">Đáp án đúng:</label>
                    <select
                      value={formCorrectAns}
                      onChange={(e) => setFormCorrectAns(e.target.value)}
                      className="p-1 border rounded font-bold text-emerald-700 bg-white"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Điểm số</label>
                  <input
                    type="number"
                    step={0.25}
                    value={formPoints}
                    onChange={(e) => setFormPoints(parseFloat(e.target.value) || 1.0)}
                    className="w-full p-2 bg-slate-50 border rounded font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hướng dẫn chấm / Barem</label>
                  <input
                    type="text"
                    value={formRubric}
                    onChange={(e) => setFormRubric(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Lưu vào ngân hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
