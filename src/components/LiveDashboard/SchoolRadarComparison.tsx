import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
} from 'recharts';
import {
  Building2,
  Sparkles,
  Trophy,
  Award,
  Filter,
  Check,
  ChevronRight,
  TrendingUp,
  Info,
  Maximize2,
  BarChart2,
} from 'lucide-react';
import { Evaluation, Participant, School } from '../../types';

interface SchoolRadarComparisonProps {
  evaluations: Evaluation[];
  participants: Participant[];
  schools?: School[];
}

interface SchoolMetricAggregate {
  school: string;
  projectCount: number;
  evalCount: number;
  innovation: number; // C4 avg / 10
  presentation: number; // C3 avg / 10
  technicalSkill: number; // C2 avg / 10
  concept: number; // C1 avg / 10
  overallScore: number; // Avg Total / 4 -> / 10
  totalPointsAvg: number; // Avg Total out of 40
  color: string;
  fillColor: string;
}

const SCHOOL_PALETTE = [
  { stroke: '#0B6E4F', fill: '#0B6E4F', label: 'Emerald' },
  { stroke: '#D4AF37', fill: '#D4AF37', label: 'Gold' },
  { stroke: '#2563EB', fill: '#2563EB', label: 'Royal Blue' },
  { stroke: '#9333EA', fill: '#9333EA', label: 'Purple' },
  { stroke: '#DC2626', fill: '#DC2626', label: 'Ruby' },
  { stroke: '#0891B2', fill: '#0891B2', label: 'Cyan' },
  { stroke: '#EA580C', fill: '#EA580C', label: 'Orange' },
  { stroke: '#059669', fill: '#059669', label: 'Teal' },
  { stroke: '#4F46E5', fill: '#4F46E5', label: 'Indigo' },
];

