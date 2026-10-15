import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Send,
  MessageSquare,
  HelpCircle,
  FileCheck2,
  Sparkles,
  School,
  Table as TableIcon,
} from 'lucide-react';
import { Participant, Judge, Rubric, Evaluation } from '../../types';

interface EvaluationFormProps {
  project: Participant;
  currentJudge: Judge;
  rubric: Rubric;
  onBack: () => void;
  onSubmitEvaluation: (payload: {
    participantId: string;
    judgeId: string;
    judgeName: string;
    c1: number;
    c2: number;
    c3: number;
    c4: number;
    overTime: boolean;
    comments?: string;
    correctionOf?: string;
    correctionReason?: string;
  }) => { ok: boolean; evaluation?: Evaluation; message?: string };
  existingEvaluation?: Evaluation | null;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  project,
  currentJudge,
  rubric,
  onBack,
  onSubmitEvaluation,
  existingEvaluation,
}) => {
  const [c1, setC1] = useState<number>(existingEvaluation?.C1 ?? 8);
  const [c2, setC2] = useState<number>(existingEvaluation?.C2 ?? 8);
  const [c3, setC3] = useState<number>(existingEvaluation?.C3 ?? 8);
  const [c4, setC4] = useState<number>(existingEvaluation?.C4 ?? 8);
  const [overTime, setOverTime] = useState<boolean>(
    existingEvaluation ? existingEvaluation.TimePenalty > 0 : false
  );
  const [comments, setComments] = useState<string>(existingEvaluation?.Comments || '');
  const [correctionReason, setCorrectionReason] = useState<string>('');

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [submittedEval, setSubmittedEval] = useState<Evaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Determine active score state map
  const scores: Record<string, number> = { C1: c1, C2: c2, C3: c3, C4: c4 };
  const setScore = (id: string, val: number) => {
    const clamped = Math.max(0, Math.min(10, Math.round(val * 10) / 10));
    if (id === 'C1') setC1(clamped);
    if (id === 'C2') setC2(clamped);
    if (id === 'C3') setC3(clamped);
    if (id === 'C4') setC4(clamped);
  };

  const timePenalty = overTime ? 1 : 0;
  const rawTotal = c1 + c2 + c3 + c4;
  const finalTotal = Math.max(0, Math.round((rawTotal - timePenalty) * 10) / 10);
  const maxTotal = rubric.maxTotal || 40;
  const percentage = Math.round((finalTotal / maxTotal) * 1000) / 10;

  const timeLimitText =
    project.EntryType === 'Poster' ? '3 minutes (Poster Presentation)' : '5 minutes (Project Presentation)';

  const handleReview = () => {
    setErrorMessage(null);
    setIsReviewOpen(true);
  };

  const handleFinalSubmit = () => {
    const res = onSubmitEvaluation({
      participantId: project.ParticipantID,
      judgeId: currentJudge.JudgeID,
      judgeName: currentJudge.Name,
      c1,
      c2,
      c3,
      c4,
      overTime,
      comments: comments.trim(),
      correctionOf: existingEvaluation?.EvaluationID,
      correctionReason: correctionReason.trim(),
    });

    if (res.ok && res.evaluation) {
      setSubmittedEval(res.evaluation);
      setIsReviewOpen(false);
    } else {
      setErrorMessage(res.message || 'Submission failed');
    }
  };

  if (submittedEval) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-[#E2E8E4] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0B6E4F] flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B6E4F] bg-[#E6F1EC] px-3 py-1 rounded-full">
              Ref: {submittedEval.EvaluationID}
            </span>
            <h2 className="text-2xl font-black text-[#11241C] pt-2">
              Evaluation Submitted Successfully
            </h2>
            <p className="text-sm text-gray-500">
              The scores have been locked and broadcasted live to the MASE results dashboard.
            </p>
          </div>

          {/* Project & Score Summary Card */}
          <div className="bg-[#F6F8F7] rounded-2xl p-6 border border-[#E2E8E4] text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Project</span>
              <span className="text-xs font-mono font-bold text-[#0B6E4F]">
                Table {project.TableName || 'N/A'}
              </span>
            </div>
            <div className="font-bold text-[#11241C] text-base">{project.Title}</div>
            <div className="text-xs text-gray-500">
              {project.SchoolName} • {project.Category}
            </div>

            <div className="pt-3 border-t border-[#E2E8E4] flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium">Final Score</div>
                <div className="text-3xl font-black text-[#0B6E4F] font-mono">
                  {submittedEval.Total}{' '}
                  <span className="text-sm font-normal text-gray-400">/ 40</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 font-medium">Percentage</div>
                <div className="text-2xl font-bold text-[#B8860B] font-mono">
                  {submittedEval.Percentage}%
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-[#0B6E4F] hover:bg-[#08533b] text-white font-bold rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Evaluate Next Project</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 space-y-6">
      {/* Top Header & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#5B6E64] hover:text-[#0B6E4F] bg-white px-3 py-1.5 rounded-lg border border-[#E2E8E4] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Search</span>
        </button>

        {existingEvaluation && (
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-300">
            Correction Mode (Ref {existingEvaluation.EvaluationID})
          </span>
        )}
      </div>

      {/* Project Overview Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8E4] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#0B6E4F] text-white">
            Table {project.TableName || 'Unassigned'}
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#E6F1EC] text-[#0B6E4F]">
            {project.Category}
          </span>
          <span className="text-xs font-semibold text-[#5B6E64]">{project.EntryType}</span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-[#11241C] leading-snug">
          {project.Title}
        </h2>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#5B6E64]">
          <span className="flex items-center gap-1">
            <School className="w-3.5 h-3.5 text-[#0B6E4F]" />
            <strong className="text-gray-800">{project.SchoolName}</strong>
          </span>
          <span>Lead: {project.LeadName || 'N/A'}</span>
          <span>Grade: {project.Grade || 'N/A'}</span>
        </div>
      </div>

      {/* Rubric Criteria Sections */}
      <div className="space-y-6">
        {rubric.criteria.map((criterion, idx) => {
          const currentScore = scores[criterion.id] ?? 8;

          return (
            <div
              key={criterion.id}
              className="bg-white rounded-2xl p-5 border border-[#E2E8E4] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-[#0B6E4F] uppercase tracking-wider">
                    Criterion {idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-[#11241C]">
                    {criterion.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 bg-[#F6F8F7] px-3 py-1.5 rounded-xl border border-[#CBD7D0]">
                  <span className="text-lg font-black text-[#0B6E4F] font-mono">
                    {currentScore}
                  </span>
                  <span className="text-xs text-gray-400">/ 10</span>
                </div>
              </div>

              {/* Band Descriptors */}
              <div className="grid grid-cols-1 gap-2">
                {criterion.bands.map((b) => {
                  const isSelected = currentScore >= b.min && currentScore <= b.max;

                  return (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() => setScore(criterion.id, b.max)}
                      className={`text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                        isSelected
                          ? 'border-[#0B6E4F] bg-[#E6F1EC]/60 shadow-xs'
                          : 'border-[#E2E8E4] bg-white hover:bg-[#F9FBFA]'
                      }`}
                    >
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md flex-shrink-0 ${
                          isSelected
                            ? 'bg-[#0B6E4F] text-white'
                            : 'bg-[#F4F7F5] text-gray-700 border border-[#E2E8E4]'
                        }`}
                      >
                        {b.label} pts
                      </span>
                      <p className="text-xs text-gray-700 leading-relaxed">{b.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Fine-Tuning Slider / Stepper */}
              <div className="pt-2 border-t border-[#E2E8E4] flex items-center justify-between gap-4">
                <span className="text-xs text-gray-500 font-medium">Fine-tune score:</span>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={currentScore}
                    onChange={(e) => setScore(criterion.id, parseFloat(e.target.value))}
                    className="w-36 sm:w-52 accent-[#0B6E4F] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={currentScore}
                    onChange={(e) => setScore(criterion.id, parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 text-center font-mono font-bold text-sm bg-[#F4F7F5] border border-[#CBD7D0] rounded-lg focus:border-[#0B6E4F] outline-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Penalty & Feedback Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8E4] shadow-sm space-y-4">
        {/* Time Limit Penalty */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
          <input
            type="checkbox"
            id="overtime"
            checked={overTime}
            onChange={(e) => setOverTime(e.target.checked)}
            className="w-4 h-4 rounded text-[#0B6E4F] focus:ring-[#0B6E4F] mt-0.5 cursor-pointer"
          />
          <label htmlFor="overtime" className="text-xs text-amber-950 cursor-pointer space-y-0.5">
            <span className="font-bold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              Presentation Exceeded Time Limit (-1 mark penalty)
            </span>
            <p className="text-amber-800 text-[11px]">
              Standard limit for {project.EntryType}: <strong>{timeLimitText}</strong>. Check this box if the students ran over time during judging.
            </p>
          </label>
        </div>

        {/* Existing Evaluation Correction Reason */}
        {existingEvaluation && (
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Reason for Score Correction *
            </label>
            <input
              type="text"
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
              placeholder="e.g. Reviewed prototype demonstration after initial scoring"
              className="w-full px-3 py-2 text-xs bg-[#F4F7F5] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
            />
          </div>
        )}

        {/* Constructive Comments */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Constructive Feedback & Notes (Optional)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={2}
            placeholder="Feedback on methodology, prototype execution, or recommendations for future medical study..."
            className="w-full px-3 py-2 text-xs bg-[#F4F7F5] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none resize-none"
          />
        </div>
      </div>

      {/* Sticky Bottom Total Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#CBD7D0] shadow-2xl p-3 sm:p-4 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
              Calculated Total {overTime && <span className="text-red-500">(-1 penalty)</span>}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#0B6E4F] font-mono">
                {finalTotal}
              </span>
              <span className="text-xs text-gray-400">/ 40</span>
              <span className="text-xs sm:text-sm font-bold text-[#B8860B] font-mono ml-2">
                ({percentage}%)
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReview}
            className="px-6 py-3 bg-[#0B6E4F] hover:bg-[#08533b] text-white font-bold rounded-xl text-sm shadow-md transition flex items-center gap-2"
          >
            <span>Review & Submit</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Review Confirmation Modal */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#11241C]">
                Confirm Project Evaluation
              </h3>
              <p className="text-xs text-gray-500">
                Please verify the rubric marks before publishing.
              </p>
            </div>

            <div className="bg-[#F6F8F7] rounded-xl p-3 text-xs space-y-1">
              <div className="font-bold text-[#11241C] truncate">{project.Title}</div>
              <div className="text-gray-500">
                {project.SchoolName} • Table {project.TableName || 'N/A'}
              </div>
            </div>

            {/* Criteria breakdown */}
            <div className="space-y-2 border-y border-[#E2E8E4] py-3 text-xs">
              {rubric.criteria.map((c) => (
                <div key={c.id} className="flex justify-between items-center text-gray-700">
                  <span className="truncate pr-2">{c.name}</span>
                  <span className="font-mono font-bold text-gray-900">{scores[c.id]} / 10</span>
                </div>
              ))}
              {overTime && (
                <div className="flex justify-between items-center text-red-600 font-semibold pt-1 border-t border-dashed border-gray-200">
                  <span>Overtime Penalty</span>
                  <span>-1.0 mark</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-bold text-[#0B6E4F] pt-2 border-t border-[#E2E8E4]">
                <span>Total Score</span>
                <span className="font-mono text-base">
                  {finalTotal} / 40 ({percentage}%)
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
