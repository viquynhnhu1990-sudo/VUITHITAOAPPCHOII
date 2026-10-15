import React from 'react';
import {
  LayoutDashboard,
  Grid3X3,
  FileSpreadsheet,
  Database,
  FileCheck2,
  FolderOpen,
  Users2,
  CheckCircle2,
  BarChart3,
  Settings2,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type ActiveTab =
  | 'dashboard'
  | 'matrix_wizard'
  | 'exam_creator'
  | 'exam_list'
  | 'question_bank'
  | 'documents'
  | 'departments'
  | 'reviews'
  | 'reports'
  | 'settings'
  | 'guide';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen }) => {
  const { currentUser } = useAuth();

  const menuItems = [
    { id: 'dashboard' as ActiveTab, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'matrix_wizard' as ActiveTab, label: 'Tạo ma trận mới', icon: Grid3X3 },
    { id: 'exam_creator' as ActiveTab, label: 'Tạo đề kiểm tra', icon: FileSpreadsheet },
    { id: 'exam_list' as ActiveTab, label: 'Quản lý đề kiểm tra', icon: FileCheck2 },
    { id: 'question_bank' as ActiveTab, label: 'Ngân hàng câu hỏi', icon: Database },
    { id: 'documents' as ActiveTab, label: 'Kho tài liệu & SGK', icon: FolderOpen },
    { id: 'departments' as ActiveTab, label: 'Tổ chuyên môn', icon: Users2 },
    { id: 'reviews' as ActiveTab, label: 'Duyệt đề & Ma trận', icon: CheckCircle2 },
    { id: 'reports' as ActiveTab, label: 'Thống kê - Báo cáo', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Quản trị hệ thống', icon: Settings2 },
    { id: 'guide' as ActiveTab, label: 'Hướng dẫn sử dụng', icon: BookOpen },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col border-r border-slate-800 shadow-xl`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-white tracking-wide text-base leading-tight flex items-center space-x-1">
            <span>EDU MATRIX</span>
            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-semibold">AI</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">Đề Kiểm Tra Định Kỳ TH</div>
        </div>
      </div>

      {/* Standard reference badge */}
      <div className="mx-3 my-2 px-3 py-1.5 bg-blue-950/60 border border-blue-800/40 rounded-lg text-[11px] text-blue-300 flex items-center justify-between">
        <span className="font-medium">Chuẩn TT 27/2020 & GDPT 2018</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-700/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Info Card in Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {currentUser.name.charAt(currentUser.name.lastIndexOf(' ') + 1) || 'GV'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-emerald-400 truncate font-medium">{currentUser.title}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
