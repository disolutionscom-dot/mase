import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  UserCheck,
  Award,
  Clock,
  Sparkles,
  BarChart,
  Eye,
  Flag,
} from 'lucide-react';
import { Evaluation, Participant, Category } from '../../types';

interface ProjectConsistencyScorecardProps {
  evaluations: Evaluation[];
  participants: Participant[];
  categories?: Category[];
  onSelectProject?: (project: Participant) => void;
}

export interface ConsistencyAnalysis {
  participant: Participant;
  evaluations: Evaluation[];
  judgeCount: number;
  scores: number[];
  meanScore: number;
  standardDeviation: number;
  spread: number; // max - min
  consistencyScore: number; // 0 - 100
  status: 'critical_anomaly' | 'moderate_anomaly' | 'moderate_variance' | 'high_consensus' | 'single_judge';
  divergentJudge: {
    name: string;
    score: number;
    deltaFromMean: number;
  } | null;
  criterionDeltas: {
    criterion: string;
    criterionName: string;
    stdDev: number;
    spread: number;
  }[];
  primaryDiscrepancyDimension: string | null;
  anomalyReason: string | null;
}

// Compute sample standard deviation: sqrt( sum( (x - mean)^2 ) / (N - 1) )
function calculateStdDev(scores: number[], mean: number): number {
  if (scores.length <= 1) return 0;
  const variance =
    scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
    (scores.length - 1);
  return Math.round(Math.sqrt(variance) * 100) / 100;
}

