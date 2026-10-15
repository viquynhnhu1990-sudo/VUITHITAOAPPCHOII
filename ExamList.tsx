import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  FileDown,
  Archive,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PERIOD_NAMES } from '../../data/curriculumData';
import { exportExamDocx, exportAnswerKeyDocx, exportFullDossierZip } from '../../utils/exportUtils';
import { Exam } from '../../types';

interface ExamListProps {
  onOpenExam: (examId: string) => void;
  onCreateNew: () => void;
}

export const ExamList: React.FC<ExamListProps> = ({ onOpenExam, onCreateNew }) => {
  const { exams, matrices, deleteExam } = useData();
  const { currentUser, canViewExamDetails } = useAuth();

  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredExams = exams.filter((e) => {
    if (!canViewExamDetails(e)) return false;
    if (filterGrade !== 'all' && e.grade !== filterGrade) return false;
    if (filterSubject !== 'all' && e.subject.toLowerCase() !== filterSubject.toLowerCase()) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!e.code.toLowerCase().includes(q) && !e.title.toLowerCase().includes(q) && !e.creatorName.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleDownloadZip = (exam: Exam) => {
    const matrix = matrices.find((m) => m.id === exam.matrixId) || matrices[0];
    if (matrix) exportFullDossierZip(matrix, exam);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center">
            <span className="w-2 h-6 bg-blue-700 rounded-sm mr-2.5"></span>
            Quản Lý Hồ Sơ Đề Kiểm Tra Định Kỳ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Toàn bộ đề thi định kỳ của trường, quản lý trạng thái phê duyệt và xuất trọn bộ hồ sơ.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Soạn đề thi mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đề, tên bài kiểm tra, giáo viên ra đề..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
          >
            <option value="all">Tất cả Môn</option>
            <option value="Toán">Toán</option>
            <option value="Tiếng Việt">Tiếng Việt</option>
            <option value="Tin học">Tin học</option>
            <option value="Khoa học">Khoa học</option>
            <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
            <option value="Công nghệ">Công nghệ</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="pending_approval">Chờ duyệt</option>
            <option value="approved">Đã phê duyệt</option>
            <option value="published">Đã phát hành</option>
            <option value="revision_needed">Cần sửa</option>
          </select>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Mã đề</th>
              <th className="py-3 px-4">Môn học</th>
              <th className="py-3 px-4">Lớp</th>
              <th className="py-3 px-4">Thời điểm</th>
              <th className="py-3 px-4">Người tạo</th>
              <th className="py-3 px-4">Ngày sửa</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Xuất tài liệu</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExams.map((exam) => {
              const statusBadge = {
                draft: { text: 'Bản nháp', class: 'bg-slate-100 text-slate-700 border-slate-200' },
                pending_approval: { text: 'Chờ duyệt', class: 'bg-amber-100 text-amber-800 border-amber-200' },
                revision_needed: { text: 'Cần sửa', class: 'bg-red-100 text-red-800 border-red-200' },
                approved: { text: 'Đã duyệt', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                published: { text: 'Đã phát hành', class: 'bg-blue-100 text-blue-800 border-blue-200' },
                archived: { text: 'Lưu trữ', class: 'bg-slate-100 text-slate-500 border-slate-200' },
              }[exam.status];

              return (
                <tr key={exam.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    {exam.code}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {exam.subject}
                  </td>
                  <td className="py-3.5 px-4 font-medium">
                    Lớp {exam.grade}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {PERIOD_NAMES[exam.period]}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {exam.creatorName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(exam.updatedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.class}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => exportExamDocx(exam, 'A')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold"
                        title="Tải Word Đề thi học sinh"
                      >
                        Đề (.docx)
                      </button>
                      <button
                        onClick={() => exportAnswerKeyDocx(exam, 'A')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold"
                        title="Tải Word Đáp án & Barem"
                      >
                        Đáp án (.docx)
                      </button>
                      <button
                        onClick={() => handleDownloadZip(exam)}
                        className="p-1 text-purple-700 hover:bg-purple-100 rounded"
                        title="Tải trọn bộ hồ sơ (ZIP)"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onOpenExam(exam.id)}
                        className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                        title="Xem & Chỉnh sửa đề"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {exam.status === 'draft' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Xác nhận xóa đề kiểm tra ${exam.code}?`)) {
                              deleteExam(exam.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                          title="Xóa đề nháp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
