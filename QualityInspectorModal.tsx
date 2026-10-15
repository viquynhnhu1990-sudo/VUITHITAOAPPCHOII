import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  FileText,
  Printer,
} from 'lucide-react';
import { QualityInspectionReport } from '../../types';

interface QualityInspectorModalProps {
  report: QualityInspectionReport | null;
  isOpen: boolean;
  onClose: () => void;
  examCode: string;
  subject: string;
  grade: number;
}

export const QualityInspectorModal: React.FC<QualityInspectorModalProps> = ({
  report,
  isOpen,
  onClose,
  examCode,
  subject,
  grade,
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/80 flex items-center justify-center border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <span>Hệ Thống Kiểm Tra Chất Lượng Đề Thi (AI Quality Audit)</span>
              </h2>
              <div className="text-xs text-blue-200">
                Mã đề: <span className="font-mono font-semibold">{examCode}</span> • Môn {subject} Lớp {grade}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score and summary pill */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="text-center px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-xs">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Điểm chất lượng</div>
              <div
                className={`text-xl font-black ${
                  report.score >= 90 ? 'text-emerald-600' : report.score >= 70 ? 'text-amber-600' : 'text-red-600'
                }`}
              >
                {report.score}/100
              </div>
            </div>

            <div className="space-y-1">
              <div className="font-semibold text-slate-800 flex items-center space-x-2">
                <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {report.passedCount} Đạt
                </span>
                <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> {report.warningCount} Cảnh báo
                </span>
                {report.criticalCount > 0 && (
                  <span className="inline-flex items-center text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    <XCircle className="w-3.5 h-3.5 mr-1" /> {report.criticalCount} Lỗi nghiêm trọng
                  </span>
                )}
              </div>
              <div className="text-slate-600 text-[11px] max-w-md">{report.summary}</div>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-500">
            <div>Kiểm duyệt bởi: <strong>{report.inspector}</strong></div>
            <div>Thời gian: {new Date(report.inspectedAt).toLocaleString('vi-VN')}</div>
          </div>
        </div>

        {/* 20 Criteria Checklist */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
            Chi tiết 20 tiêu chí kiểm tra theo chuẩn Thông tư 27:
          </div>

          <div className="grid grid-cols-1 gap-2">
            {report.items.map((item) => {
              const statusConfig = {
                passed: {
                  icon: CheckCircle2,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50/50 border-emerald-200',
                  badge: 'ĐẠT',
                },
                warning: {
                  icon: AlertTriangle,
                  color: 'text-amber-600',
                  bg: 'bg-amber-50/50 border-amber-200',
                  badge: 'LƯU Ý',
                },
                critical: {
                  icon: XCircle,
                  color: 'text-red-600',
                  bg: 'bg-red-50/60 border-red-300',
                  badge: 'LỖI',
                },
                unverifiable: {
                  icon: HelpCircle,
                  color: 'text-slate-500',
                  bg: 'bg-slate-50 border-slate-200',
                  badge: 'CẦN XÁC MINH',
                },
              }[item.status];

              const Icon = statusConfig.icon;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex items-start space-x-3 transition ${statusConfig.bg}`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${statusConfig.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800">
                        {item.id}. {item.title}
                      </div>
                      <span className={`text-[10px] font-black uppercase ${statusConfig.color}`}>
                        {statusConfig.badge}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{item.message}</div>
                    {item.detail && (
                      <div className="text-[10px] text-red-600 font-semibold mt-1">
                        Chi tiết: {item.detail}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 italic">
            * Lưu ý: Kết quả AI kiểm tra hỗ trợ thẩm định, không thay thế chữ ký duyệt của Ban Giám hiệu.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            Đóng báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};
