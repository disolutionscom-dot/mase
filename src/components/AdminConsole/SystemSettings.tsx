import React, { useState } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  Lock,
  Eye,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { SystemSettings } from '../../types';

interface SystemSettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
  onResetToDemo: () => void;
}

export const SystemSettingsComponent: React.FC<SystemSettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetToDemo,
}) => {
  const [form, setForm] = useState<SystemSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDemo = () => {
    if (
      confirm(
        'Reset the database to initial Gulf Medical University demo state? This will reload sample UAE schools, projects, and rubric scores.'
      )
    ) {
      onResetToDemo();
      alert('Demo data restored successfully.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm">
        <h2 className="text-xl font-black text-[#11241C]">Competition &amp; System Settings</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure exhibition naming, multi-judge score aggregation, ranking policies, and publication security.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exhibition Identity */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#11241C] uppercase tracking-wider">
            Exhibition Identity
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Exhibition Title
            </label>
            <input
              type="text"
              value={form.ExhibitionName}
              onChange={(e) => setForm({ ...form, ExhibitionName: e.target.value })}
              className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] focus:border-[#0B6E4F] rounded-xl text-xs font-bold text-[#11241C] outline-none"
              required
            />
          </div>
        </div>

        {/* Scoring & Ranking Algorithms */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#11241C] uppercase tracking-wider">
            Scoring &amp; Aggregation Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Multi-Judge Score Aggregation
              </label>
              <select
                value={form.ScoringAggregation}
                onChange={(e) =>
                  setForm({ ...form, ScoringAggregation: e.target.value as any })
                }
                className="w-full p-2.5 bg-white border border-[#CBD7D0] rounded-xl text-xs outline-none"
              >
                <option value="average">Mean / Average (Standard)</option>
                <option value="median">Median (Outlier Resistant)</option>
                <option value="sum">Sum / Total Accumulated</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Used when multiple judges evaluate the same project.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Overall Top 10 Ranking Metric
              </label>
              <select
                value={form.OverallRankMethod}
                onChange={(e) =>
                  setForm({ ...form, OverallRankMethod: e.target.value as any })
                }
                className="w-full p-2.5 bg-white border border-[#CBD7D0] rounded-xl text-xs outline-none"
              >
                <option value="percentage">Normalized Percentage (%)</option>
                <option value="raw">Raw Score (Out of 40)</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Ensures fair comparison across varying category maximums.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                School Standings Calculation
              </label>
              <select
                value={form.SchoolRankingMethod}
                onChange={(e) =>
                  setForm({ ...form, SchoolRankingMethod: e.target.value as any })
                }
                className="w-full p-2.5 bg-white border border-[#CBD7D0] rounded-xl text-xs outline-none"
              >
                <option value="avgEligible">Average Score of Eligible Projects</option>
                <option value="totalPoints">Total Accumulated Points (Volume)</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Average prevents schools with massive entries having unfair advantage.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Access Controls */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#11241C] uppercase tracking-wider">
            Security &amp; Permissions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admin Console Password
              </label>
              <input
                type="text"
                value={form.AdminPasswordHash || 'admin123'}
                onChange={(e) => setForm({ ...form, AdminPasswordHash: e.target.value })}
                className="w-full p-2.5 font-mono text-xs bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Default: admin123</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Live Dashboard Password (Optional)
              </label>
              <input
                type="text"
                value={form.DashboardPasswordHash || 'mase2026'}
                onChange={(e) => setForm({ ...form, DashboardPasswordHash: e.target.value })}
                className="w-full p-2.5 font-mono text-xs bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Default: mase2026</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-[#F6F8F7] rounded-xl border border-[#E2E8E4]">
              <input
                type="checkbox"
                id="pubRankings"
                checked={form.RankingsPublished}
                onChange={(e) => setForm({ ...form, RankingsPublished: e.target.checked })}
                className="w-4 h-4 text-[#0B6E4F] rounded cursor-pointer"
              />
              <label htmlFor="pubRankings" className="text-xs text-gray-800 cursor-pointer">
                <strong>Publish Live Standings:</strong> Display top rankings on the faculty dashboard.
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#F6F8F7] rounded-xl border border-[#E2E8E4]">
              <input
                type="checkbox"
                id="resFinal"
                checked={form.ResultsFinal}
                onChange={(e) => setForm({ ...form, ResultsFinal: e.target.checked })}
                className="w-4 h-4 text-[#0B6E4F] rounded cursor-pointer"
              />
              <label htmlFor="resFinal" className="text-xs text-gray-800 cursor-pointer">
                <strong>Lock Results as Final:</strong> Mark competition scores as official and concluded.
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#F6F8F7] rounded-xl border border-[#E2E8E4]">
              <input
                type="checkbox"
                id="allowCorr"
                checked={form.AllowJudgeCorrect}
                onChange={(e) => setForm({ ...form, AllowJudgeCorrect: e.target.checked })}
                className="w-4 h-4 text-[#0B6E4F] rounded cursor-pointer"
              />
              <label htmlFor="allowCorr" className="text-xs text-gray-800 cursor-pointer">
                <strong>Allow Score Corrections:</strong> Permit judges to revise already submitted scores.
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#F6F8F7] rounded-xl border border-[#E2E8E4]">
              <input
                type="checkbox"
                id="allowReassign"
                checked={form.AllowJudgeReassign}
                onChange={(e) => setForm({ ...form, AllowJudgeReassign: e.target.checked })}
                className="w-4 h-4 text-[#0B6E4F] rounded cursor-pointer"
              />
              <label htmlFor="allowReassign" className="text-xs text-gray-800 cursor-pointer">
                <strong>Direct Table Reassignment:</strong> Allow judges to reassign tables directly without waiting for admin approval.
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetDemo}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Demo Database</span>
          </button>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs font-bold text-[#0B6E4F] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Settings Saved!</span>
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
