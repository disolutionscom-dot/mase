import React, { useState } from 'react';
import {
  Users,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart2,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Award,
} from 'lucide-react';
import { Judge, Evaluation, Participant, Category } from '../../types';

interface JudgeActivityMonitorProps {
  judges: Judge[];
  evaluations: Evaluation[];
  participants: Participant[];
  categories: Category[];
  onInspectJudge?: (judge: Judge) => void;
}

export const JudgeActivityMonitor: React.FC<JudgeActivityMonitorProps> = ({
  judges,
  evaluations,
  participants,
  categories,
  onInspectJudge,
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'idle'>('all');
  const [search, setSearch] = useState('');

  const submittedEvals = evaluations.filter((e) => e.Status === 'Submitted');

  // Compute metrics per judge
  const judgeStats = judges.map((judge) => {
    const judgeEvals = submittedEvals.filter((e) => e.JudgeID === judge.JudgeID);
    const count = judgeEvals.length;

    // Approximate target: if judge has assigned categories, count projects in those categories; default quota is 6
    let target = 6;
    if (judge.Categories) {
      const assignedCatNames = judge.Categories.split(',').map((c) => c.trim().toLowerCase());
      const eligibleProjects = participants.filter((p) =>
        assignedCatNames.some((ac) => p.Category.toLowerCase().includes(ac))
      );
      if (eligibleProjects.length > 0) {
        target = Math.max(3, Math.min(10, Math.ceil(eligibleProjects.length / 2)));
      }
    }

    const percent = Math.min(100, Math.round((count / target) * 100));

    // Average score given
    const avgScore =
      count > 0
        ? Math.round(
            (judgeEvals.reduce((sum, e) => sum + e.Total, 0) / count) * 10
          ) / 10
        : 0;

    // Scoring tendency
    let tendency = 'Balanced';
    if (count >= 2) {
      if (avgScore >= 36) tendency = 'Generous';
      else if (avgScore < 30) tendency = 'Strict / Discerning';
    }

    // Last evaluated
    let lastActive = 'Never';
    if (judgeEvals.length > 0) {
      const sorted = [...judgeEvals].sort(
        (a, b) => new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime()
      );
      const diffMs = Date.now() - new Date(sorted[0].SubmittedAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) lastActive = 'Just now';
      else if (diffMins < 60) lastActive = `${diffMins} min ago`;
      else {
        const hours = Math.floor(diffMins / 60);
        lastActive = `${hours} hr${hours > 1 ? 's' : ''} ago`;
      }
    } else if (judge.LastLoginAt) {
      lastActive = 'Logged in, no evaluations';
    }

    let statusType: 'completed' | 'in_progress' | 'idle' = 'idle';
    if (count >= target) statusType = 'completed';
    else if (count > 0) statusType = 'in_progress';

    return {
      judge,
      count,
      target,
      percent,
      avgScore,
      tendency,
      lastActive,
      statusType,
      evaluations: judgeEvals,
    };
  });

  // Overall statistics
  const activeJudgesCount = judgeStats.filter((s) => s.count > 0).length;
  const completedTargetCount = judgeStats.filter((s) => s.count >= s.target).length;
  const totalSubmissions = submittedEvals.length;
  const maxJudgeCount = Math.max(...judgeStats.map((s) => s.count), 1);

  const filteredStats = judgeStats.filter((s) => {
    const matchesFilter = filter === 'all' || s.statusType === filter;
    const matchesSearch =
      s.judge.Name.toLowerCase().includes(search.toLowerCase()) ||
      s.judge.Institution?.toLowerCase().includes(search.toLowerCase()) ||
      s.judge.AccessCode.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B6E4F] bg-[#E6F1EC] px-2.5 py-1 rounded-md mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Real-Time Workload Tracking</span>
          </div>
          <h2 className="text-xl font-black text-[#11241C]">Judge Activity Monitor</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor live evaluation pace, target quota completion, and scoring balance across all appointed judges.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F6F8F7] px-4 py-2 rounded-2xl border border-[#CBD7D0] text-xs">
          <span className="font-bold text-gray-700">Active Evaluators:</span>
          <span className="font-mono font-bold text-[#0B6E4F]">
            {activeJudgesCount} of {judges.length} Judges
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total Evaluations
          </div>
          <div className="text-3xl font-black text-[#0B6E4F] font-mono mt-1">
            {totalSubmissions}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Logged across {participants.length} projects
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Target Achieved
          </div>
          <div className="text-3xl font-black text-[#11241C] font-mono mt-1">
            {completedTargetCount}{' '}
            <span className="text-sm font-normal text-gray-400">/ {judges.length}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Completed assigned quota
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            In Progress
          </div>
          <div className="text-3xl font-black text-[#B8860B] font-mono mt-1">
            {judgeStats.filter((s) => s.statusType === 'in_progress').length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Actively scoring stands</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Pending / Idle
          </div>
          <div className="text-3xl font-black text-gray-400 font-mono mt-1">
            {judgeStats.filter((s) => s.statusType === 'idle').length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Yet to submit first evaluation</div>
        </div>
      </div>

      {/* Comparative Evaluation Load Chart */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8E4]">
          <div className="flex items-center gap-2 font-bold text-sm text-[#11241C]">
            <BarChart2 className="w-4 h-4 text-[#0B6E4F]" />
            <span>Evaluation Workload Comparison</span>
          </div>
          <span className="text-xs text-gray-400">Relative evaluation count per judge</span>
        </div>

        <div className="space-y-3 pt-2">
          {judgeStats.map((s) => {
            const barWidth = Math.max(8, Math.round((s.count / maxJudgeCount) * 100));

            return (
              <div key={s.judge.JudgeID} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-800 truncate max-w-xs">
                    {s.judge.Name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-500 text-[11px]">
                      {s.count} / {s.target} scored
                    </span>
                    <span className="font-mono font-bold text-xs text-[#0B6E4F]">
                      ({s.percent}%)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-[#F1F5F2] rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      s.count >= s.target
                        ? 'bg-gradient-to-r from-[#0B6E4F] to-emerald-400'
                        : s.count > 0
                        ? 'bg-gradient-to-r from-[#B8860B] to-[#E6C65C]'
                        : 'bg-gray-300'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Judges List with Filters */}
      <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-sm overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-5 border-b border-[#E2E8E4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#F9FBFA]">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#CBD7D0]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'all'
                  ? 'bg-[#0B6E4F] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({judgeStats.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'completed'
                  ? 'bg-[#0B6E4F] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({judgeStats.filter((s) => s.statusType === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'in_progress'
                  ? 'bg-[#0B6E4F] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              In Progress ({judgeStats.filter((s) => s.statusType === 'in_progress').length})
            </button>
            <button
              onClick={() => setFilter('idle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'idle'
                  ? 'bg-[#0B6E4F] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Idle ({judgeStats.filter((s) => s.statusType === 'idle').length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search judge or code..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#CBD7D0] focus:border-[#0B6E4F] rounded-xl outline-none"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F1F5F2] text-[#2C3F35] font-bold border-b border-[#E2E8E4]">
              <tr>
                <th className="py-3 px-4">Judge &amp; Institution</th>
                <th className="py-3 px-4 text-center">Access Code</th>
                <th className="py-3 px-4 w-48">Progress &amp; Quota</th>
                <th className="py-3 px-4 text-center">Avg Score Given</th>
                <th className="py-3 px-4 text-center">Scoring Tendency</th>
                <th className="py-3 px-4 text-center">Last Active</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3F0]">
              {filteredStats.map((s) => (
                <tr key={s.judge.JudgeID} className="hover:bg-[#F9FBFA] transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#11241C]">{s.judge.Name}</div>
                    <div className="text-[11px] text-gray-500">
                      {s.judge.Institution} • {s.judge.Title || s.judge.Role}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-xs">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {s.judge.AccessCode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-mono font-bold text-gray-800">
                          {s.count} / {s.target}
                        </span>
                        <span className="font-mono font-bold text-[#0B6E4F]">
                          {s.percent}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            s.count >= s.target
                              ? 'bg-[#0B6E4F]'
                              : s.count > 0
                              ? 'bg-[#B8860B]'
                              : 'bg-gray-200'
                          }`}
                          style={{ width: `${s.percent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#0B6E4F] text-base">
                    {s.count > 0 ? (
                      <>
                        {s.avgScore}{' '}
                        <span className="text-[11px] text-gray-400 font-normal">/ 40</span>
                      </>
                    ) : (
                      <span className="text-gray-300 font-normal text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        s.tendency === 'Generous'
                          ? 'bg-amber-100 text-amber-800'
                          : s.tendency === 'Strict / Discerning'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {s.tendency}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{s.lastActive}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        s.statusType === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.statusType === 'in_progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.statusType === 'completed'
                        ? 'Target Met'
                        : s.statusType === 'in_progress'
                        ? 'In Progress'
                        : 'Idle'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
