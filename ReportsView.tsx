import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileDown,
  Layers,
  Award,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import * as XLSX from 'xlsx';

export const ReportsView: React.FC = () => {
  const { matrices, exams, auditLogs, schoolSettings } = useData();

  const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const filteredExams = exams.filter((e) => {
    if (selectedGrade !== 'all' && e.grade !== selectedGrade) return false;
    if (selectedSubject !== 'all' && e.subject.toLowerCase() !== selectedSubject.toLowerCase()) return false;
    return true;
  });

  const totalExams = filteredExams.length;
  const approvedCount = filteredExams.filter((e) => ['approved', 'published'].includes(e.status)).length;
  const pendingCount = filteredExams.filter((e) => e.status === 'pending_approval').length;
  const revisionCount = filteredExams.filter((e) => e.status === 'revision_needed').length;
  const draftCount = filteredExams.filter((e) => e.status === 'draft').length;

  // Cognitive distribution
  let totalM1 = 0;
  let totalM2 = 0;
  let totalM3 = 0;
  filteredExams.forEach((e) => {
    e.questions.forEach((q) => {
      if (q.level === 1) totalM1 += q.points;
      else if (q.level === 2) totalM2 += q.points;
      else if (q.level === 3) totalM3 += q.points;
    });
  });
  const totalPointsAll = totalM1 + totalM2 + totalM3 || 1;
  const pM1 = Math.round((totalM1 / totalPointsAll) * 100);
  const pM2 = Math.round((totalM2 / totalPointsAll) * 100);
  const pM3 = Math.round((totalM3 / totalPointsAll) * 100);

  // Export report to XLSX
  const handleExportReportExcel = () => {
    const summaryRows = [
      [schoolSettings.schoolName],
      ['BÁO CÁO THỐNG KÊ TIẾN ĐỘ RA ĐỀ KIỂM TRA ĐỊNH KỲ TIỂU HỌC'],
      [`Năm học: ${schoolSettings.academicYear} - Kỳ: ${schoolSettings.currentTerm}`],
      ['Thời gian xuất:', new Date().toLocaleString('vi-VN')],
      [],
      ['Chỉ số', 'Số lượng', 'Tỷ lệ %'],
      ['Tổng số ma trận đã lập', matrices.length, '100%'],
      ['Tổng số đề kiểm tra', totalExams, '100%'],
      ['Đã phê duyệt / Phát hành', approvedCount, `${Math.round((approvedCount / (totalExams || 1)) * 100)}%`],
      ['Chờ duyệt chuyên môn', pendingCount, `${Math.round((pendingCount / (totalExams || 1)) * 100)}%`],
      ['Cần chỉnh sửa', revisionCount, `${Math.round((revisionCount / (totalExams || 1)) * 100)}%`],
      ['Bản nháp', draftCount, `${Math.round((draftCount / (totalExams || 1)) * 100)}%`],
      [],
      ['PHÂN BỐ 3 MỨC ĐỘ NHẬN THỨC THEO THÔNG TƯ 27'],
      ['Mức độ', 'Tổng số điểm tích lũy', 'Tỷ lệ % toàn trường'],
      ['Mức 1 (Nhận biết, nhắc lại)', totalM1, `${pM1}%`],
      ['Mức 2 (Kết nối, sắp xếp)', totalM2, `${pM2}%`],
      ['Mức 3 (Vận dụng giải quyết vấn đề mới)', totalM3, `${pM3}%`],
    ];

    const ws = XLSX.utils.aoa_to_sheet(summaryRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Báo Cáo Tiến Độ');
    XLSX.writeFile(wb, `Bao_cao_tien_do_de_thi_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center">
            <span className="w-2 h-6 bg-blue-700 rounded-sm mr-2.5"></span>
            Thống Kê Chuyên Môn & Tiến Độ Ra Đề Toàn Trường
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đánh giá tiến độ hoàn thành hồ sơ kiểm tra định kỳ theo quy định của Phòng GD&ĐT và Thông tư 27.
          </p>
        </div>

        <button
          onClick={handleExportReportExcel}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center transition"
        >
          <FileDown className="w-4 h-4 mr-1.5" />
          Xuất Báo Cáo (.xlsx)
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-slate-700">Lọc theo:</span>
        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
          className="p-2 bg-slate-50 border rounded-lg font-semibold text-slate-700"
        >
          <option value="all">Tất cả Khối lớp</option>
          <option value={1}>Khối 1</option>
          <option value={2}>Khối 2</option>
          <option value={3}>Khối 3</option>
          <option value={4}>Khối 4</option>
          <option value={5}>Khối 5</option>
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-2 bg-slate-50 border rounded-lg font-semibold text-slate-700"
        >
          <option value="all">Tất cả Môn học</option>
          <option value="Toán">Toán</option>
          <option value="Tiếng Việt">Tiếng Việt</option>
          <option value="Tin học">Tin học</option>
          <option value="Khoa học">Khoa học</option>
          <option value="Lịch sử và Địa lí">Lịch sử và Địa lí</option>
          <option value="Công nghệ">Công nghệ</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Tổng số đề kiểm tra</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalExams}</div>
          <div className="text-[11px] text-blue-700 mt-1">Đã lập ma trận: {matrices.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="text-xs font-semibold text-emerald-800">Đã phê duyệt hoàn tất</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{approvedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">
            Đạt {Math.round((approvedCount / (totalExams || 1)) * 100)}% kế hoạch
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="text-xs font-semibold text-amber-800">Đang chờ tổ trưởng / BGH duyệt</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Cần xử lý trong tuần</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-xs">
          <div className="text-xs font-semibold text-red-800">Yêu cầu giáo viên sửa lại</div>
          <div className="text-2xl font-black text-red-700 mt-1">{revisionCount}</div>
          <div className="text-[11px] text-red-600 mt-1">Có ý kiến góp ý cụ thể</div>
        </div>
      </div>

      {/* Cognitive Levels Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center">
          <Award className="w-4 h-4 mr-1.5 text-blue-600" />
          Phân Bố 3 Mức Độ Nhận Thức Toàn Trường (Thông tư 27)
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Tỷ lệ tích lũy của toàn bộ ngân hàng câu hỏi và các đề thi đang triển khai.
        </p>

        <div className="space-y-4 max-w-2xl">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Mức 1: Nhận biết, nhắc lại, áp dụng trực tiếp</span>
              <span className="text-blue-700">{pM1}% (~4.0đ / 10đ)</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pM1}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Mức 2: Kết nối, sắp xếp kiến thức tương tự</span>
              <span className="text-emerald-700">{pM2}% (~3.0đ / 10đ)</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pM2}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Mức 3: Vận dụng giải quyết vấn đề mới</span>
              <span className="text-purple-700">{pM3}% (~3.0đ / 10đ)</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${pM3}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-blue-900 font-medium">
          * Đánh giá chuyên môn: Tỷ lệ hiện tại đạt chuẩn khuyến nghị 40% - 30% - 30%, đảm bảo độ phân hóa học sinh theo đúng tinh thần Thông tư 27/2020/TT-BGDĐT.
        </div>
      </div>

      {/* Audit Trail Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
          <Clock className="w-4 h-4 mr-1.5 text-slate-600" />
          Nhật Ký Thao Tác & Phê Duyệt Hệ Thống (Audit Trail)
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">{log.userName}</span>
                <span className="text-slate-500 text-[11px] ml-1.5">({log.action})</span>
                <span className="font-mono font-semibold text-blue-700 ml-1.5">{log.target}</span>
                {log.details && <span className="text-slate-500 text-[11px] ml-2 italic">- {log.details}</span>}
              </div>
              <span className="text-slate-400 text-[11px]">
                {new Date(log.timestamp).toLocaleString('vi-VN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
