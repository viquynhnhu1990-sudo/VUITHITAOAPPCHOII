import React from 'react';
import { Users2, GraduationCap, Award, BookOpen, Mail, UserCheck } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export const DepartmentsView: React.FC = () => {
  const { schoolSettings } = useData();
  const { allUsers } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center">
          <span className="w-2 h-6 bg-blue-700 rounded-sm mr-2.5"></span>
          Tổ Chuyên Môn & Phân Công Nhiệm Vụ Ra Đề
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cơ cấu các tổ chuyên môn Khối 1, Khối 2-3, Khối 4-5 và Tổ Ngoại ngữ - Tin học tại {schoolSettings.schoolName}.
        </p>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {schoolSettings.departments.map((dept) => {
          const members = allUsers.filter(
            (u) =>
              (dept.id === 'to_4_5' && (u.role === 'dept_head' || u.role === 'teacher')) ||
              (dept.id === 'to_1' && u.title.includes('Khối 1'))
          );

          return (
            <div key={dept.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                    <div className="text-[11px] text-slate-500">Tổ trưởng: <strong>{dept.headTeacher}</strong></div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Hoạt động
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="text-slate-600 font-bold text-[11px] uppercase tracking-wider">
                  Nhiệm vụ chuyên môn:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>Xây dựng ma trận đề kiểm tra định kỳ đúng chuẩn Thông tư 27.</li>
                  <li>Tổ chức thẩm định, sinh đề tương đương và phản biện nội dung câu hỏi.</li>
                  <li>Duyệt hướng dẫn chấm, biểu điểm và phân loại học sinh.</li>
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Quy mô: 6 - 8 giáo viên</span>
                <span className="text-blue-700 font-semibold cursor-pointer hover:underline text-[11px]">
                  Xem danh sách đề của tổ →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
