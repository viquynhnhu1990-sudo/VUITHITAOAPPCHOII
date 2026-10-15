import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Layers,
  FileDown,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const UserGuideView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center">
          <span className="w-2 h-6 bg-blue-700 rounded-sm mr-2.5"></span>
          Cẩm Nang Hướng Dẫn Sử Dụng & Quy Chuẩn Chuyên Môn
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Tài liệu hướng dẫn dành cho Giáo viên, Tổ trưởng chuyên môn và Ban Giám hiệu trường tiểu học.
        </p>
      </div>

      {/* Section 1: Thông tư 27 cốt lõi */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 flex items-center text-blue-900">
          <Award className="w-4 h-4 mr-1.5 text-blue-700" />
          I. NGUYÊN TẮC PHÁP LÝ BẮT BUỘC (THÔNG TƯ 27/2020/TT-BGDĐT)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
            <div className="font-bold text-blue-900 text-xs">1. Mức 1: Nhận biết, nhắc lại</div>
            <div className="text-slate-600 leading-relaxed text-[11px]">
              Học sinh nhận biết, nhắc lại hoặc mô tả được kiến thức, kĩ năng đã học; áp dụng trực tiếp để giải quyết tình huống, vấn đề quen thuộc trong học tập.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-900 text-xs">2. Mức 2: Kết nối, sắp xếp</div>
            <div className="text-slate-600 leading-relaxed text-[11px]">
              Học sinh kết nối, sắp xếp được một số nội dung đã học để giải quyết vấn đề có nội dung tương tự hoặc tình huống bài tập mới một bước.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-1.5">
            <div className="font-bold text-purple-900 text-xs">3. Mức 3: Vận dụng sáng tạo</div>
            <div className="text-slate-600 leading-relaxed text-[11px]">
              Học sinh vận dụng được các kiến thức, kĩ năng để giải quyết các vấn đề mới hoặc đưa ra những phản hồi hợp lý trong học tập, cuộc sống.
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2 mt-4 text-slate-800">
          <div className="font-bold text-amber-900 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600" />
            LƯU Ý CỰC KỲ QUAN TRỌNG VỀ THỜI ĐIỂM VÀ MÔN HỌC KIỂM TRA:
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
            <li>
              <strong>Bài kiểm tra định kỳ Giữa kỳ (Giữa HKI & Giữa HKII):</strong> Theo Điều 7 Thông tư 27, CHỈ tổ chức cho học sinh <strong>Lớp 4 và Lớp 5</strong> với 02 môn: <strong>Toán và Tiếng Việt</strong>. Lớp 1, 2, 3 và các môn học khác không có bài kiểm tra giữa kỳ bằng điểm số.
            </li>
            <li>
              <strong>Thang điểm và làm tròn:</strong> Bài kiểm tra định kỳ đánh giá bằng điểm số theo thang điểm 10, không cho điểm thập phân ở điểm toàn bài kiểm tra định kỳ.
            </li>
            <li>
              <strong>Không xếp hạng:</strong> Tuyệt đối không sử dụng điểm kiểm tra định kỳ để so sánh hay xếp hạng giữa các học sinh.
            </li>
          </ul>
        </div>
      </div>

      {/* Section 2: Hướng dẫn 4 bước lập ma trận */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 flex items-center text-blue-900">
          <Layers className="w-4 h-4 mr-1.5 text-blue-700" />
          II. QUY TRÌNH 4 BƯỚC XÂY DỰNG MA TRẬN TRÊN PHẦN MỀM
        </h2>

        <div className="space-y-3 pt-2">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
              1
            </div>
            <div>
              <div className="font-bold text-slate-800">Bước 1: Chọn Thông tin chung</div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                Chọn khối lớp, môn học, thời điểm kiểm tra. Hệ thống tự động khóa và giải thích nếu môn học hoặc thời điểm không hợp lệ theo Thông tư 27.
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
              2
            </div>
            <div>
              <div className="font-bold text-slate-800">Bước 2: Xác định Phạm vi kiểm tra & Tài liệu</div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                Tải lên tệp phân phối chương trình / đề cương bài dạy hoặc nhập thủ công các mạch kiến thức và yêu cầu cần đạt trọng tâm.
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
              3
            </div>
            <div>
              <div className="font-bold text-slate-800">Bước 3: Thiết lập Cấu hình ma trận</div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                Chọn chức năng <strong>"AI Đề xuất ma trận chuẩn"</strong> để hệ thống tự tính toán phân bổ điểm 4:3:3 cân bằng, hoặc tự nhập tay theo mẫu của trường.
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-xs">
              4
            </div>
            <div>
              <div className="font-bold text-slate-800">Bước 4: Bảng ma trận trực tiếp & Xác nhận</div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                Chỉnh sửa trực tiếp số câu, số điểm của từng ô. Hệ thống tự động kiểm tra điều kiện tổng 10.0 điểm. Sau khi hoàn tất, nhấn <strong>"Xác nhận Ma Trận"</strong> để chuyển sang tạo đề thi.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Tạo đề, sinh mã đề & kiểm tra AI */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h2 className="text-sm font-bold text-slate-900 flex items-center text-blue-900">
          <Sparkles className="w-4 h-4 mr-1.5 text-blue-700" />
          III. CÁC TÍNH NĂNG ĐẶC BIỆT KHI SOẠN ĐỀ KIỂM TRA
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
              Đổi câu tương đương & Khóa câu
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Nếu không ưng ý một câu hỏi, giáo viên nhấn <strong>"Đổi câu tương đương"</strong>. AI sẽ sinh câu mới có cùng mức độ, cùng yêu cầu cần đạt và giữ nguyên điểm số, không làm sai lệch ma trận. Khi câu đã đạt yêu cầu, nhấn biểu tượng Ổ khóa để khóa lại.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center">
              <Layers className="w-4 h-4 mr-1.5 text-blue-600" />
              Sinh 4 mã đề tương đương (A, B, C, D)
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Nhấn <strong>"Sinh 4 mã đề"</strong> để tạo ra các mã đề khác nhau. Hệ thống tự động xáo trộn phương án trắc nghiệm và tính toán lại bảng đáp án cho từng mã đề, đảm bảo tính công bằng và chống nhìn bài trong phòng thi.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-amber-600" />
              Bộ kiểm tra chất lượng 20 tiêu chí
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Nhấn <strong>"Kiểm tra đề (20 tiêu chí AI)"</strong> để chạy thuật toán thẩm định tự động: kiểm tra tổng 10 điểm, tính chính xác toán học, không trùng phương án, phân bố 3 mức độ và độ phù hợp ngôn ngữ học sinh tiểu học.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center">
              <FileDown className="w-4 h-4 mr-1.5 text-purple-600" />
              Xuất tệp Word (.docx) & Trọn bộ ZIP
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Hệ thống tạo file Word thực tế theo chuẩn A4 với tiêu ngữ, khung tên học sinh, điểm số và nhận xét. Đề học sinh và Hướng dẫn chấm được xuất thành hai tài liệu hoàn toàn độc lập để bảo mật.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
