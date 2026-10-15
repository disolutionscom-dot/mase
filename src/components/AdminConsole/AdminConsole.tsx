import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Tag,
  Users,
  Table as TableIcon,
  FolderKanban,
  BookOpen,
  FileSpreadsheet,
  Download,
  Settings,
  HelpCircle,
  Menu,
  X,
  Activity,
  Trophy,
  Code,
  Sparkles,
  GitBranch,
  Mail,
} from 'lucide-react';
import {
  School,
  Category,
  Table,
  Participant,
  Judge,
  Evaluation,
  SystemSettings,
  Rubric,
  RankingsData,
} from '../../types';
import { AdminOverview } from './AdminOverview';
import { SchoolManager } from './SchoolManager';
import { CategoryManager } from './CategoryManager';
import { JudgeManager } from './JudgeManager';
import { JudgeActivityMonitor } from './JudgeActivityMonitor';
import { TableManager } from './TableManager';
import { ParticipantManager } from './ParticipantManager';
import { RubricViewer } from './RubricViewer';
import { RegistrationImporter } from './RegistrationImporter';
import { ReportsExporter } from './ReportsExporter';
import { GoogleDriveFixGuide } from './GoogleDriveFixGuide';
import { AppsScriptCodeBundle } from './AppsScriptCodeBundle';
import { SystemSettingsComponent } from './SystemSettings';
import { AwardsPdfPrintModal } from './AwardsPdfPrintModal';
import { ClaudePromptModal } from './ClaudePromptModal';
import { GitHubSheetsModal } from './GitHubSheetsModal';
import { EmailHubModal } from './EmailHubModal';

