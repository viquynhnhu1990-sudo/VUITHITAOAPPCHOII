import React, { useState } from 'react';
import {
  Settings2,
  Save,
  RotateCcw,
  Shield,
  School,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { SchoolSettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { schoolSettings, updateSchoolSettings, resetToSampleData, matrices, exams } = useData();
  const { currentUser, canManageSettings } = useAuth();

  const [formData, setFormData] = useState<SchoolSettings>(schoolSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Backup data
  const handleBackup = () => {
    const backupData = {
      schoolSettings,
      matrices,
      exams,
      exportedAt: new Date().toISOString(),
      system: 'EDU TEST MATRIX AI',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sao_luu_EduMatrix_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center">
            <span className="w-2 h-6 bg-blue-700 rounded-sm mr-2.5"></span>
            Cài Đặt Hệ Thống Toàn Trường
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập thông tin trường học, cấu hình quy tắc kiểm tra và phân quyền chuyên môn.
          </p>
        </div>

        {!canManageSettings() && (
          <div className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            Chỉ Quản trị viên mới có quyền thay đổi cấu hình trường.
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Đã lưu thành công các cài đặt trường học vào cơ sở dữ liệu bền vững!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 text-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center">
            <School className="w-4 h-4 mr-1.5 text-blue-600" />
            Thông Tin Trường Học & Năm Học
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên trường tiểu học</label>
            <input
              type="text"
              disabled={!canManageSettings()}
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border rounded-lg font-semibold text-slate-800 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Cơ quan chủ quản / Đơn vị quản lý</label>
            <input
              type="text"
              disabled={!canManageSettings()}
              value={formData.governingBody}
              onChange={(e) => setFormData({ ...formData, governingBody: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border rounded-lg font-semibold text-slate-800 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Năm học áp dụng</label>
            <input
              type="text"
              disabled={!canManageSettings()}
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border rounded-lg font-semibold text-slate-800 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Học kỳ hiện tại</label>
            <select
              disabled={!canManageSettings()}
              value={formData.currentTerm}
              onChange={(e) => setFormData({ ...formData, currentTerm: e.target.value as any })}
              className="w-full p-2.5 bg-slate-50 border rounded-lg font-semibold text-slate-800 disabled:opacity-60"
            >
              <option value="HK1">Học kỳ I (Bao gồm Giữa HKI & Cuối HKI)</option>
              <option value="HK2">Học kỳ II (Bao gồm Giữa HKII & Cuối năm)</option>
            </select>
          </div>
        </div>

        {/* Legal Enforcement section */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-900">Quy Tắc Đánh Giá Định Kỳ (Thông tư 27)</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.strictTT27Enforcement}
                disabled
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-semibold text-slate-800">
                Bắt buộc tuân thủ Thông tư 27/2020/TT-BGDĐT (Tổng điểm bằng 10.0, chỉ 3 mức độ nhận thức, chỉ các môn có bài kiểm tra định kỳ)
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!formData.allowCustomDecimals}
                disabled
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-semibold text-slate-800">
                Không cho điểm thập phân ở kết quả bài kiểm tra định kỳ (Điểm tổng toàn bài là số nguyên từ 0 đến 10)
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        {canManageSettings() && (
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs inline-flex items-center transition"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Lưu cấu hình toàn trường
            </button>
          </div>
        )}
      </form>

      {/* Backup and Restore Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center">
          <Download className="w-4 h-4 mr-1.5 text-blue-600" />
          Sao Lưu & Phục Hồi Dữ Liệu
        </h3>
        <p className="text-slate-500">
          Xuất toàn bộ ma trận, đề kiểm tra và cài đặt hệ thống về máy tính để lưu trữ an toàn hoặc chuyển giao dữ liệu.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleBackup}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition inline-flex items-center"
          >
            <Download className="w-4 h-4 mr-1.5 text-blue-700" />
            Tải bản sao lưu JSON
          </button>

          <button
            onClick={() => {
              if (window.confirm('Khôi phục toàn bộ cấu hình và dữ liệu mẫu chuẩn của Thông tư 27?')) {
                resetToSampleData();
                alert('Đã khôi phục dữ liệu chuẩn thành công!');
              }
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-lg transition inline-flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-1.5 text-red-600" />
            Khôi phục dữ liệu mẫu chuẩn
          </button>
        </div>
      </div>
    </div>
  );
};
