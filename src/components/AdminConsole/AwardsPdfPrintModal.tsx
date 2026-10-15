import React, { useRef } from 'react';
import {
  Printer,
  X,
  Trophy,
  Award,
  Medal,
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { RankingsData, SystemSettings, School } from '../../types';

interface AwardsPdfPrintModalProps {
  rankings: RankingsData;
  settings: SystemSettings;
  schools: School[];
  onClose: () => void;
}

export const AwardsPdfPrintModal: React.FC<AwardsPdfPrintModalProps> = ({
  rankings,
  settings,
  schools,
  onClose,
}) => {
  const printContentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const top10 = rankings.overallTop10 || [];
  const top1 = top10[0];
  const top2 = top10[1];
  const top3 = top10[2];

  const topSchool = rankings.schoolRankings[0];
  const topEmirate = rankings.emirateRankings[0];

  const ceremonyDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-[#CBD7D0]">
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="print:hidden p-4 bg-[#0A3D2C] text-white flex items-center justify-between gap-4 border-b border-[#0B6E4F]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-bold text-sm">
              Awards Ceremony Official PDF Summary — Print Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#D4AF37] hover:bg-[#c09d2e] text-[#241900] text-xs font-black rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Awards PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-[#FAFCFA]">
          <div
            ref={printContentRef}
            id="printableAwardsDocument"
            className="max-w-[760px] mx-auto bg-white p-8 sm:p-12 shadow-md rounded-2xl border border-gray-200 text-gray-900 font-sans print:shadow-none print:border-none print:p-0 print:m-0"
          >
            {/* Header / University Banner */}
            <div className="text-center border-b-2 border-[#0B6E4F] pb-6 mb-6 relative">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#0B6E4F] text-[#D4AF37] font-black text-2xl flex items-center justify-center shadow-md">
                  M
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold tracking-widest text-[#B8860B] uppercase">
                    Gulf Medical University
                  </div>
                  <div className="text-xl font-black text-[#0A3D2C] tracking-tight">
                    MASE EXHIBITION 2026
                  </div>
                </div>
              </div>

              <div className="text-xs font-bold text-gray-700 uppercase tracking-widest mt-1">
                Annual Medical and Science Exhibition • Official Awards Ceremony
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Ajman, United Arab Emirates • {ceremonyDate}
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#E6F1EC] text-[#0B6E4F] border border-[#0B6E4F]/40">
                <CheckCircle2 className="w-3 h-3 text-[#0B6E4F]" />
                <span>Verified Official Competition Standings</span>
              </div>
            </div>

            {/* Podium / Overall Champions */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h3 className="text-sm font-black text-[#0A3D2C] uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-[#B8860B]" />
                  <span>Grand Overall Championship Podium</span>
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">
                  Standardized 40-Point GMU Rubric
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1st Place Gold */}
                {top1 && (
                  <div className="p-4 rounded-xl border-2 border-[#B8860B] bg-gradient-to-b from-amber-50/60 to-white relative space-y-2 text-center order-1 sm:order-2">
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black bg-[#B8860B] text-white uppercase tracking-wider">
                      🥇 First Place (Gold)
                    </span>
                    <div className="font-bold text-xs text-gray-900 line-clamp-2 min-h-[32px]">
                      {top1.title}
                    </div>
                    <div className="text-[11px] text-gray-600 font-medium">
                      {top1.schoolName}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Lead: {top1.leadName || 'Student Team'}
                    </div>
                    <div className="pt-2 border-t border-amber-200 text-xs font-mono font-black text-[#0B6E4F]">
                      {top1.finalScore} / 40 ({top1.percentage}%)
                    </div>
                  </div>
                )}

                {/* 2nd Place Silver */}
                {top2 && (
                  <div className="p-4 rounded-xl border border-gray-300 bg-gradient-to-b from-gray-50/70 to-white relative space-y-2 text-center order-2 sm:order-1">
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black bg-slate-400 text-white uppercase tracking-wider">
                      🥈 Second Place (Silver)
                    </span>
                    <div className="font-bold text-xs text-gray-900 line-clamp-2 min-h-[32px]">
                      {top2.title}
                    </div>
                    <div className="text-[11px] text-gray-600 font-medium">
                      {top2.schoolName}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Lead: {top2.leadName || 'Student Team'}
                    </div>
                    <div className="pt-2 border-t border-gray-200 text-xs font-mono font-black text-[#0B6E4F]">
                      {top2.finalScore} / 40 ({top2.percentage}%)
                    </div>
                  </div>
                )}

                {/* 3rd Place Bronze */}
                {top3 && (
                  <div className="p-4 rounded-xl border border-amber-800/30 bg-gradient-to-b from-amber-50/30 to-white relative space-y-2 text-center order-3">
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-800 text-white uppercase tracking-wider">
                      🥉 Third Place (Bronze)
                    </span>
                    <div className="font-bold text-xs text-gray-900 line-clamp-2 min-h-[32px]">
                      {top3.title}
                    </div>
                    <div className="text-[11px] text-gray-600 font-medium">
                      {top3.schoolName}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Lead: {top3.leadName || 'Student Team'}
                    </div>
                    <div className="pt-2 border-t border-amber-200 text-xs font-mono font-black text-[#0B6E4F]">
                      {top3.finalScore} / 40 ({top3.percentage}%)
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Overall Top 10 Ranked Roll */}
            <div className="mb-8 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Overall Ranked Finalists (Top 10)
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#F1F5F2] font-bold text-[#0A3D2C] border-b border-gray-200">
                    <tr>
                      <th className="py-2 px-3 text-center w-10">#</th>
                      <th className="py-2 px-3">Project Title</th>
                      <th className="py-2 px-3">School</th>
                      <th className="py-2 px-3">Emirate</th>
                      <th className="py-2 px-3 text-right">Score</th>
                      <th className="py-2 px-3 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {top10.slice(0, 10).map((p) => (
                      <tr key={p.participantId} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-center font-bold font-mono">
                          {p.overallRank}
                        </td>
                        <td className="py-2 px-3 font-semibold text-gray-900">
                          {p.title}
                        </td>
                        <td className="py-2 px-3 text-gray-600">{p.schoolName}</td>
                        <td className="py-2 px-3 text-gray-500">{p.emirate}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#0B6E4F]">
                          {p.finalScore}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-gray-700">
                          {p.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Winners Breakdown */}
            <div className="mb-8 space-y-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#0B6E4F]" />
                <span>Exhibition Category Champions</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {rankings.categoryRankings.map((cat) => {
                  const winner = cat.projects[0];
                  const runnerUp = cat.projects[1];

                  return (
                    <div
                      key={cat.category}
                      className="p-3.5 rounded-xl border border-gray-200 bg-[#F9FBFA] space-y-1.5"
                    >
                      <div className="font-black text-[#0B6E4F] text-[11px] uppercase tracking-wider">
                        {cat.category}
                      </div>

                      {winner ? (
                        <div>
                          <div className="font-bold text-gray-900 leading-tight">
                            🏆 1st: {winner.title}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {winner.schoolName} • {winner.finalScore} pts ({winner.percentage}%)
                          </div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-400 italic">No entries scored</div>
                      )}

                      {runnerUp && (
                        <div className="pt-1 border-t border-gray-200 text-[10px] text-gray-600">
                          🥈 2nd: <strong>{runnerUp.title}</strong> ({runnerUp.schoolName} — {runnerUp.finalScore} pts)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* UAE Emirate Champions: Top Performing Schools & Projects by Emirate */}
            <div className="mb-8 space-y-3 avoid-break">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0B6E4F]" />
                <span>UAE Emirate Champions: Top Performing Schools &amp; Projects by Emirate</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {rankings.emirateRankings.map((em) => {
                  const topProject = em.topProjects[0];
                  const topSchool = em.topSchools[0];

                  return (
                    <div
                      key={em.emirate}
                      className="p-3.5 rounded-xl border border-gray-200 bg-[#F9FBFA] space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-black text-[#0B6E4F] text-[11px] uppercase tracking-wider">
                          {em.emirate} (Avg {em.avgPct}%)
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Rank #{em.rank}
                        </span>
                      </div>

                      {topProject ? (
                        <div className="text-[11px]">
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">Top Project:</span>
                          <span className="font-bold text-gray-900 leading-tight block">
                            🥇 {topProject.title}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {topProject.schoolName} • {topProject.finalScore} pts ({topProject.percentage}%)
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-400 italic">No scored projects</div>
                      )}

                      {topSchool && (
                        <div className="pt-1.5 border-t border-gray-200 text-[10px] text-gray-700">
                          <span className="text-gray-400 text-[9px] uppercase font-bold block">Top School:</span>
                          <strong>🏫 {topSchool.school}</strong> (Score Metric: {topSchool.metric} pts)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Institutional Honors: Best School & Top Emirate */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl border border-[#D4AF37]/40 bg-[#FBF9F4] space-y-1">
                <span className="text-[10px] font-bold text-[#B8860B] uppercase tracking-wider">
                  Best Performing Institution Award
                </span>
                <div className="font-black text-sm text-gray-900">
                  {topSchool ? topSchool.school : 'N/A'}
                </div>
                <div className="text-[10px] text-gray-500">
                  Top institutional score across all competitive entries.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#0B6E4F]/40 bg-[#E6F1EC]/40 space-y-1">
                <span className="text-[10px] font-bold text-[#0B6E4F] uppercase tracking-wider">
                  Top Performing UAE Emirate Award
                </span>
                <div className="font-black text-sm text-gray-900">
                  {topEmirate ? `${topEmirate.emirate} (${topEmirate.avgPct}% Mean Score)` : 'N/A'}
                </div>
                <div className="text-[10px] text-gray-500">
                  Fair Mean Score across eligible participating schools.
                </div>
              </div>
            </div>

            {/* Formal Signature & Verification Footer */}
            <div className="pt-6 border-t-2 border-gray-300 grid grid-cols-3 gap-6 text-center text-[10px] text-gray-600">
              <div className="space-y-6">
                <div className="h-10 border-b border-gray-400 mx-4" />
                <div>
                  <strong>Prof. Chairperson of the Jury</strong>
                  <div className="text-gray-400">Board of Examiners</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="h-10 border-b border-gray-400 mx-4" />
                <div>
                  <strong>Dean, College of Medicine</strong>
                  <div className="text-gray-400">Gulf Medical University</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="h-10 border-b border-gray-400 mx-4" />
                <div>
                  <strong>Exhibition Director</strong>
                  <div className="text-gray-400">MASE Committee 2026</div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-[9px] text-gray-400">
              Certified Official Document • Generated via Gulf Medical University MASE Platform • All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
