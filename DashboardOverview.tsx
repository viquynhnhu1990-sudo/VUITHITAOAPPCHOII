import React from 'react';
import {
  Grid3X3,
  FileSpreadsheet,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Users,
  PlusCircle,
  FileDown,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PERIOD_NAMES } from '../../data/curriculumData';
import { ActiveTab } from '../layout/Sidebar';
import { exportFullDossierZip, exportExamDocx, exportMatrixDocx, exportMatrixXlsx } from '../../utils/exportUtils';
import { Exam } from '../../types';

interface DashboardOverviewProps {
  onNavigate: (tab: ActiveTab) => void;
  onSelectExam: (examId: string) => void;
  onSelectMatrix: (matrixId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onSelectExam,
  onSelectMatrix,
}) => {
  const { matrices, exams, schoolSettings } = useData();
  const { currentUser } = useAuth();

  // Real calculations
  const totalMatrices = matrices.length;
  const draftExams = exams.filter((e) => e.status === 'draft').length;
  const pendingExams = exams.filter((e) => e.status === 'pending_approval').length;
  const approvedExams = exams.filter((e) => ['approved', 'published'].includes(e.status)).length;
  const revisionExams = exams.filter((e) => e.status === 'revision_needed').length;

  // Grade distributions
  const gradeCounts = [1, 2, 3, 4, 5].map((g) => ({
    grade: `Lớp ${g}`,
    count: exams.filter((e) => e.grade === g).length,
  }));

  // Subject distributions
  const subjects = ['Toán', 'Tiếng Việt', 'Tin học', 'Khoa học', 'Lịch sử và Địa lí', 'Công nghệ', 'Ngoại ngữ 1'];
  const subjectCounts = subjects.map((sub) => ({
    subject: sub,
    count: exams.filter((e) => e.subject.toLowerCase() === sub.toLowerCase()).length,
  }));

  const handleQuickDownloadZip = async (exam: Exam) => {
    const matrix = matrices.find((m) => m.id === exam.matrixId) || matrices[0];
    if (matrix) {
      await exportFullDossierZip(matrix, exam);
    } else {
      await exportExamDocx(exam);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <span>Hệ thống tạo ma trận & đề kiểm tra định kỳ tiểu học</span>
            <span>•</span>
            <span className="text-emerald-300 font-bold">Chuẩn Thông tư 27/2020/TT-BGDĐT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {currentUser.name}!
          </h1>
          <p className="mt-1.5 text-blue-100 text-sm leading-relaxed">
            Hệ thống hỗ trợ chuyên môn cho toàn bộ Khối 1 đến Khối 5. Đảm bảo cấu trúc 3 mức độ nhận thức, tổng điểm 10.0 không làm tròn thập phân và đồng bộ ma trận với đề kiểm tra.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('matrix_wizard')}
              className="inline-flex items-center px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs sm:text-sm rounded-lg shadow transition"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Tạo ma trận mới
            </button>
            <button
              onClick={() => onNavigate('exam_creator')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-lg shadow transition"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1.5" />
              Soạn đề từ ma trận
            </button>
            <button
              onClick={() => onNavigate('reviews')}
              className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm rounded-lg border border-white/20 transition"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
              Xem hồ sơ chờ duyệt ({pendingExams})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* KPI 1: Khối lớp */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Khối lớp</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">5</div>
          <div className="text-[11px] text-slate-500 mt-1">Lớp 1 đến Lớp 5</div>
        </div>

        {/* KPI 2: Giáo viên */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Giáo viên</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">24</div>
          <div className="text-[11px] text-slate-500 mt-1">4 Tổ chuyên môn</div>
        </div>

        {/* KPI 3: Ma trận đã tạo */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Ma trận đã tạo</span>
            <Grid3X3 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-700">{totalMatrices}</div>
          <div className="text-[11px] text-indigo-500 mt-1">Đã xác nhận: {matrices.filter(m => m.status === 'approved').length}</div>
        </div>

        {/* KPI 4: Đề nháp */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Đề đang soạn</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-700">{draftExams}</div>
          <div className="text-[11px] text-slate-500 mt-1">Lưu trữ trên máy</div>
        </div>

        {/* KPI 5: Chờ duyệt */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Đề chờ duyệt</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{pendingExams}</div>
          <div className="text-[11px] text-amber-600 mt-1">Cần chuyên môn duyệt</div>
        </div>

        {/* KPI 6: Đã duyệt */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-medium">
            <span>Đề đã duyệt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">{approvedExams}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Sẵn sàng in ấn & thi</div>
        </div>

        {/* KPI 7: Cần sửa */}
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/30 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-red-700 text-xs font-medium">
            <span>Cần chỉnh sửa</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-red-700">{revisionExams}</div>
          <div className="text-[11px] text-red-600 mt-1">Góp ý từ tổ trưởng</div>
        </div>
      </div>

      {/* Analytics & Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Theo khối lớp */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-1.5 text-blue-600" />
              Số lượng đề theo Khối lớp
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Khối 1 - 5</span>
          </div>

          <div className="space-y-3">
            {gradeCounts.map((g) => {
              const max = Math.max(...gradeCounts.map((x) => x.count), 1);
              const pct = (g.count / max) * 100;
              return (
                <div key={g.grade}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>{g.grade}</span>
                    <span className="font-bold text-blue-700">{g.count} đề</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Theo Môn học */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-600" />
              Số lượng đề theo Môn học
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Định kỳ TT27</span>
          </div>

          <div className="space-y-2.5">
            {subjectCounts.slice(0, 5).map((s) => {
              const max = Math.max(...subjectCounts.map((x) => x.count), 1);
              const pct = (s.count / max) * 100;
              return (
                <div key={s.subject}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span className="truncate">{s.subject}</span>
                    <span className="font-bold text-emerald-700">{s.count} đề</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 6)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Chuẩn 3 Mức Độ Thông tư 27 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-blue-600" />
              Cấu trúc 3 Mức độ Nhận thức
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Theo Thông tư 27/2020/TT-BGDĐT, câu hỏi kiểm tra định kỳ tiểu học phân đúng 3 mức, tỷ lệ do nhà trường quy định (thông thường 4:3:3).
            </p>

            <div className="space-y-3">
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-xs">
                <div className="font-bold text-blue-900">Mức 1: Nhận biết, nhắc lại (~40%)</div>
                <div className="text-slate-600 text-[11px]">Mô tả, áp dụng trực tiếp kiến thức đã học.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs">
                <div className="font-bold text-emerald-900">Mức 2: Kết nối, sắp xếp (~30%)</div>
                <div className="text-slate-600 text-[11px]">Giải quyết các vấn đề tương tự trong học tập.</div>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-100 text-xs">
                <div className="font-bold text-purple-900">Mức 3: Vận dụng sáng tạo (~30%)</div>
                <div className="text-slate-600 text-[11px]">Giải quyết vấn đề mới hoặc phản hồi thực tiễn.</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-medium">
            <span>Thang điểm: 10.0 (Không điểm lẻ tổng)</span>
            <span className="text-blue-700 font-semibold cursor-pointer hover:underline" onClick={() => onNavigate('guide')}>
              Xem văn bản hướng dẫn →
            </span>
          </div>
        </div>
      </div>

      {/* Recent Exams Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Hồ sơ Đề kiểm tra gần đây</h2>
            <p className="text-xs text-slate-500">Dữ liệu thực tế được lưu trên cơ sở dữ liệu hệ thống</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('exam_list')}
              className="text-xs text-blue-700 hover:text-blue-800 font-semibold inline-flex items-center"
            >
              <span>Xem toàn bộ đề ({exams.length})</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Chưa có đề kiểm tra nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Hãy bắt đầu bằng cách tạo một ma trận mới hoặc sinh đề kiểm tra từ ngân hàng chuẩn.
            </p>
            <button
              onClick={() => onNavigate('matrix_wizard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              Tạo ma trận đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Mã đề</th>
                  <th className="py-3 px-4">Môn học</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4">Thời điểm</th>
                  <th className="py-3 px-4">Người tạo</th>
                  <th className="py-3 px-4">Cập nhật</th>
                  <th className="py-3 px-4">Phiên bản</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.slice(0, 5).map((exam) => {
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
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {exam.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {exam.subject}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        Lớp {exam.grade}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {PERIOD_NAMES[exam.period]}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {exam.creatorName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(exam.updatedAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {exam.version}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.class}`}>
                          {statusBadge.text}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              onSelectExam(exam.id);
                              onNavigate('exam_creator');
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Xem chi tiết & chỉnh sửa"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleQuickDownloadZip(exam)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Tải trọn bộ hồ sơ (ZIP)"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
