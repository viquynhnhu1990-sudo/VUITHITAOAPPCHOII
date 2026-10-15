import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Matrix, Exam } from '../types';
import { SEED_USERS } from '../data/curriculumData';

interface AuthContextType {
  currentUser: User;
  allUsers: User[];
  loginAs: (userId: string) => void;
  logout: () => void;
  canCreateMatrix: () => boolean;
  canApproveMatrix: (matrix?: Matrix) => boolean;
  canCreateExam: () => boolean;
  canApproveExam: (exam?: Exam) => boolean;
  canPublishExam: () => boolean;
  canManageSettings: () => boolean;
  canViewExamDetails: (exam: Exam) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('edu_matrix_user_id');
    const found = SEED_USERS.find((u) => u.id === saved);
    return found || SEED_USERS[3]; // Default: Giáo viên Phạm Thu Hà
  });

  useEffect(() => {
    localStorage.setItem('edu_matrix_user_id', currentUser.id);
  }, [currentUser]);

  const loginAs = (userId: string) => {
    const found = SEED_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const logout = () => {
    // Reverts to teacher default
    setCurrentUser(SEED_USERS[3]);
  };

  // Permission checkers
  const canCreateMatrix = () => {
    return ['admin', 'teacher', 'dept_head'].includes(currentUser.role);
  };

  const canApproveMatrix = (matrix?: Matrix) => {
    if (currentUser.role === 'admin' || currentUser.role === 'principal') return true;
    if (currentUser.role === 'dept_head') {
      // Dept head can approve if within their department or assigned grade
      if (!matrix) return true;
      if (matrix.grade === currentUser.gradeAssigned || matrix.department.includes('Khối 4')) {
        return true;
      }
      return true;
    }
    return false;
  };

  const canCreateExam = () => {
    return ['admin', 'teacher', 'dept_head'].includes(currentUser.role);
  };

  const canApproveExam = (exam?: Exam) => {
    if (currentUser.role === 'admin' || currentUser.role === 'principal') return true;
    if (currentUser.role === 'dept_head') {
      if (!exam) return true;
      if (exam.grade === currentUser.gradeAssigned || exam.department.includes('Khối 4')) {
        return true;
      }
      return true;
    }
    return false;
  };

  const canPublishExam = () => {
    return ['admin', 'principal'].includes(currentUser.role);
  };

  const canManageSettings = () => {
    return currentUser.role === 'admin';
  };

  const canViewExamDetails = (exam: Exam) => {
    if (['admin', 'principal', 'dept_head'].includes(currentUser.role)) return true;
    // Teacher can view their own exams or already published exams
    if (exam.creatorId === currentUser.id) return true;
    if (exam.status === 'published') return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers: SEED_USERS,
        loginAs,
        logout,
        canCreateMatrix,
        canApproveMatrix,
        canCreateExam,
        canApproveExam,
        canPublishExam,
        canManageSettings,
        canViewExamDetails,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
