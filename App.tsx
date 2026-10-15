import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { MatrixWizard } from './components/matrix/MatrixWizard';
import { ExamEditor } from './components/exam/ExamEditor';
import { ExamList } from './components/exam/ExamList';
import { QuestionBank } from './components/questionBank/QuestionBank';
import { ReviewManagement } from './components/review/ReviewManagement';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { DocumentsView } from './components/documents/DocumentsView';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { UserGuideView } from './components/guide/UserGuideView';
import { Matrix } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Selected item states for deep linking between views
  const [selectedExamId, setSelectedExamId] = useState<string | undefined>(undefined);
  const [selectedMatrixId, setSelectedMatrixId] = useState<string | undefined>(undefined);

  const handleNavigateToExam = (examId: string) => {
    setSelectedExamId(examId);
    setActiveTab('exam_creator');
  };

  const handleNavigateToMatrix = (matrixId: string) => {
    setSelectedMatrixId(matrixId);
    setActiveTab('matrix_wizard');
  };

  const handleMatrixConfirmed = (matrix: Matrix) => {
    setSelectedMatrixId(matrix.id);
  };

  const handleCreateNewExam = () => {
    setSelectedExamId(undefined);
    setActiveTab('exam_creator');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigate={setActiveTab}
              onSelectExam={handleNavigateToExam}
              onSelectMatrix={handleNavigateToMatrix}
            />
          )}

          {activeTab === 'matrix_wizard' && (
            <MatrixWizard
              onMatrixConfirmed={handleMatrixConfirmed}
              onNavigateToExamCreator={(mId) => {
                setSelectedMatrixId(mId);
                setActiveTab('exam_creator');
              }}
            />
          )}

          {activeTab === 'exam_creator' && (
            <ExamEditor
              initialMatrixId={selectedMatrixId}
              initialExamId={selectedExamId}
              onNavigateToReviews={() => setActiveTab('reviews')}
            />
          )}

          {activeTab === 'exam_list' && (
            <ExamList
              onOpenExam={handleNavigateToExam}
              onCreateNew={handleCreateNewExam}
            />
          )}

          {activeTab === 'question_bank' && <QuestionBank />}

          {activeTab === 'reviews' && (
            <ReviewManagement
              onOpenExam={handleNavigateToExam}
              onOpenMatrix={handleNavigateToMatrix}
            />
          )}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && <SettingsView />}

          {activeTab === 'documents' && <DocumentsView />}

          {activeTab === 'departments' && <DepartmentsView />}

          {activeTab === 'guide' && <UserGuideView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