export const SchoolRadarComparison: React.FC<SchoolRadarComparisonProps> = ({
  evaluations,
  participants,
  schools = [],
}) => {
  // 1. Calculate aggregated institutional metrics
  const schoolAggregates = useMemo<SchoolMetricAggregate[]>(() => {
    // Map participant ID to school name
    const participantSchoolMap = new Map<string, string>();
    participants.forEach((p) => {
      participantSchoolMap.set(p.ParticipantID, p.SchoolName);
    });

    // Group evaluations by school
    const grouped = new Map<
      string,
      {
        evals: Evaluation[];
        participantIds: Set<string>;
      }
    >();

    const submittedEvals = evaluations.filter((e) => e.Status === 'Submitted');

    submittedEvals.forEach((e) => {
      const schoolName = participantSchoolMap.get(e.ParticipantID) || 'Unknown School';
      const existing = grouped.get(schoolName) || {
        evals: [],
        participantIds: new Set<string>(),
      };
      existing.evals.push(e);
      existing.participantIds.add(e.ParticipantID);
      grouped.set(schoolName, existing);
    });

    const results: SchoolMetricAggregate[] = [];
    let colorIdx = 0;

    grouped.forEach((data, schoolName) => {
      const count = data.evals.length;
      if (count === 0) return;

      const sumC1 = data.evals.reduce((acc, curr) => acc + (curr.C1 || 0), 0);
      const sumC2 = data.evals.reduce((acc, curr) => acc + (curr.C2 || 0), 0);
      const sumC3 = data.evals.reduce((acc, curr) => acc + (curr.C3 || 0), 0);
      const sumC4 = data.evals.reduce((acc, curr) => acc + (curr.C4 || 0), 0);
      const sumTotal = data.evals.reduce((acc, curr) => acc + (curr.Total || 0), 0);

      const palette = SCHOOL_PALETTE[colorIdx % SCHOOL_PALETTE.length];
      colorIdx++;

      results.push({
        school: schoolName,
        projectCount: data.participantIds.size,
        evalCount: count,
        concept: Math.round((sumC1 / count) * 10) / 10,
        technicalSkill: Math.round((sumC2 / count) * 10) / 10,
        presentation: Math.round((sumC3 / count) * 10) / 10,
        innovation: Math.round((sumC4 / count) * 10) / 10,
        overallScore: Math.round(((sumTotal / count) / 4) * 10) / 10, // scaled out of 10
        totalPointsAvg: Math.round((sumTotal / count) * 10) / 10, // out of 40
        color: palette.stroke,
        fillColor: palette.fill,
      });
    });

    // Sort by average overall performance
    return results.sort((a, b) => b.totalPointsAvg - a.totalPointsAvg);
  }, [evaluations, participants]);

  // Selected schools for radar comparison (default to top 3)
  const [selectedSchoolNames, setSelectedSchoolNames] = useState<string[]>(() => {
    return schoolAggregates.slice(0, 3).map((s) => s.school);
  });

  // Ensure default selections stay synced if aggregates load asynchronously
  React.useEffect(() => {
    if (selectedSchoolNames.length === 0 && schoolAggregates.length > 0) {
      setSelectedSchoolNames(schoolAggregates.slice(0, 3).map((s) => s.school));
    }
  }, [schoolAggregates]);

  const [hoveredSchool, setHoveredSchool] = useState<string | null>(null);

  // Toggle school selection
  const toggleSchool = (schoolName: string) => {
    setSelectedSchoolNames((prev) => {
      if (prev.includes(schoolName)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((s) => s !== schoolName);
      } else {
        if (prev.length >= 6) {
          // Keep max 6 for radar readability
          return [...prev.slice(1), schoolName];
        }
        return [...prev, schoolName];
      }
    });
  };

  const selectTopN = (n: number) => {
    setSelectedSchoolNames(schoolAggregates.slice(0, n).map((s) => s.school));
  };

  const selectAll = () => {
    setSelectedSchoolNames(schoolAggregates.slice(0, 6).map((s) => s.school));
  };

  // 2. Format data for Recharts Radar Chart
  // Dimensions: Innovation, Presentation, Technical Skill, Scientific Concept, Overall Execution
  const radarChartData = useMemo(() => {
    const activeSchools = schoolAggregates.filter((s) =>
      selectedSchoolNames.includes(s.school)
    );

    const dimensions = [
      { key: 'innovation', metric: 'Creativity & Innovation', fullMark: 10 },
      { key: 'technicalSkill', metric: 'Technical Mastery', fullMark: 10 },
      { key: 'presentation', metric: 'Presentation Skills', fullMark: 10 },
      { key: 'concept', metric: 'Scientific Concept', fullMark: 10 },
      { key: 'overallScore', metric: 'Overall Execution (/10)', fullMark: 10 },
    ];

    return dimensions.map((dim) => {
      const row: Record<string, string | number> = {
        metric: dim.metric,
        fullMark: dim.fullMark,
      };

      activeSchools.forEach((sch) => {
        row[sch.school] = sch[dim.key as keyof SchoolMetricAggregate] as number;
      });

      return row;
    });
  }, [schoolAggregates, selectedSchoolNames]);

  // Dimension Leaders
  const dimensionLeaders = useMemo(() => {
    if (schoolAggregates.length === 0) return null;

    const findLeader = (key: keyof SchoolMetricAggregate) => {
      return [...schoolAggregates].sort(
        (a, b) => (b[key] as number) - (a[key] as number)
      )[0];
    };

    return {
      innovation: findLeader('innovation'),
      presentation: findLeader('presentation'),
      technical: findLeader('technicalSkill'),
      concept: findLeader('concept'),
    };
  }, [schoolAggregates]);

  // Custom Tooltip for Radar
  const CustomRadarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#05261B] text-white p-3.5 rounded-xl border border-[#0B6E4F]/40 shadow-xl text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-[#E6C65C] border-b border-white/10 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-gray-300 font-mono">Max: 10.0</span>
          </div>
          <div className="space-y-1 pt-1">
            {payload.map((entry: any) => (
              <div
                key={entry.name}
                className="flex items-center justify-between gap-3 text-[11px]"
              >
                <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.stroke || entry.color }}
                  />
                  <span className="truncate text-gray-200">{entry.name}</span>
                </div>
                <span className="font-mono font-bold text-white shrink-0">
                  {entry.value} / 10
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8E4] pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-[#E6F1EC] text-[#0B6E4F] px-3 py-1 rounded-full text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-[#0B6E4F]" />
              <span>Multi-Institutional Performance Analysis</span>
            </div>
            <h2 className="text-xl font-black text-[#11241C] tracking-tight">
              Institutional Radar Comparison
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6E64]">
              Cross-institutional benchmarking across 4 core rubric criteria: Innovation, Technical Mastery, Presentation, and Scientific Concept.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Compare:
            </span>
            <button
              onClick={() => selectTopN(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedSchoolNames.length === 3 &&
                schoolAggregates.slice(0, 3).every((s) => selectedSchoolNames.includes(s.school))
                  ? 'bg-[#0B6E4F] text-white shadow-xs'
                  : 'bg-[#F1F5F2] text-gray-700 hover:bg-gray-200'
              }`}
            >
              Top 3 Schools
            </button>
            <button
              onClick={() => selectTopN(5)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedSchoolNames.length === 5
                  ? 'bg-[#0B6E4F] text-white shadow-xs'
                  : 'bg-[#F1F5F2] text-gray-700 hover:bg-gray-200'
              }`}
            >
              Top 5 Schools
            </button>
            <button
              onClick={selectAll}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedSchoolNames.length >= 6
                  ? 'bg-[#0B6E4F] text-white shadow-xs'
                  : 'bg-[#F1F5F2] text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Active ({Math.min(6, schoolAggregates.length)})
            </button>
          </div>
        </div>

        {/* School Selection Chips */}
        <div className="pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Select institutions to overlay on the radar chart (Max 6):</span>
            <span className="font-mono font-semibold text-[#0B6E4F]">
              {selectedSchoolNames.length} of {schoolAggregates.length} active
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {schoolAggregates.map((sch) => {
              const isSelected = selectedSchoolNames.includes(sch.school);
              return (
                <button
                  key={sch.school}
                  onClick={() => toggleSchool(sch.school)}
                  onMouseEnter={() => setHoveredSchool(sch.school)}
                  onMouseLeave={() => setHoveredSchool(null)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? 'bg-white border-2 text-[#11241C] shadow-xs'
                      : 'bg-[#F7FAF8] text-gray-600 border-[#E2E8E4] opacity-70 hover:opacity-100 hover:bg-white'
                  }`}
                  style={{
                    borderColor: isSelected ? sch.color : undefined,
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: sch.color }}
                  />
                  <span className="truncate max-w-[180px]">{sch.school}</span>
                  <span className="text-[10px] font-mono text-gray-400">
                    ({sch.totalPointsAvg}/40)
                  </span>
                  {isSelected && (
                    <Check
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: sch.color }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Chart + Dimension Leaders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart Container */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E2E8E4] p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8E4]">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-[#0B6E4F]" />
              <h3 className="font-bold text-sm sm:text-base text-[#11241C]">
                Institutional Skill Competency Web
              </h3>
            </div>
            <span className="text-[11px] font-mono bg-amber-50 text-[#B8860B] border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
              Scale 0 - 10 Pts
            </span>
          </div>

          <div className="w-full h-[400px] sm:h-[440px] py-2">
            {schoolAggregates.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No evaluated school submissions to display yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="75%"
                  data={radarChartData}
                  margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                >
                  <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 700 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    stroke="#94A3B8"
                  />

                  {schoolAggregates
                    .filter((s) => selectedSchoolNames.includes(s.school))
                    .map((sch) => {
                      const isHovered = hoveredSchool === sch.school;
                      return (
                        <Radar
                          key={sch.school}
                          name={sch.school}
                          dataKey={sch.school}
                          stroke={sch.color}
                          fill={sch.fillColor}
                          fillOpacity={isHovered ? 0.45 : 0.2}
                          strokeWidth={isHovered ? 3 : 2}
                          dot={{ r: 3, fill: sch.color }}
                        />
                      );
                    })}

                  <Tooltip content={<CustomRadarTooltip />} />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '16px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 border-t border-[#E2E8E4] flex items-center justify-between text-[11px] text-[#5B6E64]">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              Vertices reflect rubric categories averaged across all entries submitted by each school.
            </span>
            <span className="font-mono text-gray-400">
              {evaluations.filter((e) => e.Status === 'Submitted').length} total evaluations parsed
            </span>
          </div>
        </div>

        {/* Dimension Leaders & Spotlight */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl border border-[#E2E8E4] p-5 shadow-xs space-y-3.5">
            <h3 className="font-bold text-sm text-[#11241C] flex items-center gap-2 border-b border-[#E2E8E4] pb-2.5">
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
              <span>Dimension Category Leaders</span>
            </h3>

            {dimensionLeaders && (
              <div className="space-y-2.5">
                {/* Innovation */}
                <div className="p-3 rounded-2xl bg-[#F6F8F7] border border-[#E2E8E4] flex items-center justify-between hover:border-[#0B6E4F] transition">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Innovation &amp; Novelty
                    </span>
                    <div className="font-bold text-xs text-[#11241C] truncate max-w-[160px]">
                      {dimensionLeaders.innovation.school}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-purple-700">
                      {dimensionLeaders.innovation.innovation}
                    </span>
                    <span className="text-[10px] text-gray-400 block">/ 10.0</span>
                  </div>
                </div>

                {/* Presentation */}
                <div className="p-3 rounded-2xl bg-[#F6F8F7] border border-[#E2E8E4] flex items-center justify-between hover:border-[#0B6E4F] transition">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Presentation &amp; Delivery
                    </span>
                    <div className="font-bold text-xs text-[#11241C] truncate max-w-[160px]">
                      {dimensionLeaders.presentation.school}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-blue-700">
                      {dimensionLeaders.presentation.presentation}
                    </span>
                    <span className="text-[10px] text-gray-400 block">/ 10.0</span>
                  </div>
                </div>

                {/* Technical Mastery */}
                <div className="p-3 rounded-2xl bg-[#F6F8F7] border border-[#E2E8E4] flex items-center justify-between hover:border-[#0B6E4F] transition">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Technical &amp; Scientific Depth
                    </span>
                    <div className="font-bold text-xs text-[#11241C] truncate max-w-[160px]">
                      {dimensionLeaders.technical.school}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-emerald-700">
                      {dimensionLeaders.technical.technicalSkill}
                    </span>
                    <span className="text-[10px] text-gray-400 block">/ 10.0</span>
                  </div>
                </div>

                {/* Concept */}
                <div className="p-3 rounded-2xl bg-[#F6F8F7] border border-[#E2E8E4] flex items-center justify-between hover:border-[#0B6E4F] transition">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                      <Trophy className="w-3 h-3" /> Theme &amp; Scientific Concept
                    </span>
                    <div className="font-bold text-xs text-[#11241C] truncate max-w-[160px]">
                      {dimensionLeaders.concept.school}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-[#B8860B]">
                      {dimensionLeaders.concept.concept}
                    </span>
                    <span className="text-[10px] text-gray-400 block">/ 10.0</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Institutional Takeaway card */}
          <div className="bg-gradient-to-br from-[#0A3D2C] to-[#05261B] text-white p-5 rounded-3xl border border-[#0B6E4F]/40 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E6C65C]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Comparative Insight</span>
            </div>
            <p className="text-xs text-[#C7DDD3] leading-relaxed">
              Institutional radar outlines allow the GMU MASE jury to contrast curriculum strengths. High area coverage signifies balanced holistic excellence across design, articulation, and scientific rigor.
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Institutional Performance Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8E4] bg-[#F9FBFA] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#11241C] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0B6E4F]" />
              <span>Institutional Metric Breakdown</span>
            </h3>
            <p className="text-xs text-gray-500">
              Aggregated criterion-by-criterion performance metrics for all participating schools.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F1F5F2] text-[#2C3F35] font-bold border-b border-[#E2E8E4]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Color</th>
                <th className="py-3 px-4">School</th>
                <th className="py-3 px-4 text-center">Entries</th>
                <th className="py-3 px-4 text-center">Evals</th>
                <th className="py-3 px-4 text-right">Concept (/10)</th>
                <th className="py-3 px-4 text-right">Technical (/10)</th>
                <th className="py-3 px-4 text-right">Presentation (/10)</th>
                <th className="py-3 px-4 text-right">Innovation (/10)</th>
                <th className="py-3 px-4 text-right font-black text-[#0B6E4F]">Avg Total (/40)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3F0]">
              {schoolAggregates.map((s, idx) => {
                const isSelected = selectedSchoolNames.includes(s.school);
                return (
                  <tr
                    key={s.school}
                    onMouseEnter={() => setHoveredSchool(s.school)}
                    onMouseLeave={() => setHoveredSchool(null)}
                    className={`hover:bg-[#F9FBFA] transition ${
                      isSelected ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className="inline-block w-3.5 h-3.5 rounded-full shadow-xs"
                        style={{ backgroundColor: s.color }}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#11241C]">
                      <div className="flex items-center gap-2">
                        <span>{s.school}</span>
                        {idx === 0 && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Top Ranked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-600">
                      {s.projectCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-gray-600">
                      {s.evalCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-gray-700">
                      {s.concept}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-gray-700">
                      {s.technicalSkill}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-gray-700">
                      {s.presentation}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-purple-700 font-bold">
                      {s.innovation}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-sm text-[#0B6E4F]">
                      {s.totalPointsAvg}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