export const ProjectConsistencyScorecard: React.FC<ProjectConsistencyScorecardProps> = ({
  evaluations,
  participants,
  categories = [],
  onSelectProject,
}) => {
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'anomalies' | 'consensus' | 'single'
  >('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'anomaly' | 'consistency_asc' | 'consistency_desc' | 'spread'>('anomaly');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [reviewedProjectIds, setReviewedProjectIds] = useState<Set<string>>(new Set());

  // 1. Calculate consistency and detect anomalies for all evaluated projects
  const analysisList = useMemo<ConsistencyAnalysis[]>(() => {
    const submittedEvals = evaluations.filter((e) => e.Status === 'Submitted');

    // Group evaluations by participant ID
    const evalsByProject = new Map<string, Evaluation[]>();
    submittedEvals.forEach((e) => {
      const list = evalsByProject.get(e.ParticipantID) || [];
      list.push(e);
      evalsByProject.set(e.ParticipantID, list);
    });

    const results: ConsistencyAnalysis[] = [];

    participants.forEach((p) => {
      const projectEvals = evalsByProject.get(p.ParticipantID);
      if (!projectEvals || projectEvals.length === 0) return;

      const scores = projectEvals.map((e) => Number(e.Total));
      const N = scores.length;
      const meanScore =
        Math.round((scores.reduce((a, b) => a + b, 0) / N) * 10) / 10;
      const stdDev = calculateStdDev(scores, meanScore);
      const minScore = Math.min(...scores);
      const maxScore = Math.max(...scores);
      const spread = Math.round((maxScore - minScore) * 10) / 10;

      // Consistency Score calculation (0 to 100):
      // Each point of standard deviation drops the score by 12.5 points
      // 0 SD -> 100%, 1.0 SD -> 87.5%, 2.0 SD -> 75%, 4.0 SD -> 50%, 6.0 SD -> 25%
      let consistencyScore = 100;
      if (N >= 2) {
        consistencyScore = Math.max(0, Math.min(100, Math.round(100 - stdDev * 12.5)));
      }

      // Criterion-level standard deviations (C1, C2, C3, C4)
      const criteriaList = [
        { key: 'C1', name: 'Concept & Scientific Depth' },
        { key: 'C2', name: 'Exhibit Knowledge & Mastery' },
        { key: 'C3', name: 'Presentation & Delivery' },
        { key: 'C4', name: 'Creativity & Innovation' },
      ];

      const criterionDeltas = criteriaList.map((crit) => {
        const cScores = projectEvals.map(
          (e) => (e[crit.key as keyof Evaluation] as number) || 0
        );
        const cMean = cScores.reduce((a, b) => a + b, 0) / cScores.length;
        const cStdDev = calculateStdDev(cScores, cMean);
        const cSpread =
          Math.round((Math.max(...cScores) - Math.min(...cScores)) * 10) / 10;

        return {
          criterion: crit.key,
          criterionName: crit.name,
          stdDev: cStdDev,
          spread: cSpread,
        };
      });

      // Find criterion with highest divergence
      const highestDivergentCriterion = [...criterionDeltas].sort(
        (a, b) => b.spread - a.spread
      )[0];

      // Identify outlier judge
      let divergentJudge: ConsistencyAnalysis['divergentJudge'] = null;
      if (N >= 2) {
        let maxDelta = -1;
        let outlierEval: Evaluation | null = null;
        projectEvals.forEach((e) => {
          const delta = Math.abs(e.Total - meanScore);
          if (delta > maxDelta) {
            maxDelta = delta;
            outlierEval = e;
          }
        });

        if (outlierEval && maxDelta >= 2.0) {
          const oDelta = Math.round(((outlierEval as Evaluation).Total - meanScore) * 10) / 10;
          divergentJudge = {
            name: (outlierEval as Evaluation).JudgeName,
            score: (outlierEval as Evaluation).Total,
            deltaFromMean: oDelta,
          };
        }
      }

      // Determine Status & Anomaly diagnosis
      let status: ConsistencyAnalysis['status'] = 'single_judge';
      let anomalyReason: string | null = null;

      if (N === 1) {
        status = 'single_judge';
      } else if (spread >= 7.0 || stdDev >= 4.0) {
        status = 'critical_anomaly';
        anomalyReason = `High score spread of ${spread} pts (SD: ${stdDev}). Largest divergence on ${highestDivergentCriterion.criterionName} (Δ ${highestDivergentCriterion.spread} pts).`;
      } else if (spread >= 5.0 || stdDev >= 2.5) {
        status = 'moderate_anomaly';
        anomalyReason = `Moderate divergence with ${spread} pt delta across ${N} judges. Check ${highestDivergentCriterion.criterionName}.`;
      } else if (stdDev >= 1.5 || spread >= 3.0) {
        status = 'moderate_variance';
      } else {
        status = 'high_consensus';
      }

      results.push({
        participant: p,
        evaluations: projectEvals,
        judgeCount: N,
        scores,
        meanScore,
        standardDeviation: stdDev,
        spread,
        consistencyScore,
        status,
        divergentJudge,
        criterionDeltas,
        primaryDiscrepancyDimension:
          highestDivergentCriterion && highestDivergentCriterion.spread >= 1.5
            ? highestDivergentCriterion.criterionName
            : null,
        anomalyReason,
      });
    });

    return results;
  }, [evaluations, participants]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const multiJudge = analysisList.filter((a) => a.judgeCount >= 2);
    const criticalAnomalies = analysisList.filter(
      (a) => a.status === 'critical_anomaly'
    );
    const moderateAnomalies = analysisList.filter(
      (a) => a.status === 'moderate_anomaly'
    );
    const highConsensus = analysisList.filter((a) => a.status === 'high_consensus');
    const singleJudge = analysisList.filter((a) => a.status === 'single_judge');

    const avgConsistency =
      multiJudge.length > 0
        ? Math.round(
            multiJudge.reduce((sum, a) => sum + a.consistencyScore, 0) /
              multiJudge.length
          )
        : 100;

    const avgStdDev =
      multiJudge.length > 0
        ? Math.round(
            (multiJudge.reduce((sum, a) => sum + a.standardDeviation, 0) /
              multiJudge.length) *
              100
          ) / 100
        : 0;

    return {
      totalEvaluated: analysisList.length,
      multiJudgeCount: multiJudge.length,
      criticalAnomalyCount: criticalAnomalies.length,
      totalAnomalyCount: criticalAnomalies.length + moderateAnomalies.length,
      highConsensusCount: highConsensus.length,
      singleJudgeCount: singleJudge.length,
      avgConsistency,
      avgStdDev,
    };
  }, [analysisList]);

  // Filtered & Sorted List
  const filteredList = useMemo(() => {
    let list = [...analysisList];

    // Status filter
    if (filterStatus === 'anomalies') {
      list = list.filter(
        (a) => a.status === 'critical_anomaly' || a.status === 'moderate_anomaly'
      );
    } else if (filterStatus === 'consensus') {
      list = list.filter((a) => a.status === 'high_consensus');
    } else if (filterStatus === 'single') {
      list = list.filter((a) => a.status === 'single_judge');
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((a) => a.participant.Category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.participant.Title.toLowerCase().includes(q) ||
          a.participant.SchoolName.toLowerCase().includes(q) ||
          (a.participant.TableName && a.participant.TableName.toLowerCase().includes(q)) ||
          (a.participant.LeadName && a.participant.LeadName.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'anomaly') {
        // Critical anomalies first, then moderate, then highest spread
        const scoreA =
          a.status === 'critical_anomaly'
            ? 1000 + a.spread
            : a.status === 'moderate_anomaly'
            ? 500 + a.spread
            : a.spread;
        const scoreB =
          b.status === 'critical_anomaly'
            ? 1000 + b.spread
            : b.status === 'moderate_anomaly'
            ? 500 + b.spread
            : b.spread;
        return scoreB - scoreA;
      }
      if (sortBy === 'consistency_asc') {
        return a.consistencyScore - b.consistencyScore;
      }
      if (sortBy === 'consistency_desc') {
        return b.consistencyScore - a.consistencyScore;
      }
      if (sortBy === 'spread') {
        return b.spread - a.spread;
      }
      return 0;
    });

    return list;
  }, [analysisList, filterStatus, selectedCategory, searchQuery, sortBy]);

  const toggleReview = (participantId: string) => {
    setReviewedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(participantId)) next.delete(participantId);
      else next.add(participantId);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-[#E2E8E4] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E2E8E4] pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Statistical Jury Auditing &amp; Anomaly Detection</span>
            </div>
            <h2 className="text-xl font-black text-[#11241C] tracking-tight">
              Project Consistency &amp; Judging Anomaly Scorecard
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6E64]">
              Real-time standard deviation analysis across multi-judge evaluations. Automatically flags scoring discrepancies and highlights diverging jurors.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            {summaryMetrics.totalAnomalyCount > 0 ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <div>
                  <div className="text-xs font-black">
                    {summaryMetrics.totalAnomalyCount} Anomalies Flagged
                  </div>
                  <div className="text-[10px] text-rose-600 font-medium">
                    Spread ≥ 5.0 pts or SD ≥ 2.5
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-2xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold">All Judge Panels in Consensus</span>
              </div>
            )}
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
          {/* Consistency Index */}
          <div className="bg-[#F9FBFA] p-4 rounded-2xl border border-[#E2E8E4]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Exhibition Consistency Index
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#0B6E4F]">
                {summaryMetrics.avgConsistency}%
              </span>
              <span className="text-xs text-gray-400 font-mono">/ 100</span>
            </div>
            <div className="text-[11px] text-[#5B6E64] mt-1">
              Avg SD: ±{summaryMetrics.avgStdDev} pts
            </div>
          </div>

          {/* Multi-Judge Evaluated */}
          <div className="bg-[#F9FBFA] p-4 rounded-2xl border border-[#E2E8E4]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Multi-Judge Verified
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#11241C] mt-1">
              {summaryMetrics.multiJudgeCount}
            </div>
            <div className="text-[11px] text-[#5B6E64] mt-1">
              of {summaryMetrics.totalEvaluated} scored projects (≥2 judges)
            </div>
          </div>

          {/* Flagged Anomalies */}
          <div
            onClick={() => setFilterStatus('anomalies')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              summaryMetrics.totalAnomalyCount > 0
                ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-100/70'
                : 'bg-[#F9FBFA] border-[#E2E8E4]'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" /> Anomalies for Audit
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-700 mt-1">
              {summaryMetrics.totalAnomalyCount}
            </div>
            <div className="text-[11px] text-rose-600 mt-1 font-medium">
              {summaryMetrics.criticalAnomalyCount} critical / {summaryMetrics.totalAnomalyCount - summaryMetrics.criticalAnomalyCount} moderate
            </div>
          </div>

          {/* High Consensus */}
          <div
            onClick={() => setFilterStatus('consensus')}
            className="bg-[#F9FBFA] p-4 rounded-2xl border border-[#E2E8E4] cursor-pointer hover:border-[#0B6E4F] transition"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> High Consensus
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 mt-1">
              {summaryMetrics.highConsensusCount}
            </div>
            <div className="text-[11px] text-[#5B6E64] mt-1">
              SD &lt; 1.5 pts (Solid agreement)
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8E4] p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'all'
                ? 'bg-[#0B6E4F] text-white shadow-xs'
                : 'bg-[#F1F5F2] text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Evaluated ({analysisList.length})
          </button>
          <button
            onClick={() => setFilterStatus('anomalies')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'anomalies'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Flagged Anomalies ({summaryMetrics.totalAnomalyCount})</span>
          </button>
          <button
            onClick={() => setFilterStatus('consensus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'consensus'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>High Consensus ({summaryMetrics.highConsensusCount})</span>
          </button>
          <button
            onClick={() => setFilterStatus('single')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'single'
                ? 'bg-gray-700 text-white shadow-xs'
                : 'bg-[#F1F5F2] text-gray-600 hover:bg-gray-200'
            }`}
          >
            Needs 2nd Judge ({summaryMetrics.singleJudgeCount})
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search title, school, table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs px-3 py-1.5 rounded-xl border border-[#CBD5E1] bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0B6E4F]"
          >
            <option value="anomaly">Sort: Highest Anomaly First</option>
            <option value="spread">Sort: Largest Point Spread</option>
            <option value="consistency_asc">Sort: Lowest Consistency Score</option>
            <option value="consistency_desc">Sort: Highest Consistency Score</option>
          </select>
        </div>
      </div>

      {/* Project Consistency Cards / Table List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E2E8E4] p-12 text-center text-gray-400 text-sm">
            No projects matching the selected filter criteria.
          </div>
        ) : (
          filteredList.map((item) => {
            const isExpanded = expandedProjectId === item.participant.ParticipantID;
            const isReviewed = reviewedProjectIds.has(item.participant.ParticipantID);
            const isAnomaly =
              item.status === 'critical_anomaly' ||
              item.status === 'moderate_anomaly';

            return (
              <div
                key={item.participant.ParticipantID}
                className={`bg-white rounded-2xl border transition shadow-xs overflow-hidden ${
                  item.status === 'critical_anomaly'
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : item.status === 'moderate_anomaly'
                    ? 'border-amber-300 ring-1 ring-amber-100'
                    : 'border-[#E2E8E4] hover:border-[#0B6E4F]/50'
                }`}
              >
                {/* Main Card Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Project Info & Table */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.participant.TableName && (
                        <span className="font-mono text-[11px] font-bold bg-[#E6F1EC] text-[#0B6E4F] px-2.5 py-0.5 rounded-md">
                          Table {item.participant.TableName}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {item.participant.Category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.participant.Emirate}
                      </span>

                      {/* Status Badge */}
                      {item.status === 'critical_anomaly' && (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Critical Anomaly</span>
                        </span>
                      )}
                      {item.status === 'moderate_anomaly' && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Moderate Variance</span>
                        </span>
                      )}
                      {item.status === 'high_consensus' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>High Consensus</span>
                        </span>
                      )}
                      {item.status === 'single_judge' && (
                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>1 of 2 Judges Completed</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-sm sm:text-base text-[#11241C] truncate">
                      {item.participant.Title}
                    </h4>

                    <div className="text-xs text-[#5B6E64] flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-semibold text-gray-700">
                        {item.participant.SchoolName}
                      </span>
                      {item.participant.LeadName && (
                        <span>• Lead: {item.participant.LeadName}</span>
                      )}
                      <span>• {item.judgeCount} evaluations submitted</span>
                    </div>

                    {/* Anomaly Diagnosis Banner */}
                    {item.anomalyReason && (
                      <div className="mt-2 text-xs bg-rose-50 border border-rose-200 text-rose-900 px-3 py-1.5 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Discrepancy Detected:</strong> {item.anomalyReason}
                          {item.divergentJudge && (
                            <span className="block text-[11px] text-rose-700 mt-0.5">
                              Outlier: <strong>{item.divergentJudge.name}</strong> gave {item.divergentJudge.score}/40 (
                              {item.divergentJudge.deltaFromMean > 0 ? '+' : ''}
                              {item.divergentJudge.deltaFromMean} pts from panel mean of {item.meanScore})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Metrics & Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 lg:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    {/* Consistency Score Circular / Meter */}
                    <div className="text-center min-w-[90px]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Consistency
                      </div>
                      <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                        <span
                          className={`text-2xl font-black font-mono ${
                            item.consistencyScore >= 80
                              ? 'text-[#0B6E4F]'
                              : item.consistencyScore >= 65
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {item.judgeCount >= 2 ? `${item.consistencyScore}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            item.consistencyScore >= 80
                              ? 'bg-emerald-500'
                              : item.consistencyScore >= 65
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{
                            width: `${item.judgeCount >= 2 ? item.consistencyScore : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Standard Deviation & Spread */}
                    <div className="text-right sm:text-center min-w-[90px]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Std Deviation (σ)
                      </div>
                      <div className="text-base font-black font-mono text-[#11241C] mt-0.5">
                        {item.judgeCount >= 2 ? `±${item.standardDeviation}` : '—'}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Spread: {item.judgeCount >= 2 ? `${item.spread} pts` : '—'}
                      </div>
                    </div>

                    {/* Mean Score */}
                    <div className="text-left sm:text-right min-w-[90px]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Panel Mean
                      </div>
                      <div className="text-lg font-black font-mono text-[#0B6E4F] mt-0.5">
                        {item.meanScore}{' '}
                        <span className="text-xs font-normal text-gray-400">/ 40</span>
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {item.judgeCount} judge{item.judgeCount > 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Expand Breakdown Toggle */}
                    <button
                      onClick={() =>
                        setExpandedProjectId(
                          isExpanded ? null : item.participant.ParticipantID
                        )
                      }
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border ${
                        isExpanded
                          ? 'bg-[#0B6E4F] text-white border-[#0B6E4F]'
                          : 'bg-[#F1F5F2] text-gray-700 border-[#E2E8E4] hover:bg-gray-200'
                      }`}
                    >
                      <span>Auditing</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Individual Judge Score Chips */}
                <div className="px-5 py-2.5 bg-[#F9FBFA] border-t border-[#EEF3F0] flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-gray-500 mr-1">
                    Panel Judges:
                  </span>
                  {item.evaluations.map((ev) => {
                    const isOutlier =
                      item.divergentJudge &&
                      item.divergentJudge.name === ev.JudgeName;

                    return (
                      <div
                        key={ev.EvaluationID}
                        className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                          isOutlier
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                            : 'bg-white border-gray-200 text-gray-800'
                        }`}
                      >
                        <span>{ev.JudgeName}</span>
                        <span className="font-mono font-bold text-[#0B6E4F]">
                          {ev.Total}/40
                        </span>
                        {isOutlier && (
                          <span className="bg-rose-600 text-white text-[9px] px-1 rounded uppercase font-black">
                            Outlier
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Expandable Judge Rubric Audit Drawer */}
                {isExpanded && (
                  <div className="p-5 bg-white border-t border-[#E2E8E4] space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="space-y-0.5">
                        <h5 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#0B6E4F]" />
                          <span>Side-by-Side Rubric Criteria Comparison</span>
                        </h5>
                        <p className="text-[11px] text-gray-500">
                          Compare exact scores given across all four rubric criteria by each evaluator.
                        </p>
                      </div>

                      {/* Audit Action Button */}
                      <button
                        onClick={() => toggleReview(item.participant.ParticipantID)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                          isReviewed
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>{isReviewed ? 'Audit Acknowledged' : 'Flag for Chief Judge Review'}</span>
                      </button>
                    </div>

                    {/* Criteria Matrix Table */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F1F5F2] text-[#2C3F35] font-bold border-b border-gray-200">
                          <tr>
                            <th className="py-2.5 px-3">Rubric Criterion</th>
                            <th className="py-2.5 px-3 text-center">Max</th>
                            {item.evaluations.map((e) => (
                              <th key={e.EvaluationID} className="py-2.5 px-3 text-center">
                                {e.JudgeName}
                              </th>
                            ))}
                            <th className="py-2.5 px-3 text-center text-[#B8860B]">Spread (Δ)</th>
                            <th className="py-2.5 px-3 text-center text-[#0B6E4F]">Std Dev (σ)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {/* C1 */}
                          <tr className={item.criterionDeltas[0]?.spread >= 2 ? 'bg-amber-50/50' : ''}>
                            <td className="py-2 px-3 font-medium text-gray-800">
                              C1: Concept &amp; Scientific Depth
                            </td>
                            <td className="py-2 px-3 text-center text-gray-400">10</td>
                            {item.evaluations.map((e) => (
                              <td key={e.EvaluationID} className="py-2 px-3 text-center font-mono font-bold">
                                {e.C1}
                              </td>
                            ))}
                            <td className="py-2 px-3 text-center font-mono font-black text-[#B8860B]">
                              {item.criterionDeltas[0]?.spread}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-gray-600">
                              ±{item.criterionDeltas[0]?.stdDev}
                            </td>
                          </tr>

                          {/* C2 */}
                          <tr className={item.criterionDeltas[1]?.spread >= 2 ? 'bg-amber-50/50' : ''}>
                            <td className="py-2 px-3 font-medium text-gray-800">
                              C2: Exhibit Knowledge &amp; Mastery
                            </td>
                            <td className="py-2 px-3 text-center text-gray-400">10</td>
                            {item.evaluations.map((e) => (
                              <td key={e.EvaluationID} className="py-2 px-3 text-center font-mono font-bold">
                                {e.C2}
                              </td>
                            ))}
                            <td className="py-2 px-3 text-center font-mono font-black text-[#B8860B]">
                              {item.criterionDeltas[1]?.spread}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-gray-600">
                              ±{item.criterionDeltas[1]?.stdDev}
                            </td>
                          </tr>

                          {/* C3 */}
                          <tr className={item.criterionDeltas[2]?.spread >= 2 ? 'bg-amber-50/50' : ''}>
                            <td className="py-2 px-3 font-medium text-gray-800">
                              C3: Presentation &amp; Delivery
                            </td>
                            <td className="py-2 px-3 text-center text-gray-400">10</td>
                            {item.evaluations.map((e) => (
                              <td key={e.EvaluationID} className="py-2 px-3 text-center font-mono font-bold">
                                {e.C3}
                              </td>
                            ))}
                            <td className="py-2 px-3 text-center font-mono font-black text-[#B8860B]">
                              {item.criterionDeltas[2]?.spread}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-gray-600">
                              ±{item.criterionDeltas[2]?.stdDev}
                            </td>
                          </tr>

                          {/* C4 */}
                          <tr className={item.criterionDeltas[3]?.spread >= 2 ? 'bg-amber-50/50' : ''}>
                            <td className="py-2 px-3 font-medium text-gray-800">
                              C4: Creativity &amp; Innovation
                            </td>
                            <td className="py-2 px-3 text-center text-gray-400">10</td>
                            {item.evaluations.map((e) => (
                              <td key={e.EvaluationID} className="py-2 px-3 text-center font-mono font-bold">
                                {e.C4}
                              </td>
                            ))}
                            <td className="py-2 px-3 text-center font-mono font-black text-[#B8860B]">
                              {item.criterionDeltas[3]?.spread}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-gray-600">
                              ±{item.criterionDeltas[3]?.stdDev}
                            </td>
                          </tr>

                          {/* Total Row */}
                          <tr className="bg-gray-50 font-bold">
                            <td className="py-2.5 px-3 text-[#11241C]">
                              Total Score (/40)
                            </td>
                            <td className="py-2.5 px-3 text-center text-gray-400">40</td>
                            {item.evaluations.map((e) => (
                              <td
                                key={e.EvaluationID}
                                className="py-2.5 px-3 text-center font-mono font-black text-sm text-[#0B6E4F]"
                              >
                                {e.Total}
                              </td>
                            ))}
                            <td className="py-2.5 px-3 text-center font-mono font-black text-sm text-[#B8860B]">
                              {item.spread}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-black text-sm text-gray-700">
                              ±{item.standardDeviation}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Judge Comments Audit */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Evaluator Justifications &amp; Comments
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {item.evaluations.map((e) => (
                          <div
                            key={e.EvaluationID}
                            className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-gray-800">
                                {e.JudgeName}
                              </span>
                              <span className="font-mono font-bold text-[#0B6E4F]">
                                {e.Total}/40
                              </span>
                            </div>
                            <p className="text-gray-600 italic">
                              "{e.Comments || 'No specific qualitative comments logged.'}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