interface AdminConsoleProps {
  schools: School[];
  categories: Category[];
  tables: Table[];
  participants: Participant[];
  judges: Judge[];
  evaluations: Evaluation[];
  settings: SystemSettings;
  rubric: Rubric;
  rankings: RankingsData;
  onSaveSchool: (s: Partial<School>) => School;
  onDeleteSchool: (id: string) => void;
  onSaveCategory: (c: Partial<Category>) => Category;
  onDeleteCategory: (id: string) => void;
  onSaveJudge: (j: Partial<Judge>) => Judge;
  onDeleteJudge: (id: string) => void;
  onIssueAccessCode: (judgeId: string, regenerate?: boolean) => { code: string; judge: Judge };
  onSaveTable: (t: Partial<Table>) => Table;
  onDeleteTable: (id: string) => void;
  onAssignTable: (participantId: string, tableName: string) => void;
  onSaveParticipant: (p: Partial<Participant>) => Participant;
  onDeleteParticipant: (id: string) => void;
  onImportRegistrations: (
    rows: Record<string, string>[],
    mapping: Record<string, string>
  ) => any;
  onExportCsv: (type: any) => string;
  onExportFullJson: () => string;
  onImportFullJson: (json: string) => boolean;
  onUpdateSettings: (s: Partial<SystemSettings>) => void;
  onResetToDemo: () => void;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  schools,
  categories,
  tables,
  participants,
  judges,
  evaluations,
  settings,
  rubric,
  rankings,
  onSaveSchool,
  onDeleteSchool,
  onSaveCategory,
  onDeleteCategory,
  onSaveJudge,
  onDeleteJudge,
  onIssueAccessCode,
  onSaveTable,
  onDeleteTable,
  onAssignTable,
  onSaveParticipant,
  onDeleteParticipant,
  onImportRegistrations,
  onExportCsv,
  onExportFullJson,
  onImportFullJson,
  onUpdateSettings,
  onResetToDemo,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAwardsPdfModalOpen, setIsAwardsPdfModalOpen] = useState(false);
  const [isClaudePromptModalOpen, setIsClaudePromptModalOpen] = useState(false);
  const [isGitHubSheetsModalOpen, setIsGitHubSheetsModalOpen] = useState(false);
  const [isEmailHubModalOpen, setIsEmailHubModalOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'judgeActivity', label: 'Judge Monitor', icon: Activity, badge: `${evaluations.filter(e => e.Status === 'Submitted').length} Scored` },
    { id: 'emailHub', label: 'Email Dispatcher', icon: Mail, highlight: true },
    { id: 'judges', label: 'Judges & Codes', icon: Users },
    { id: 'schools', label: 'Schools', icon: Building2 },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'tables', label: 'Tables & Hall', icon: TableIcon },
    { id: 'participants', label: 'Participants', icon: FolderKanban },
    { id: 'rubric', label: 'Evaluation Rubric', icon: BookOpen },
    { id: 'import', label: 'Import Registrations', icon: FileSpreadsheet },
    { id: 'reports', label: 'Reports & Exports', icon: Download },
    { id: 'githubSheets', label: 'GitHub & Sheets', icon: GitBranch, highlight: true },
    { id: 'awardsPdf', label: 'Ceremony PDF', icon: Trophy, highlight: true },
    { id: 'claudePrompt', label: 'Claude AI Prompt', icon: Sparkles },
    { id: 'appsScriptBundle', label: 'Apps Script Bundle', icon: Code },
    { id: 'googleGuide', label: 'Google Drive Fix', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Mobile Nav Toggle */}
      <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-3 rounded-2xl border border-[#E2E8E4]">
        <span className="font-bold text-xs text-gray-700 capitalize flex items-center gap-2">
          <span>Active View:</span>
          <span className="text-[#0B6E4F] font-black">
            {navItems.find((item) => item.id === activeTab)?.label}
          </span>
        </span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg bg-gray-100 text-gray-700"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside
          className={`lg:w-64 flex-shrink-0 bg-white rounded-3xl p-4 border border-[#E2E8E4] shadow-sm space-y-1.5 ${
            isMobileMenuOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            MASE Admin Console
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'awardsPdf') {
                    setIsAwardsPdfModalOpen(true);
                  } else if (item.id === 'claudePrompt') {
                    setIsClaudePromptModalOpen(true);
                  } else if (item.id === 'githubSheets') {
                    setIsGitHubSheetsModalOpen(true);
                  } else if (item.id === 'emailHub') {
                    setIsEmailHubModalOpen(true);
                  } else {
                    setActiveTab(item.id);
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                  isActive
                    ? 'bg-[#0B6E4F] text-white shadow-sm'
                    : item.highlight
                    ? 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-300'
                    : 'text-gray-700 hover:bg-[#F4F7F5] hover:text-[#0B6E4F]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-700' : 'text-gray-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#E6F1EC] text-[#0B6E4F]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'overview' && (
            <AdminOverview
              schools={schools}
              categories={categories}
              tables={tables}
              participants={participants}
              judges={judges}
              evaluations={evaluations}
              settings={settings}
              onNavigateTab={(tab) => {
                if (tab === 'awardsPdf') setIsAwardsPdfModalOpen(true);
                else if (tab === 'githubSheets') setIsGitHubSheetsModalOpen(true);
                else if (tab === 'emailHub') setIsEmailHubModalOpen(true);
                else setActiveTab(tab);
              }}
            />
          )}

          {activeTab === 'judgeActivity' && (
            <JudgeActivityMonitor
              judges={judges}
              evaluations={evaluations}
              participants={participants}
              categories={categories}
            />
          )}

          {activeTab === 'schools' && (
            <SchoolManager
              schools={schools}
              onSaveSchool={onSaveSchool}
              onDeleteSchool={onDeleteSchool}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManager
              categories={categories}
              onSaveCategory={onSaveCategory}
              onDeleteCategory={onDeleteCategory}
            />
          )}

          {activeTab === 'judges' && (
            <JudgeManager
              judges={judges}
              onSaveJudge={onSaveJudge}
              onDeleteJudge={onDeleteJudge}
              onIssueAccessCode={onIssueAccessCode}
              exhibitionName={settings.ExhibitionName}
            />
          )}

          {activeTab === 'tables' && (
            <TableManager
              tables={tables}
              participants={participants}
              onSaveTable={onSaveTable}
              onDeleteTable={onDeleteTable}
              onAssignTable={onAssignTable}
            />
          )}

          {activeTab === 'participants' && (
            <ParticipantManager
              participants={participants}
              schools={schools}
              categories={categories}
              tables={tables}
              onSaveParticipant={onSaveParticipant}
              onDeleteParticipant={onDeleteParticipant}
              onAssignTable={onAssignTable}
            />
          )}

          {activeTab === 'rubric' && <RubricViewer rubric={rubric} />}

          {activeTab === 'import' && (
            <RegistrationImporter onImport={onImportRegistrations} />
          )}

          {activeTab === 'reports' && (
            <ReportsExporter
              onExportCsv={onExportCsv}
              onExportFullJson={onExportFullJson}
              onImportFullJson={onImportFullJson}
              exhibitionName={settings.ExhibitionName}
              onOpenAwardsPdf={() => setIsAwardsPdfModalOpen(true)}
            />
          )}

          {activeTab === 'appsScriptBundle' && <AppsScriptCodeBundle />}

          {activeTab === 'googleGuide' && <GoogleDriveFixGuide />}

          {activeTab === 'settings' && (
            <SystemSettingsComponent
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              onResetToDemo={onResetToDemo}
            />
          )}
        </main>
      </div>

      {/* Official Formatted Awards Ceremony PDF Modal */}
      {isAwardsPdfModalOpen && (
        <AwardsPdfPrintModal
          rankings={rankings}
          settings={settings}
          schools={schools}
          onClose={() => setIsAwardsPdfModalOpen(false)}
        />
      )}

      {/* Turnkey Claude Implementation Prompt Modal */}
      <ClaudePromptModal
        isOpen={isClaudePromptModalOpen}
        onClose={() => setIsClaudePromptModalOpen(false)}
      />

      {/* GitHub & Google Sheets Deployment Bundle Modal */}
      <GitHubSheetsModal
        isOpen={isGitHubSheetsModalOpen}
        onClose={() => setIsGitHubSheetsModalOpen(false)}
      />

      {/* Google Apps Script Email Dispatch Center Modal */}
      <EmailHubModal
        isOpen={isEmailHubModalOpen}
        onClose={() => setIsEmailHubModalOpen(false)}
        judges={judges}
        participants={participants}
        schools={schools}
        rankings={rankings}
      />
    </div>
  );
};
