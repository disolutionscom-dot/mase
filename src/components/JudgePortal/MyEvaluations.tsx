import React from 'react';
import { ArrowLeft, Clock, Edit3, CheckCircle, FileText, School, Tag } from 'lucide-react';
import { Evaluation, Participant, Judge } from '../../types';

interface MyEvaluationsProps {
  currentJudge: Judge;
  evaluations: Evaluation[];
  participants: Participant[];
  onBack: () => void;
  onEditEvaluation: (evaluation: Evaluation, project: Participant) => void;
  allowCorrections: boolean;
}

export const MyEvaluations: React.FC<MyEvaluationsProps> = ({
  currentJudge,
  evaluations,
  participants,
  onBack,
  onEditEvaluation,
  allowCorrections,
}) => {
  const myEvals = evaluations
    .filter((e) => e.JudgeID === currentJudge.JudgeID)
    .sort((a, b) => new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime());

  const getProject = (participantId: string): Participant | undefined => {
    return participants.find((p) => p.ParticipantID === participantId);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#5B6E64] hover:text-[#0B6E4F] bg-white px-3 py-1.5 rounded-lg border border-[#E2E8E4] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Search</span>
        </button>

        <div className="text-xs text-gray-500 font-medium">
          Total Evaluations: <strong className="text-gray-900">{myEvals.length}</strong>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-[#E2E8E4] shadow-sm">
        <h2 className="text-lg font-bold text-[#11241C]">My Submitted Evaluations</h2>
        <p className="text-xs text-[#5B6E64] mt-0.5">
          Projects you have evaluated for Gulf Medical University MASE 2026.
        </p>
      </div>

      {myEvals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8E4] p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-700">No evaluations submitted yet</h3>
          <p className="text-xs text-gray-400">
            Search for an exhibition table or student project to submit your first evaluation.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-[#0B6E4F] text-white text-xs font-bold rounded-xl mt-2"
          >
            Start Evaluating
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {myEvals.map((e) => {
            const project = getProject(e.ParticipantID);
            const formattedDate = new Date(e.SubmittedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={e.EvaluationID}
                className="bg-white rounded-2xl border border-[#E2E8E4] p-5 shadow-sm space-y-3 hover:border-[#0B6E4F]/40 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-[#E6F1EC] text-[#0B6E4F] px-2 py-0.5 rounded">
                        Ref: {e.EvaluationID}
                      </span>
                      {project?.TableName && (
                        <span className="font-mono text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                          Table {project.TableName}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#11241C] text-base">
                      {project?.Title || 'Unknown Project'}
                    </h3>

                    <div className="text-xs text-gray-500">
                      {project?.SchoolName} • {project?.Category}
                    </div>
                  </div>

                  {/* Score pill */}
                  <div className="text-right flex-shrink-0 bg-[#F6F8F7] px-3 py-2 rounded-xl border border-[#E2E8E4]">
                    <div className="text-xs text-gray-400 font-semibold">Total</div>
                    <div className="text-xl font-black text-[#0B6E4F] font-mono leading-tight">
                      {e.Total} <span className="text-xs font-normal text-gray-400">/ 40</span>
                    </div>
                    <div className="text-xs font-bold text-[#B8860B] font-mono">
                      {e.Percentage}%
                    </div>
                  </div>
                </div>

                {/* Score breakdown pills */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#E2E8E4] text-center text-xs">
                  <div className="bg-[#F9FBFA] p-1.5 rounded-lg border border-gray-100">
                    <div className="text-[10px] text-gray-400">Theme</div>
                    <div className="font-mono font-bold text-gray-800">{e.C1}</div>
                  </div>
                  <div className="bg-[#F9FBFA] p-1.5 rounded-lg border border-gray-100">
                    <div className="text-[10px] text-gray-400">Knowledge</div>
                    <div className="font-mono font-bold text-gray-800">{e.C2}</div>
                  </div>
                  <div className="bg-[#F9FBFA] p-1.5 rounded-lg border border-gray-100">
                    <div className="text-[10px] text-gray-400">Presentation</div>
                    <div className="font-mono font-bold text-gray-800">{e.C3}</div>
                  </div>
                  <div className="bg-[#F9FBFA] p-1.5 rounded-lg border border-gray-100">
                    <div className="text-[10px] text-gray-400">Creativity</div>
                    <div className="font-mono font-bold text-gray-800">{e.C4}</div>
                  </div>
                </div>

                {e.Comments && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl italic">
                    "{e.Comments}"
                  </p>
                )}

                {/* Correction Button */}
                {allowCorrections && project && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onEditEvaluation(e, project)}
                      className="text-xs font-bold text-[#0B6E4F] hover:text-[#08533b] flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#E6F1EC] transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Revise Evaluation</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
