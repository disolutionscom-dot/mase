import React from 'react';
import {
  Users,
  Building2,
  FolderKanban,
  Table as TableIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  HelpCircle,
  Award,
} from 'lucide-react';
import {
  School,
  Category,
  Table,
  Participant,
  Judge,
  Evaluation,
  SystemSettings,
} from '../../types';

interface AdminOverviewProps {
  schools: School[];
  categories: Category[];
  tables: Table[];
  participants: Participant[];
  judges: Judge[];
  evaluations: Evaluation[];
  settings: SystemSettings;
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  schools,
  categories,
  tables,
  participants,
  judges,
  evaluations,
  settings,
  onNavigateTab,
}) => {
  const submittedEvals = evaluations.filter((e) => e.Status === 'Submitted');
  const expectedEvals = participants.length;
  const progressPercent = Math.min(
    100,
    expectedEvals > 0 ? Math.round((submittedEvals.length / expectedEvals) * 100) : 0
  );

  // Table conflicts check
  const tableCounts = new Map<string, Participant[]>();
  participants.forEach((p) => {
    if (p.TableName) {
      const list = tableCounts.get(p.TableName.toUpperCase()) || [];
      list.push(p);
      tableCounts.set(p.TableName.toUpperCase(), list);
    }
  });

  const conflicts = Array.from(tableCounts.entries()).filter(
    ([, list]) => list.length > 1
  );
  const unassigned = participants.filter((p) => !p.TableName).length;

  const recentEvals = [...submittedEvals]
    .sort((a, b) => new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime())
    .slice(0, 5);

  const getParticipantTitle = (pid: string) => {
    const p = participants.find((item) => item.ParticipantID === pid);
    return p ? p.Title : pid;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A3D2C] via-[#0B6E4F] to-[#0A3D2C] text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">
              Organizer &amp; Faculty Control Center
            </div>
            <h2 className="text-2xl font-black text-white">{settings.ExhibitionName}</h2>
            <p className="text-xs text-[#C7DDD3] mt-1">
              Live status, registration management, judge assignments, and competition governance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('googleGuide')}
              className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#c09d2e] text-[#241900] text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Google Drive Fix Guide</span>
            </button>
            <button
              onClick={() => onNavigateTab('import')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Import CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateTab('schools')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs text-left hover:border-[#0B6E4F] transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
            <span>Schools</span>
            <Building2 className="w-4 h-4 text-[#0B6E4F] group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-black text-[#11241C] font-mono mt-1">
            {schools.length}
          </div>
          <div className="text-[11px] text-[#5B6E64] mt-1">Across 7 UAE Emirates</div>
        </button>

        <button
          onClick={() => onNavigateTab('participants')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs text-left hover:border-[#0B6E4F] transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
            <span>Projects / Posters</span>
            <FolderKanban className="w-4 h-4 text-[#0B6E4F] group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-black text-[#11241C] font-mono mt-1">
            {participants.length}
          </div>
          <div className="text-[11px] text-[#5B6E64] mt-1">Registered participants</div>
        </button>

        <button
          onClick={() => onNavigateTab('judges')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs text-left hover:border-[#0B6E4F] transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
            <span>Judges</span>
            <Users className="w-4 h-4 text-[#0B6E4F] group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-black text-[#0B6E4F] font-mono mt-1">
            {judges.length}
          </div>
          <div className="text-[11px] text-[#5B6E64] mt-1">Equipped with access codes</div>
        </button>

        <button
          onClick={() => onNavigateTab('tables')}
          className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs text-left hover:border-[#0B6E4F] transition group"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase">
            <span>Tables</span>
            <TableIcon className="w-4 h-4 text-[#0B6E4F] group-hover:scale-110 transition" />
          </div>
          <div className="text-3xl font-black text-[#11241C] font-mono mt-1">
            {tables.length}
          </div>
          <div className="text-[11px] text-[#5B6E64] mt-1">Exhibition booths &amp; stands</div>
        </button>
      </div>

      {/* Progress & Alert Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gray-700">Judging Progress</span>
            <span className="font-mono font-bold text-[#0B6E4F]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[#0B6E4F] h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 flex justify-between pt-1">
            <span>{submittedEvals.length} evaluations recorded</span>
            <span>{expectedEvals} expected</span>
          </div>
        </div>

        {/* Unassigned Tables Alert */}
        <div
          onClick={() => onNavigateTab('tables')}
          className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-xs cursor-pointer hover:border-[#0B6E4F] transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Unassigned Participants</span>
            <span
              className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-full ${
                unassigned > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {unassigned}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {unassigned > 0
              ? 'Projects without a physical exhibition table number.'
              : 'All registered projects are assigned to tables!'}
          </p>
        </div>

        {/* Table Conflicts Alert */}
        <div
          onClick={() => onNavigateTab('tables')}
          className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-xs cursor-pointer hover:border-[#0B6E4F] transition space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Table Conflicts</span>
            <span
              className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-full ${
                conflicts.length > 0 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {conflicts.length}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {conflicts.length > 0
              ? 'Multiple projects assigned to the same table number.'
              : 'Zero physical table assignment overlaps.'}
          </p>
        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#11241C] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B6E4F]" />
            <span>Latest Submitted Evaluations</span>
          </h3>
          <span className="text-xs text-gray-500 font-medium">Real-Time Sync</span>
        </div>

        <div className="divide-y divide-[#EEF3F0]">
          {recentEvals.map((e) => (
            <div key={e.EvaluationID} className="py-3 flex items-center justify-between gap-4">
              <div className="truncate">
                <div className="font-bold text-xs text-[#11241C] truncate">
                  {getParticipantTitle(e.ParticipantID)}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Evaluated by <strong className="text-gray-700">{e.JudgeName}</strong> • Ref:{' '}
                  {e.EvaluationID}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-mono font-black text-sm text-[#0B6E4F]">
                  {e.Total} <span className="text-xs font-normal text-gray-400">/ 40</span>
                </div>
                <div className="text-[10px] text-[#B8860B] font-mono font-bold">
                  {e.Percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
