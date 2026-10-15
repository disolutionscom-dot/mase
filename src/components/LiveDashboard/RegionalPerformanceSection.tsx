import React, { useState } from 'react';
import {
  MapPin,
  Trophy,
  Building2,
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Search,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  School,
  User,
  Tag,
} from 'lucide-react';
import { RankingsData, EmirateRanking, ProjectResult } from '../../types';

interface RegionalPerformanceSectionProps {
  rankings: RankingsData;
  onExportRegionalCsv?: (emirate: string) => void;
}

export const RegionalPerformanceSection: React.FC<RegionalPerformanceSectionProps> = ({
  rankings,
  onExportRegionalCsv,
}) => {
  const [selectedEmirate, setSelectedEmirate] = useState<string>('all');
  const [searchProject, setSearchProject] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const emiratesList = rankings.emirateRankings || [];

  // Active emirate or top one
  const activeEmirateData =
    selectedEmirate === 'all'
      ? null
      : emiratesList.find((e) => e.emirate.toLowerCase() === selectedEmirate.toLowerCase());

  // Aggregate stats across regions
  const totalEligibleProjects = emiratesList.reduce((acc, e) => acc + e.eligible, 0);
  const highestAvgEmirate = [...emiratesList].sort((a, b) => b.avgPct - a.avgPct)[0];
  const mostPlacementsEmirate = [...emiratesList].sort((a, b) => b.placements - a.placements)[0];

  // Unique categories
  const allCategories = Array.from(
    new Set(rankings.categoryRankings.map((c) => c.category))
  );

  // Filter projects when viewing a specific or all emirates
  const getFilteredProjects = (emData: EmirateRanking): ProjectResult[] => {
    return (emData.topProjects || []).filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchProject.toLowerCase()) ||
        p.schoolName.toLowerCase().includes(searchProject.toLowerCase()) ||
        (p.leadName && p.leadName.toLowerCase().includes(searchProject.toLowerCase()));
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  };

  const downloadEmirateCsv = (em: EmirateRanking) => {
    const rows = [
      ['Emirate', 'Rank within Emirate', 'Project Title', 'School', 'Category', 'Lead Student', 'Final Score (/40)', 'Percentage (%)'],
      ...em.topProjects.map((p, idx) => [
        em.emirate,
        idx + 1,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.schoolName.replace(/"/g, '""')}"`,
        `"${p.category.replace(/"/g, '""')}"`,
        `"${(p.leadName || 'Student').replace(/"/g, '""')}"`,
        p.finalScore,
        `${p.percentage}%`,
      ]),
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GMU_MASE_${em.emirate.replace(/\s+/g, '_')}_Regional_Performance.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0A3D2C] via-[#0B6E4F] to-[#0A3D2C] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-[#D4AF37]/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 rounded-full text-xs font-bold text-[#E6C65C]">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>REGIONAL PERFORMANCE &amp; EMIRATE BENCHMARKING</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              UAE Regional Competitive Landscape
            </h2>
            <p className="text-xs sm:text-sm text-[#C7DDD3] max-w-2xl leading-relaxed">
              Explore academic performance across Abu Dhabi, Dubai, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain. Evaluated using GMU's fair mean formula to neutralize volume bias.
            </p>
          </div>

          {/* Regional Quick Highlights */}
          <div className="flex flex-wrap lg:flex-nowrap gap-3 text-xs flex-shrink-0">
            <div className="bg-[#05261B]/80 px-4 py-2.5 rounded-2xl border border-[#0B6E4F]/50">
              <span className="text-[10px] text-[#9FC4B4] uppercase tracking-wider block font-bold">
                Highest Average Score
              </span>
              <span className="text-base font-black text-[#D4AF37]">
                {highestAvgEmirate ? `${highestAvgEmirate.emirate} (${highestAvgEmirate.avgPct}%)` : '—'}
              </span>
            </div>

            <div className="bg-[#05261B]/80 px-4 py-2.5 rounded-2xl border border-[#0B6E4F]/50">
              <span className="text-[10px] text-[#9FC4B4] uppercase tracking-wider block font-bold">
                Most Top-3 Placements
              </span>
              <span className="text-base font-black text-emerald-400">
                {mostPlacementsEmirate ? `${mostPlacementsEmirate.emirate} (${mostPlacementsEmirate.placements} Medals)` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Competitive Landscape Overview Grid */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E4]">
          <div>
            <h3 className="font-bold text-sm text-[#11241C] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0B6E4F]" />
              <span>Emirates Performance Comparison</span>
            </h3>
            <p className="text-xs text-gray-500">
              Comparative average project percentage and podium medal count across all 7 Emirates.
            </p>
          </div>
          <span className="text-xs font-mono bg-[#E6F1EC] text-[#0B6E4F] px-2.5 py-1 rounded-full font-bold">
            7 Emirates Tracked
          </span>
        </div>

        {/* Visual Comparison Bar Chart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {emiratesList.map((e) => {
            const isSelected = selectedEmirate.toLowerCase() === e.emirate.toLowerCase();

            return (
              <button
                key={e.emirate}
                onClick={() => setSelectedEmirate(isSelected ? 'all' : e.emirate)}
                className={`p-4 rounded-2xl border-2 text-left transition relative group ${
                  isSelected
                    ? 'border-[#0B6E4F] bg-[#E6F1EC]/60 shadow-md ring-2 ring-[#0B6E4F]/20'
                    : 'border-[#E2E8E4] bg-white hover:border-[#0B6E4F]/50 hover:bg-[#F9FBFA]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold font-mono flex items-center justify-center ${
                        e.rank === 1
                          ? 'bg-amber-400 text-amber-950 font-black'
                          : e.rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : e.rank === 3
                          ? 'bg-amber-800 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {e.rank}
                    </span>
                    <span className="font-bold text-sm text-[#11241C]">{e.emirate}</span>
                  </div>

                  <span className="text-[11px] font-mono font-bold text-[#0B6E4F] bg-white px-2 py-0.5 rounded border border-[#CBD7D0]">
                    {e.avgPct}%
                  </span>
                </div>

                {/* Progress bar representing score */}
                <div className="w-full bg-[#F1F5F2] rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      e.rank === 1
                        ? 'bg-[#B8860B]'
                        : e.rank <= 3
                        ? 'bg-[#0B6E4F]'
                        : 'bg-[#55685F]'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(15, e.avgPct))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-[#EEF3F0]">
                  <span>{e.eligible} Projects • {e.schoolCount} Schools</span>
                  <span className="font-semibold text-[#B8860B]">
                    {e.placements} Top-3 Medal{e.placements !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="text-[10px] text-[#0B6E4F] font-bold mt-2 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>{isSelected ? '✓ Viewing Breakdown' : 'Click to inspect region →'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8E4] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Emirate filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">
            Focus:
          </span>
          <button
            onClick={() => setSelectedEmirate('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedEmirate === 'all'
                ? 'bg-[#0B6E4F] text-white shadow-xs'
                : 'bg-[#F4F7F5] text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Emirates ({emiratesList.length})
          </button>
          {emiratesList.map((em) => (
            <button
              key={em.emirate}
              onClick={() => setSelectedEmirate(em.emirate)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedEmirate.toLowerCase() === em.emirate.toLowerCase()
                  ? 'bg-[#0B6E4F] text-white shadow-xs'
                  : 'bg-[#F4F7F5] text-gray-700 hover:bg-gray-200'
              }`}
            >
              {em.emirate}
            </button>
          ))}
        </div>

        {/* Search and Category filter within the region */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              value={searchProject}
              onChange={(e) => setSearchProject(e.target.value)}
              placeholder="Filter project / student..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F7F5] border border-[#CBD7D0] focus:border-[#0B6E4F] rounded-xl outline-none"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white border border-[#CBD7D0] rounded-xl outline-none text-gray-700"
          >
            <option value="all">All Streams</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* In-Depth Regional Breakdown for Selected Emirate(s) */}
      <div className="space-y-6">
        {emiratesList
          .filter((em) => selectedEmirate === 'all' || selectedEmirate.toLowerCase() === em.emirate.toLowerCase())
          .map((em) => {
            const projects = getFilteredProjects(em);
            const topProject = em.topProjects[0];
            const topSchool = em.topSchools[0];

            return (
              <div
                key={em.emirate}
                className="bg-white rounded-3xl border-2 border-[#0B6E4F]/30 p-6 shadow-sm space-y-6 transition hover:shadow-md"
              >
                {/* Emirate Header Card */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#E2E8E4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#0B6E4F] text-[#D4AF37] font-black text-sm flex items-center justify-center shadow-xs">
                        #{em.rank}
                      </span>
                      <div>
                        <h3 className="text-xl font-black text-[#11241C] flex items-center gap-2">
                          <span>{em.emirate} Regional Standings</span>
                        </h3>
                        <p className="text-xs text-gray-500">
                          Fair Mean: <strong>{em.avgPct}%</strong> • {em.eligible} Scored Projects • {em.schoolCount} Participating Schools
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadEmirateCsv(em)}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export {em.emirate} CSV</span>
                    </button>
                  </div>
                </div>

                {/* Regional Highlights Grid: Top Project & Top School Spotlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* #1 Top Project Spotlight */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-white border-2 border-amber-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#B8860B] uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-full">
                        <Trophy className="w-3 h-3 text-[#B8860B]" />
                        <span>#1 Project in {em.emirate}</span>
                      </span>
                      {topProject && (
                        <span className="font-mono font-black text-sm text-[#0B6E4F]">
                          {topProject.finalScore} / 40 ({topProject.percentage}%)
                        </span>
                      )}
                    </div>

                    {topProject ? (
                      <div>
                        <h4 className="font-bold text-sm text-[#11241C] leading-snug">
                          {topProject.title}
                        </h4>
                        <div className="text-xs text-gray-600 mt-1">
                          {topProject.schoolName} • <span className="text-[#0B6E4F] font-semibold">{topProject.category}</span>
                        </div>
                        {topProject.leadName && (
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Lead Student: <strong>{topProject.leadName}</strong>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No scored projects</p>
                    )}
                  </div>

                  {/* #1 Top School Spotlight */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#E6F1EC]/70 to-white border-2 border-[#0B6E4F]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#0B6E4F] uppercase tracking-wider bg-[#E6F1EC] px-2.5 py-0.5 rounded-full">
                        <Building2 className="w-3 h-3 text-[#0B6E4F]" />
                        <span>#1 School in {em.emirate}</span>
                      </span>
                      {topSchool && (
                        <span className="font-mono font-black text-sm text-[#B8860B]">
                          {topSchool.metric} pts
                        </span>
                      )}
                    </div>

                    {topSchool ? (
                      <div>
                        <h4 className="font-bold text-sm text-[#11241C] leading-snug">
                          {topSchool.school}
                        </h4>
                        <div className="text-xs text-gray-600 mt-1">
                          {topSchool.projects} projects represented in competition
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Highest composite score among institutions in {em.emirate}.
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No schools registered</p>
                    )}
                  </div>
                </div>

                {/* Two-Column Breakdown: Ranked Projects & Ranked Schools */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                  {/* Ranked Projects List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#0A3D2C] uppercase tracking-wider flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-[#B8860B]" />
                        <span>Ranked Projects from {em.emirate} ({projects.length})</span>
                      </h4>
                    </div>

                    {projects.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-[#F6F8F7] text-gray-400 text-xs italic text-center">
                        No projects match the current search or category filter.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {projects.map((p, idx) => {
                          const isTop3 = idx < 3;

                          return (
                            <div
                              key={p.participantId}
                              className={`p-3.5 rounded-2xl border transition space-y-1.5 ${
                                idx === 0
                                  ? 'bg-amber-50/50 border-amber-300'
                                  : idx === 1
                                  ? 'bg-slate-50 border-slate-300'
                                  : idx === 2
                                  ? 'bg-amber-50/20 border-amber-200'
                                  : 'bg-[#F9FBFA] border-[#E2E8E4]'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold font-mono ${
                                        idx === 0
                                          ? 'bg-[#B8860B] text-white'
                                          : idx === 1
                                          ? 'bg-slate-400 text-white'
                                          : idx === 2
                                          ? 'bg-amber-800 text-white'
                                          : 'bg-gray-200 text-gray-700'
                                      }`}
                                    >
                                      {idx + 1}
                                    </span>
                                    <span className="font-bold text-xs text-[#11241C] line-clamp-1">
                                      {p.title}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-gray-600 pl-6.5">
                                    {p.schoolName} •{' '}
                                    <span className="text-[#0B6E4F] font-semibold">{p.category}</span>
                                    {p.tableName && (
                                      <span className="ml-1 text-gray-400 font-mono">
                                        (Table {p.tableName})
                                      </span>
                                    )}
                                  </div>

                                  {p.leadName && (
                                    <div className="text-[10px] text-gray-400 pl-6.5">
                                      Lead: {p.leadName}
                                    </div>
                                  )}
                                </div>

                                <div className="text-right flex-shrink-0">
                                  <div className="font-mono font-black text-sm text-[#0B6E4F]">
                                    {p.finalScore}{' '}
                                    <span className="text-[10px] text-gray-400 font-normal">/ 40</span>
                                  </div>
                                  <div className="text-[11px] font-mono font-bold text-[#B8860B]">
                                    {p.percentage}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Ranked Schools List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-[#0A3D2C] uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#0B6E4F]" />
                        <span>Ranked Schools in {em.emirate} ({em.topSchools.length})</span>
                      </h4>
                    </div>

                    {em.topSchools.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-[#F6F8F7] text-gray-400 text-xs italic text-center">
                        No schools registered for {em.emirate}.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {em.topSchools.map((s, sIdx) => (
                          <div
                            key={s.school}
                            className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                              sIdx === 0
                                ? 'bg-[#E6F1EC]/60 border-[#0B6E4F]/40'
                                : 'bg-[#F9FBFA] border-[#E2E8E4]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold font-mono ${
                                  sIdx === 0 ? 'bg-[#0B6E4F] text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {sIdx + 1}
                              </span>
                              <div>
                                <div className="font-bold text-xs text-[#11241C]">{s.school}</div>
                                <div className="text-[11px] text-gray-500">
                                  {s.projects} project{s.projects > 1 ? 's' : ''} submitted
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="text-[10px] text-gray-400 font-semibold uppercase">
                                Performance Metric
                              </div>
                              <div className="text-sm font-black font-mono text-[#B8860B]">
                                {s.metric} pts
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
