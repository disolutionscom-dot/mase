import React, { useState } from 'react';
import { KeyRound, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Judge } from '../../types';

interface JudgeLoginProps {
  onLogin: (code: string) => void;
  availableJudges: Judge[];
  error?: string | null;
}

export const JudgeLogin: React.FC<JudgeLoginProps> = ({
  onLogin,
  availableJudges,
  error,
}) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onLogin(code.trim());
    }
  };

  const handleQuickPick = (judgeCode: string) => {
    setCode(judgeCode);
    onLogin(judgeCode);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E2E8E4] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0A3D2C] p-6 text-white text-center relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#B8860B] to-[#E6C65C] text-[#241900] flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white/10 mb-3">
            M
          </div>
          <h2 className="text-xl font-bold tracking-tight">Judge Sign-In</h2>
          <p className="text-xs text-[#9FC4B4] mt-1">
            Gulf Medical University MASE Live Evaluation Portal
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4 bg-[#E6F1EC] border border-[#0B6E4F]/20 rounded-xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0B6E4F] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#0A3D2C]">
              <strong>No Google Account Required:</strong> Enter your 8-character Access Code. No Google Drive authorization or permission blocks.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#11241C] uppercase tracking-wider mb-1.5">
                Judge Access Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GMU-7821"
                  maxLength={12}
                  className="w-full px-4 py-3 bg-[#F4F7F5] border-2 border-[#CBD7D0] focus:border-[#0B6E4F] focus:bg-white rounded-xl text-center text-lg font-mono font-bold tracking-widest text-[#11241C] uppercase outline-none transition"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={!code.trim()}
              className="w-full py-3 px-4 bg-[#0B6E4F] hover:bg-[#08533b] disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In to Evaluate</span>
            </button>
          </form>

          {/* Quick Demo Judge Picker */}
          <div className="mt-6 pt-5 border-t border-[#E2E8E4]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5B6E64] mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
              <span>Quick Demo Sign-In (Click any judge):</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {availableJudges.map((j) => (
                <button
                  key={j.JudgeID}
                  type="button"
                  onClick={() => handleQuickPick(j.AccessCode)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6F8F7] hover:bg-[#E6F1EC] border border-[#E2E8E4] hover:border-[#0B6E4F]/40 text-left transition group"
                >
                  <div className="truncate mr-2">
                    <div className="text-xs font-bold text-[#11241C] group-hover:text-[#0B6E4F] truncate">
                      {j.Name}
                    </div>
                    <div className="text-[10px] text-[#5B6E64] truncate">
                      {j.Institution}
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold bg-white px-2 py-1 rounded-md border border-[#CBD7D0] text-[#0B6E4F] flex-shrink-0 group-hover:border-[#0B6E4F]">
                    {j.AccessCode}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
