import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  Eye,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PERIOD_NAMES } from '../../data/curriculumData';
import { Exam, Matrix } from '../../types';

interface ReviewManagementProps {
  onOpenExam: (examId: string) => void;
  onOpenMatrix: (matrixId: string) => void;
}

export const ReviewManagement: React.FC<ReviewManagementProps> = ({
  onOpenExam,
  onOpenMatrix,
}) => {
  const { matrices, exams, reviewComments, addReviewComment, getReviewCommentsFor } = useData();
  const { currentUser, canApproveExam, canApproveMatrix, canPublishExam } = useAuth();

  const [activeTab, setActiveTab] = useState<'exams' | 'matrices'>('exams');
  const [selectedTarget, setSelectedTarget] = useState<{ id: string; type: 'exam' | 'matrix' } | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Handle Review Decision (Phê duyệt / Trả lại cần sửa / Phát hành)
  const handleDecision = (action: 'approve' | 'reject' | 'publish') => {
    if (!selectedTarget) return;

    if (!reviewNote.trim()) {
      alert('Vui lòng ghi nhận xét / ý kiến chuyên môn của người duyệt.');
      return;
    }

    addReviewComment({
      targetId: selectedTarget.id,
      targetType: selectedTarget.type,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      content: reviewNote,
      action,
    });

    setReviewNote('');
    alert(
      action === 'approve'
        ? 'Đã phê duyệt hồ sơ thành công!'
        : action === 'publish'
        ? 'Đã phê duyệt và phát hành đề thi chính thức!'
        : 'Đã gửi yêu cầu chỉnh sửa kèm ý kiến góp ý đến giáo viên ra đề!'
    );
  };

  const pendingExams = exams.filter((e) => e.status === 'pending_approval');
  const approvedExams = exams.filter((e) => ['approved', 'published'].includes(e.status));
  const revisionExams = exams.filter((e) => e.status === 'revision_needed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center">
            <span className="w-2 h-6 bg-blue-700 rounded-sm mr-2.5"></span>
            Hội Đồng Thẩm Định & Phê Duyệt Chuyên Môn
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Quy trình phê duyệt hai cấp: Tổ trưởng chuyên môn và Ban Giám hiệu theo Thông tư 27.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab('exams');
              setSelectedTarget(null);
            }}
            className={`px-4 py-1.5 rounded-md transition ${
              activeTab === 'exams' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đề kiểm tra ({exams.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('matrices');
              setSelectedTarget(null);
            }}
            className={`px-4 py-1.5 rounded-md transition ${
              activeTab === 'matrices' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ma trận ({matrices.length})
          </button>
        </div>
      </div>

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: List of items to review */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === 'exams' ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Danh sách Đề kiểm tra thẩm định</span>
                <span className="text-blue-600 font-semibold lowercase">
                  {pendingExams.length} đề đang chờ duyệt
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {exams.map((exam) => {
                  const isSelected = selectedTarget?.id === exam.id;
                  const comments = getReviewCommentsFor(exam.id);

                  const statusBadge = {
                    draft: { text: 'Bản nháp', color: 'bg-slate-100 text-slate-700 border-slate-200' },
                    pending_approval: { text: 'Chờ duyệt', color: 'bg-amber-100 text-amber-800 border-amber-200' },
                    revision_needed: { text: 'Cần sửa', color: 'bg-red-100 text-red-800 border-red-200' },
                    approved: { text: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                    published: { text: 'Đã phát hành', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                    archived: { text: 'Lưu trữ', color: 'bg-slate-100 text-slate-500 border-slate-200' },
                  }[exam.status];

                  return (
                    <div
                      key={exam.id}
                      onClick={() => setSelectedTarget({ id: exam.id, type: 'exam' })}
                      className={`p-4 cursor-pointer transition hover:bg-blue-50/50 ${
                        isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-blue-700">{exam.code}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(exam.updatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 mt-1">
                        Môn {exam.subject} - Lớp {exam.grade} • {PERIOD_NAMES[exam.period]}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>Người ra đề: <strong>{exam.creatorName}</strong></span>
                        <div className="flex items-center space-x-2">
                          {comments.length > 0 && (
                            <span className="flex items-center text-slate-600">
                              <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-400" />
                              {comments.length} ý kiến
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenExam(exam.id);
                            }}
                            className="text-blue-700 hover:underline font-semibold"
                          >
                            Xem đề →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-700 uppercase tracking-wider">
                Danh sách Ma trận kiểm tra
              </div>
              <div className="divide-y divide-slate-100">
                {matrices.map((m) => {
                  const isSelected = selectedTarget?.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedTarget({ id: m.id, type: 'matrix' })}
                      className={`p-4 cursor-pointer transition hover:bg-blue-50/50 ${
                        isSelected ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-700">{m.code}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.status === 'approved' ? 'Đã duyệt' : 'Bản nháp'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1">
                        Ma trận {m.subject} Lớp {m.grade} - {PERIOD_NAMES[m.period]}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                        <span>Người lập: {m.creatorName}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMatrix(m.id);
                          }}
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          Chi tiết →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Reviewer Action Panel */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-blue-600" />
              Bàn Thẩm Định & Phê Duyệt
            </h3>
            <p className="text-slate-500 mb-4">
              Người duyệt: <strong>{currentUser.name}</strong> ({currentUser.title})
            </p>

            {selectedTarget ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Đang chọn thẩm định:</div>
                  <div className="font-bold text-slate-800 text-xs mt-0.5 font-mono">{selectedTarget.id}</div>
                </div>

                {/* History of review comments */}
                <div>
                  <div className="font-bold text-slate-700 mb-2">Ý kiến góp ý đã ghi nhận:</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {getReviewCommentsFor(selectedTarget.id).length === 0 ? (
                      <div className="text-slate-400 italic text-[11px]">Chưa có nhận xét nào.</div>
                    ) : (
                      getReviewCommentsFor(selectedTarget.id).map((c) => (
                        <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg border text-[11px]">
                          <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                            <span>{c.authorName} ({c.authorRole})</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                                c.action === 'approve'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : c.action === 'publish'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {c.action}
                            </span>
                          </div>
                          <div className="text-slate-600 whitespace-pre-line">{c.content}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(c.createdAt).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Feedback Input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ghi nhận xét / Yêu cầu chỉnh sửa:
                  </label>
                  <textarea
                    rows={4}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Nhập nhận xét về ma trận, tính chính xác câu hỏi, barem chấm hoặc lý do yêu cầu chỉnh sửa..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Review Decision Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDecision('reject')}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-xs transition"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1 inline" />
                      Yêu cầu sửa
                    </button>

                    <button
                      onClick={() => handleDecision('approve')}
                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 inline" />
                      Phê duyệt đề
                    </button>
                  </div>

                  {canPublishExam() && (
                    <button
                      onClick={() => handleDecision('publish')}
                      className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-xs transition shadow-xs flex items-center justify-center"
                    >
                      <Lock className="w-3.5 h-3.5 mr-1.5" />
                      Phê duyệt & Phát hành chính thức (Khóa đề)
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <FileCheck2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <span>Chọn một hồ sơ ở danh sách bên trái để thẩm định và phê duyệt.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
