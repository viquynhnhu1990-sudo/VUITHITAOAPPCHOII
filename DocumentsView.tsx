import React, { useState } from 'react';
import {
  FolderOpen,
  FileText,
  Upload,
  BookOpen,
  Download,
  Search,
  ExternalLink,
} from 'lucide-react';

interface DocumentItem {
  id: string;
  title: string;
  category: 'van_ban' | 'sgk' | 'de_cuong';
  grade?: number;
  subject?: string;
  size: string;
  updatedAt: string;
  description: string;
}

export const DocumentsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'van_ban' | 'sgk' | 'de_cuong'>('all');
  const [search, setSearch] = useState('');

  const documents: DocumentItem[] = [
    {
      id: 'doc_1',
      title: 'Thông tư số 27/2020/TT-BGDĐT về Quy định đánh giá học sinh tiểu học',
      category: 'van_ban',
      size: '2.4 MB',
      updatedAt: '2024-09-01',
      description: 'Văn bản pháp quy gốc của Bộ Giáo dục và Đào tạo về đánh giá thường xuyên và kiểm tra định kỳ.',
    },
    {
      id: 'doc_2',
      title: 'Chương trình Giáo dục phổ thông 2018 - Môn Toán cấp Tiểu học',
      category: 'van_ban',
      size: '3.8 MB',
      updatedAt: '2024-09-05',
      description: 'Khung chuẩn yêu cầu cần đạt về năng lực và phẩm chất toán học cho học sinh từ Lớp 1 đến Lớp 5.',
    },
    {
      id: 'doc_3',
      title: 'Chương trình Giáo dục phổ thông 2018 - Môn Tiếng Việt cấp Tiểu học',
      category: 'van_ban',
      size: '4.1 MB',
      updatedAt: '2024-09-05',
      description: 'Quy định chuẩn đánh giá năng lực Đọc, Viết, Nói và Nghe trong bài kiểm tra định kỳ.',
    },
    {
      id: 'doc_4',
      title: 'SGK Toán 4 - Kết Nối Tri Thức Với Cuộc Sống (Tập 1)',
      category: 'sgk',
      grade: 4,
      subject: 'Toán',
      size: '28.5 MB',
      updatedAt: '2024-08-20',
      description: 'Ấn bản SGK hiện hành đang giảng dạy tại trường phục vụ tra cứu số trang và nội dung bài học.',
    },
    {
      id: 'doc_5',
      title: 'SGK Tin học 3 - Cánh Diều',
      category: 'sgk',
      grade: 3,
      subject: 'Tin học',
      size: '19.2 MB',
      updatedAt: '2024-08-20',
      description: 'Nội dung phân phối chương trình và các bài thực hành trên máy.',
    },
    {
      id: 'doc_6',
      title: 'Kế hoạch dạy học & Đề cương ôn tập Giữa HKI Khối 4',
      category: 'de_cuong',
      grade: 4,
      size: '1.2 MB',
      updatedAt: '2024-10-02',
      description: 'Tài liệu đề cương thống nhất giữa các lớp 4A1, 4A2, 4A3 phục vụ xây dựng ma trận kiểm tra.',
    },
  ];

  const filteredDocs = documents.filter((doc) => {
    if (activeCategory !== 'all' && doc.category !== activeCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return doc.title.toLowerCase().includes(q) || doc.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center">
            <span className="w-2 h-6 bg-blue-700 rounded-sm mr-2.5"></span>
            Kho Tài Liệu Chuyên Môn & Văn Bản Hướng Dẫn
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Nguồn tài liệu chính thống làm căn cứ xác lập ma trận và đề kiểm tra định kỳ tiểu học.
          </p>
        </div>

        <button
          onClick={() => alert('Chức năng tải lên tài liệu mới vào kho lưu trữ nội bộ trường.')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs inline-flex items-center transition"
        >
          <Upload className="w-4 h-4 mr-1.5" />
          Tải tài liệu lên kho
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Tất cả tài liệu' },
            { id: 'van_ban', label: 'Văn bản quy phạm & Thông tư' },
            { id: 'sgk', label: 'Sách giáo khoa' },
            { id: 'de_cuong', label: 'Đề cương & Kế hoạch' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tài liệu..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 shadow-xs flex flex-col justify-between transition"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {doc.category === 'van_ban' ? 'Văn bản TT27' : doc.category === 'sgk' ? 'SGK' : 'Đề cương'}
                </span>
                <span>{doc.size}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug mb-1.5 line-clamp-2">
                {doc.title}
              </h3>

              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                {doc.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Cập nhật: {doc.updatedAt}</span>
              <button
                onClick={() => alert(`Đang mở tài liệu: ${doc.title}`)}
                className="text-blue-700 hover:underline font-bold inline-flex items-center"
              >
                <span>Xem tài liệu</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
