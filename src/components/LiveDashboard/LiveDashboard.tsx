import React, { useState, useEffect } from 'react';
import {
  Trophy,
  BarChart3,
  Building2,
  MapPin,
  RefreshCw,
  Sparkles,
  Award,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  TrendingUp,
  Target,
  ShieldAlert,
} from 'lucide-react';
import { RankingsData, Evaluation, Participant, SystemSettings } from '../../types';
import { RegionalPerformanceSection } from './RegionalPerformanceSection';
import { SchoolRadarComparison } from './SchoolRadarComparison';
import { ProjectConsistencyScorecard } from './ProjectConsistencyScorecard';

interface LiveDashboardProps {
  rankings: RankingsData;
  evaluations: Evaluation[];
  participants: Participant[];
  settings: SystemSettings;
  onRefresh: () => void;
  onSelectProject?: (project: Participant) => void;
}

export const LiveDashboard: React.FC<LiveDashboardProps> = ({
  rankings,
  evaluations,
  participants,
  settings,
  onRefresh,
  onSelectProject,
}) => {
  const [activeTab, setActiveTab] = useState<
    'top10' | 'categories' | 'schools' | 'radar' | 'consistency' | 'emirates' | 'stream'
  >('top10');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEmirateFilter, setSelectedEmirateFilter] = useState<string>('all');
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  // Count judging anomalies for badge
  const anomalyCount = React.useMemo(() => {
    const evalsByProject = new Map<string, number[]>();
    evaluations.filter((e) => e.Status === 'Submitted').forEach((e) => {
      const list = evalsByProject.get(e.ParticipantID) || [];
      list.push(Number(e.Total));
      evalsByProject.set(e.ParticipantID, list);
    });
    let count = 0;
    evalsByProject.forEach((scores) => {
      if (scores.length >= 2) {
        const spread = Math.max(...scores) - Math.min(...scores);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance =
          scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) /
          (scores.length - 1);
        const stdDev = Math.sqrt(variance);
        if (spread >= 5.0 || stdDev >= 2.5) count++;
      }
    });
    return count;
  }, [evaluations]);

  // Auto-refresh timer every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      onRefresh();
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 15000);
    return () => clearInterval(timer);
  }, [onRefresh]);

  const handleManualRefresh = () => {
    onRefresh();
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  // Compute metrics
  const totalProjects = participants.length;
  const submittedEvals = evaluations.filter((e) => e.Status === 'Submitted');
  const expectedEvals = totalProjects; // minimum 1 per project
  const progressPercent = Math.min(
    100,
    expectedEvals > 0 ? Math.round((submittedEvals.length / expectedEvals) * 100) : 0
  );
  const fullyEvaluated = participants.filter((p) => {
    const evs = submittedEvals.filter((e) => e.ParticipantID === p.ParticipantID);
    return evs.length >= 1;
  }).length;

  const avgExhibitionScore =
    submittedEvals.length > 0
      ? Math.round(
          (submittedEvals.reduce((sum, e) => sum + e.Total, 0) / submittedEvals.length) * 10
        ) / 10
      : 0;

  // Recent live submissions
  const recentSubmissions = [...submittedEvals]
    .sort((a, b) => new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime())
    .slice(0, 8);

  const getParticipant = (id: string) => participants.find((p) => p.ParticipantID === id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0A3D2C] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-[#0B6E4F]/30">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#B8860B]/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 rounded-full text-xs font-bold text-[#E6C65C]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>GULF MEDICAL UNIVERSITY • MASE 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Live Evaluation &amp; Results Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#C7DDD3]">
              Instant score tabulation, category standings, and overall rankings for faculty and visitors.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="bg-[#05261B] px-3.5 py-2 rounded-xl border border-[#0B6E4F]/40 text-xs text-[#9FC4B4] flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Updated: {lastRefreshed}</span>
            </div>

            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-2 bg-[#0B6E4F] hover:bg-[#08533b] text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Now</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-[#C7DDD3]">
            <span>Exhibition Judging Progress ({fullyEvaluated} of {totalProjects} projects evaluated)</span>
            <span className="font-bold font-mono text-[#D4AF37]">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-[#05261B] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#0B6E4F] via-[#D4AF37] to-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total Projects
          </div>
          <div className="text-3xl font-black text-[#11241C] font-mono mt-1">
            {totalProjects}
          </div>
          <div className="text-[11px] text-[#5B6E64] mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0B6E4F]" />
            <span>{fullyEvaluated} fully scored</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Evaluations Done
          </div>
          <div className="text-3xl font-black text-[#0B6E4F] font-mono mt-1">
            {submittedEvals.length}
          </div>
          <div className="text-[11px] text-[#5B6E64] mt-1">
            Recorded in real time
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Avg Score (/40)
          </div>
          <div className="text-3xl font-black text-[#B8860B] font-mono mt-1">
            {avgExhibitionScore}
          </div>
          <div className="text-[11px] text-[#5B6E64] mt-1">
            Across all criteria
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8E4] shadow-xs">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Competition Status
          </div>
          <div className="mt-1">
            <span
              className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                rankings.final
                  ? 'bg-emerald-100 text-emerald-800'
                  : rankings.published
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {rankings.final
                ? 'Official Final'
                : rankings.published
                ? 'Provisional Standings'
                : 'Judging In Progress'}
            </span>
          </div>
          <div className="text-[11px] text-[#5B6E64] mt-1">
            Method: {settings.OverallRankMethod === 'raw' ? 'Raw Points' : 'Percentage %'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E2E8E4] pb-3">
        <button
          onClick={() => setActiveTab('top10')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'top10'
              ? 'bg-[#0B6E4F] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#E2E8E4]'
          }`}
        >
          <Trophy className="w-4 h-4 text-[#D4AF37]" />
          <span>Overall Top 10</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'categories'
              ? 'bg-[#0B6E4F] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#E2E8E4]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>By Category</span>
        </button>

        <button
          onClick={() => setActiveTab('schools')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'schools'
              ? 'bg-[#0B6E4F] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#E2E8E4]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>School Standings</span>
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'radar'
              ? 'bg-[#0B6E4F] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#E2E8E4]'
          }`}
        >
          <Target className="w-4 h-4 text-[#D4AF37]" />
          <span>Institutional Radar</span>
          <span className="bg-[#D4AF37]/20 text-[#B8860B] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
            Recharts
          </span>
        </button>

        <button
          onClick={() => setActiveTab('consistency')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'consistency'
              ? 'bg-[#0B6E4F] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#E2E8E4]'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>Consistency &amp; Anomalies</span>
          {anomalyCount > 0 ? (
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {anomalyCount} Flagged
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              Synced
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('emirates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'emirates'
              ? 'bg-[#0B6E4F] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#E2E8E4]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Regional Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('stream')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'stream'
              ? 'bg-[#0B6E4F] text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-[#E2E8E4]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Live Ticker ({recentSubmissions.length})</span>
        </button>
      </div>

      {/* Tab 1: Overall Top 10 */}
      {activeTab === 'top10' && (
        <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E2E8E4] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#F9FBFA]">
            <div>
              <h3 className="text-base font-bold text-[#11241C] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#B8860B]" />
                <span>MASE Exhibition Overall Top 10 Leaderboard</span>
              </h3>
              <p className="text-xs text-gray-500">
                Ranked by {rankings.method.overall} across all eligible exhibition categories.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F1F5F2] text-[#2C3F35] font-bold border-b border-[#E2E8E4]">
                <tr>
                  <th className="py-3 px-4 w-14 text-center">Rank</th>
                  <th className="py-3 px-4">Project Title</th>
                  <th className="py-3 px-4">School</th>
                  <th className="py-3 px-4">Emirate</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Final Score</th>
                  <th className="py-3 px-4 text-right">Percentage</th>
                  <th className="py-3 px-4 text-center">Judges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3F0]">
                {rankings.overallTop10.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No eligible evaluated projects yet.
                    </td>
                  </tr>
                ) : (
                  rankings.overallTop10.map((p) => {
                    const isTop3 = (p.overallRank || 0) <= 3;
                    const rankBadgeColor =
                      p.overallRank === 1
                        ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                        : p.overallRank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : p.overallRank === 3
                        ? 'bg-amber-700/80 text-amber-100'
                        : 'bg-gray-100 text-gray-700';

                    return (
                      <tr
                        key={p.participantId}
                        className={`hover:bg-[#F9FBFA] transition ${
                          isTop3 ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${rankBadgeColor}`}
                          >
                            {p.overallRank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#11241C] max-w-xs sm:max-w-md">
                          <div className="truncate">{p.title}</div>
                          {p.tableName && (
                            <span className="text-[11px] font-mono text-[#0B6E4F] font-semibold">
                              Table {p.tableName}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 font-medium">
                          {p.schoolName}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium">
                            {p.emirate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          <span className="bg-[#E6F1EC] text-[#0B6E4F] px-2 py-0.5 rounded text-xs font-semibold">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#0B6E4F] text-base">
                          {p.finalScore}{' '}
                          <span className="text-xs font-normal text-gray-400">/ 40</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#B8860B]">
                          {p.percentage}%
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-gray-500">
                          {p.judgeCount}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: By Category */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === 'all'
                  ? 'bg-[#0B6E4F] text-white'
                  : 'bg-white text-gray-700 border border-[#E2E8E4]'
              }`}
            >
              All Categories
            </button>
            {rankings.categoryRankings.map((c) => (
              <button
                key={c.category}
                onClick={() => setSelectedCategory(c.category)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === c.category
                    ? 'bg-[#0B6E4F] text-white'
                    : 'bg-white text-gray-700 border border-[#E2E8E4]'
                }`}
              >
                {c.category} ({c.projects.length})
              </button>
            ))}
          </div>

          {rankings.categoryRankings
            .filter((c) => selectedCategory === 'all' || selectedCategory === c.category)
            .map((cat) => (
              <div
                key={cat.category}
                className="bg-white rounded-3xl border border-[#E2E8E4] shadow-sm overflow-hidden"
              >
                <div className="p-5 border-b border-[#E2E8E4] bg-[#F9FBFA] flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#11241C]">{cat.category}</h3>
                    <p className="text-xs text-gray-500">
                      Ranked by score with tie-break on rubric criteria.
                    </p>
                  </div>
                  <span className="bg-[#E6F1EC] text-[#0B6E4F] text-xs font-bold px-3 py-1 rounded-full">
                    {cat.projects.length} Projects
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#F1F5F2] text-[#2C3F35] font-bold border-b border-[#E2E8E4]">
                      <tr>
                        <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                        <th className="py-2.5 px-4">Project</th>
                        <th className="py-2.5 px-4">School</th>
                        <th className="py-2.5 px-4">Lead</th>
                        <th className="py-2.5 px-4 text-right">Score</th>
                        <th className="py-2.5 px-4 text-right">%</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF3F0]">
                      {cat.projects.map((p) => (
                        <tr key={p.participantId} className="hover:bg-[#F9FBFA]">
                          <td className="py-3 px-4 text-center font-bold">
                            <span
                              className={`inline-block w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                                p.rank === 1
                                  ? 'bg-amber-400 text-amber-950 font-black'
                                  : p.rank === 2
                                  ? 'bg-slate-300 text-slate-800'
                                  : p.rank === 3
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {p.rank}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#11241C]">
                            <div>{p.title}</div>
                            {p.tableName && (
                              <span className="text-[11px] font-mono text-[#0B6E4F]">
                                Table {p.tableName}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{p.schoolName}</td>
                          <td className="py-3 px-4 text-gray-500">{p.leadName || 'N/A'}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#0B6E4F]">
                            {p.finalScore}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-[#B8860B]">
                            {p.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Tab 3: School Standings */}
      {activeTab === 'schools' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E2E8E4] bg-[#F9FBFA] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[#11241C] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#0B6E4F]" />
                  <span>School Performance Standings</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Ranked using {rankings.method.school} across all participating schools.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('radar')}
                className="flex items-center gap-2 bg-[#E6F1EC] hover:bg-[#d8eade] text-[#0B6E4F] px-3.5 py-1.5 rounded-xl text-xs font-bold transition border border-[#0B6E4F]/20"
              >
                <Target className="w-4 h-4 text-[#0B6E4F]" />
                <span>Open Multi-Skill Radar Benchmark</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F1F5F2] text-[#2C3F35] font-bold border-b border-[#E2E8E4]">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">School Name</th>
                    <th className="py-3 px-4 text-center">Total Entries</th>
                    <th className="py-3 px-4 text-center">Eligible Scored</th>
                    <th className="py-3 px-4 text-right">Total Points</th>
                    <th className="py-3 px-4 text-right">Performance Metric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF3F0]">
                  {rankings.schoolRankings.map((s) => (
                    <tr key={s.school} className="hover:bg-[#F9FBFA]">
                      <td className="py-3.5 px-4 text-center font-bold font-mono">
                        {s.rank}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#11241C]">
                        {s.school}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">{s.projects}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#0B6E4F]">
                        {s.eligible}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">{s.totalPoints}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-base text-[#B8860B]">
                        {s.metric}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Embedded Radar Section for institutional skill comparison */}
          <div className="pt-2">
            <SchoolRadarComparison
              evaluations={evaluations}
              participants={participants}
            />
          </div>
        </div>
      )}

      {/* Tab 4: Institutional Radar Benchmark (Dedicated Tab) */}
      {activeTab === 'radar' && (
        <SchoolRadarComparison
          evaluations={evaluations}
          participants={participants}
        />
      )}

      {/* Tab 5: Judging Consistency & Anomalies (Dedicated Tab) */}
      {activeTab === 'consistency' && (
        <ProjectConsistencyScorecard
          evaluations={evaluations}
          participants={participants}
          onSelectProject={onSelectProject}
        />
      )}

      {/* Tab 6: Regional Performance */}
      {activeTab === 'emirates' && (
        <RegionalPerformanceSection rankings={rankings} />
      )}

      {/* Tab 5: Live Ticker Stream */}
      {activeTab === 'stream' && (
        <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E4]">
            <div>
              <h3 className="font-bold text-base text-[#11241C]">Recent Live Submissions</h3>
              <p className="text-xs text-gray-500">
                Incoming scores from judges on the exhibition floor.
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-[#0B6E4F] font-bold px-2.5 py-1 rounded-full">
              Live Stream Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentSubmissions.map((e) => {
              const p = getParticipant(e.ParticipantID);
              const timeAgo = new Date(e.SubmittedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={e.EvaluationID}
                  className="p-4 rounded-2xl bg-[#F6F8F7] border border-[#E2E8E4] space-y-2 hover:border-[#0B6E4F] transition"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#0B6E4F]">
                      {e.EvaluationID}
                    </span>
                    <span className="text-gray-400 font-mono text-[11px]">{timeAgo}</span>
                  </div>

                  <div className="font-bold text-sm text-[#11241C] line-clamp-1">
                    {p?.Title || 'Project ' + e.ParticipantID}
                  </div>

                  <div className="text-xs text-gray-500 line-clamp-1">
                    Judge: <strong>{e.JudgeName}</strong>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8E4] text-xs">
                    <span className="text-gray-500">
                      Table: {p?.TableName || 'N/A'} • {p?.Category}
                    </span>
                    <span className="font-mono font-black text-sm text-[#0B6E4F]">
                      {e.Total} / 40 ({e.Percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
