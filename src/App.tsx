/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, Judge, Participant, Evaluation } from './types';
import { storage } from './services/storageService';
import { Navbar } from './components/Navbar';
import { JudgeLogin } from './components/JudgePortal/JudgeLogin';
import { TableSearch } from './components/JudgePortal/TableSearch';
import { EvaluationForm } from './components/JudgePortal/EvaluationForm';
import { MyEvaluations } from './components/JudgePortal/MyEvaluations';
import { ReassignModal } from './components/JudgePortal/ReassignModal';
import { LiveDashboard } from './components/LiveDashboard/LiveDashboard';
import { AdminConsole } from './components/AdminConsole/AdminConsole';
import { AuthModal } from './components/AuthModal';
import { GoogleDriveFixGuide } from './components/AdminConsole/GoogleDriveFixGuide';

export default function App() {
  const [stateVersion, setStateVersion] = useState(0);

  // Active Role and Auth State
  const [currentRole, setCurrentRole] = useState<UserRole>('judge');
  const [currentJudge, setCurrentJudge] = useState<Judge | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isViewerAuthenticated, setIsViewerAuthenticated] = useState(true);

  // Judge Portal Navigation State
  const [judgeView, setJudgeView] = useState<'search' | 'evaluate' | 'myEvaluations'>('search');
  const [selectedProject, setSelectedProject] = useState<Participant | null>(null);
  const [activeExistingEval, setActiveExistingEval] = useState<Evaluation | null>(null);
  const [reassignTarget, setReassignTarget] = useState<{ project: Participant; currentTableQuery: string } | null>(null);
  const [judgeLoginError, setJudgeLoginError] = useState<string | null>(null);

  // Modals
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'admin' | 'viewer' }>({
    isOpen: false,
    mode: 'admin',
  });
  const [isHelpGuideOpen, setIsHelpGuideOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to storage changes
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setStateVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const state = storage.getState();
  const rankings = storage.getRankings();

  // Role switching
  const handleSelectRole = (role: UserRole) => {
    if (role === 'admin') {
      if (isAdminAuthenticated) {
        setCurrentRole('admin');
      } else {
        setAuthModal({ isOpen: true, mode: 'admin' });
      }
    } else if (role === 'viewer') {
      setCurrentRole('viewer');
    } else if (role === 'judge') {
      setCurrentRole('judge');
    }
  };

  const handleAuthSubmit = (password: string): boolean => {
    if (authModal.mode === 'admin') {
      const ok = storage.loginAdmin(password);
      if (ok) {
        setIsAdminAuthenticated(true);
        setCurrentRole('admin');
        return true;
      }
      return false;
    } else {
      const ok = storage.loginViewer(password);
      if (ok) {
        setIsViewerAuthenticated(true);
        setCurrentRole('viewer');
        return true;
      }
      return false;
    }
  };

  const handleLogout = () => {
    if (currentRole === 'judge') {
      setCurrentJudge(null);
      setJudgeView('search');
      setSelectedProject(null);
      showToast('Signed out from Judge Portal.');
    } else if (currentRole === 'admin') {
      setIsAdminAuthenticated(false);
      setCurrentRole('judge');
      showToast('Exited Admin Console.');
    }
  };

  // Judge Actions
  const handleJudgeLogin = (code: string) => {
    setJudgeLoginError(null);
    const res = storage.loginJudge(code);
    if (res.ok && res.judge) {
      setCurrentJudge(res.judge);
      setJudgeView('search');
      showToast(`Signed in as ${res.judge.Name}`);
    } else {
      setJudgeLoginError(res.message || 'Invalid judge access code.');
    }
  };

  const handleStartEvaluation = (project: Participant) => {
    setSelectedProject(project);
    setActiveExistingEval(null);
    setJudgeView('evaluate');
  };

  const handleEditEvaluation = (evalItem: Evaluation, project: Participant) => {
    setSelectedProject(project);
    setActiveExistingEval(evalItem);
    setJudgeView('evaluate');
  };

  const handleConfirmReassign = (newTableName: string, reason: string) => {
    if (!reassignTarget || !currentJudge) return;

    const res = storage.reassignTable(
      reassignTarget.project.ParticipantID,
      newTableName,
      currentJudge.Name,
      reason
    );

    if (res.ok) {
      showToast(
        `Project reassigned to Table ${newTableName}${
          res.displacedProject ? ` (Displaced: ${res.displacedProject})` : ''
        }`
      );
      setReassignTarget(null);
    } else {
      alert(res.message || 'Reassignment failed');
    }
  };

  // Filter judge-specific evaluations count
  const myEvalsCount = currentJudge
    ? state.evaluations.filter((e) => e.JudgeID === currentJudge.JudgeID && e.Status === 'Submitted').length
    : 0;

  return (
    <div className="min-h-screen bg-[#F6F8F7] text-[#11241C] flex flex-col font-sans">
      {/* Universal Institutional Navbar */}
      <Navbar
        currentRole={currentRole}
        currentJudge={currentJudge}
        onSelectRole={handleSelectRole}
        onLogout={handleLogout}
        exhibitionName={state.settings.ExhibitionName}
        resultsFinal={state.settings.ResultsFinal}
        rankingsPublished={state.settings.RankingsPublished}
        onOpenHelp={() => setIsHelpGuideOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {/* 1. Judge Portal */}
        {currentRole === 'judge' && (
          <div>
            {!currentJudge ? (
              <JudgeLogin
                onLogin={handleJudgeLogin}
                availableJudges={state.judges}
                error={judgeLoginError}
              />
            ) : (
              <div>
                {judgeView === 'search' && (
                  <TableSearch
                    currentJudge={currentJudge}
                    onSelectProject={handleStartEvaluation}
                    onOpenMyEvaluations={() => setJudgeView('myEvaluations')}
                    onReassignRequest={(project, currentTableQuery) =>
                      setReassignTarget({ project, currentTableQuery })
                    }
                    findTable={(tbl) => storage.findTable(tbl)}
                    searchProjects={(q) => storage.searchProjects(q)}
                    myEvaluationsCount={myEvalsCount}
                  />
                )}

                {judgeView === 'evaluate' && selectedProject && (
                  <EvaluationForm
                    project={selectedProject}
                    currentJudge={currentJudge}
                    rubric={state.rubric}
                    onBack={() => {
                      setJudgeView('search');
                      setSelectedProject(null);
                      setActiveExistingEval(null);
                    }}
                    onSubmitEvaluation={(payload) => storage.submitEvaluation(payload)}
                    existingEvaluation={activeExistingEval}
                  />
                )}

                {judgeView === 'myEvaluations' && (
                  <MyEvaluations
                    currentJudge={currentJudge}
                    evaluations={state.evaluations}
                    participants={state.participants}
                    onBack={() => setJudgeView('search')}
                    onEditEvaluation={handleEditEvaluation}
                    allowCorrections={state.settings.AllowJudgeCorrect}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Live Dashboard View */}
        {currentRole === 'viewer' && (
          <LiveDashboard
            rankings={rankings}
            evaluations={state.evaluations}
            participants={state.participants}
            settings={state.settings}
            onRefresh={() => setStateVersion((v) => v + 1)}
            onSelectProject={(p) => {
              // Quick view project
            }}
          />
        )}

        {/* 3. Admin Console View */}
        {currentRole === 'admin' && (
          <AdminConsole
            schools={state.schools}
            categories={state.categories}
            tables={state.tables}
            participants={state.participants}
            judges={state.judges}
            evaluations={state.evaluations}
            settings={state.settings}
            rubric={state.rubric}
            rankings={rankings}
            onSaveSchool={(s) => storage.saveSchool(s)}
            onDeleteSchool={(id) => storage.deleteSchool(id)}
            onSaveCategory={(c) => storage.saveCategory(c)}
            onDeleteCategory={(id) => storage.deleteCategory(id)}
            onSaveJudge={(j) => storage.saveJudge(j)}
            onDeleteJudge={(id) => storage.deleteJudge(id)}
            onIssueAccessCode={(jid, regen) => storage.issueAccessCode(jid, regen)}
            onSaveTable={(t) => storage.saveTable(t)}
            onDeleteTable={(id) => storage.deleteTable(id)}
            onAssignTable={(pid, tbl) => storage.reassignTable(pid, tbl, 'Admin')}
            onSaveParticipant={(p) => storage.saveParticipant(p)}
            onDeleteParticipant={(id) => storage.deleteParticipant(id)}
            onImportRegistrations={(rows, map) => storage.importRegistrations(rows, map)}
            onExportCsv={(type) => storage.exportReportCsv(type)}
            onExportFullJson={() => storage.exportFullJson()}
            onImportFullJson={(json) => storage.importFullJson(json)}
            onUpdateSettings={(s) => storage.updateSettings(s)}
            onResetToDemo={() => storage.resetToDemo()}
          />
        )}
      </main>

      {/* Floating Reassignment Modal */}
      {reassignTarget && (
        <ReassignModal
          project={reassignTarget.project}
          currentTableQuery={reassignTarget.currentTableQuery}
          onClose={() => setReassignTarget(null)}
          onConfirmReassign={handleConfirmReassign}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        mode={authModal.mode}
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        onSubmit={handleAuthSubmit}
      />

      {/* Quick Help / Google Drive Fix Guide Modal */}
      {isHelpGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E2E8E4]">
              <span className="font-bold text-sm text-gray-800">
                Google Apps Script &amp; Drive Fix Guide
              </span>
              <button
                onClick={() => setIsHelpGuideOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold px-2 py-1 text-sm rounded-lg"
              >
                Close ✕
              </button>
            </div>
            <GoogleDriveFixGuide />
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0A3D2C] text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 border border-[#0B6E4F]/50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
