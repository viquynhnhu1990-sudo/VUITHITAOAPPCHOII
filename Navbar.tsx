import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  UserCheck,
  ChevronDown,
  School,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onSearch }) => {
  const { currentUser, allUsers, loginAs } = useAuth();
  const { schoolSettings, resetToSampleData } = useData();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const roleBadgeColor = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    principal: 'bg-red-100 text-red-800 border-red-200',
    dept_head: 'bg-amber-100 text-amber-800 border-amber-200',
    teacher: 'bg-blue-100 text-blue-800 border-blue-200',
  }[currentUser.role];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & School / Year Info */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            title="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-slate-800">
            <School className="w-5 h-5 text-blue-700 hidden sm:block flex-shrink-0" />
            <div>
              <div className="font-bold text-sm sm:text-base text-slate-900 leading-tight truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {schoolSettings.schoolName}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center space-x-2 font-medium">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                  Năm học: {schoolSettings.academicYear}
                </span>
                <span>•</span>
                <span className="text-blue-700 font-semibold">{schoolSettings.currentTerm === 'HK1' ? 'Học kỳ I' : 'Học kỳ II'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Search Box */}
        <div className="hidden lg:flex items-center flex-1 max-w-xs xl:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm ma trận, câu hỏi, mã đề..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
          />
        </div>

        {/* Right Side: Role Switcher & Account */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Role badge */}
          <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadgeColor}`}>
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            {currentUser.role === 'admin' && 'Quản trị viên'}
            {currentUser.role === 'principal' && 'Ban Giám hiệu'}
            {currentUser.role === 'dept_head' && 'Tổ trưởng Chuyên môn'}
            {currentUser.role === 'teacher' && 'Giáo viên'}
          </span>

          {/* User selector dropdown (Realistic Role Switcher for verification) */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {currentUser.name.charAt(currentUser.name.lastIndexOf(' ') + 1) || 'GV'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">Chuyển vai trò thử nghiệm</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                  <div className="text-xs font-semibold text-slate-700">Tài khoản hiện tại</div>
                  <div className="text-xs text-blue-700 font-bold">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.title}</div>
                </div>

                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Chuyển vai trò trải nghiệm:
                </div>

                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      loginAs(u.id);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start space-x-2.5 hover:bg-blue-50 transition text-xs ${
                      u.id === currentUser.id ? 'bg-blue-50/80 font-semibold text-blue-800' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] mt-0.5">
                      {u.name.charAt(u.name.lastIndexOf(' ') + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.title}</div>
                    </div>
                  </button>
                ))}

                <div className="border-t border-slate-100 mt-1 pt-1 px-3">
                  <button
                    onClick={() => {
                      if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu theo chuẩn Thông tư 27?')) {
                        resetToSampleData();
                        setShowUserDropdown(false);
                      }
                    }}
                    className="w-full text-left py-1.5 text-xs text-slate-600 hover:text-red-600 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Khôi phục dữ liệu mẫu chuẩn</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
