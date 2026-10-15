import React, { useState } from 'react';
import {
  Users,
  Plus,
  KeyRound,
  Mail,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Judge } from '../../types';

interface JudgeManagerProps {
  judges: Judge[];
  onSaveJudge: (judge: Partial<Judge>) => Judge;
  onDeleteJudge: (id: string) => void;
  onIssueAccessCode: (judgeId: string, regenerate?: boolean) => { code: string; judge: Judge };
  exhibitionName: string;
}

export const JudgeManager: React.FC<JudgeManagerProps> = ({
  judges,
  onSaveJudge,
  onDeleteJudge,
  onIssueAccessCode,
  exhibitionName,
}) => {
  const [editingJudge, setEditingJudge] = useState<Partial<Judge> | null>(null);
  const [emailPreviewJudge, setEmailPreviewJudge] = useState<Judge | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleCreateNew = () => {
    setEditingJudge({
      Name: '',
      Title: 'Consultant / Lecturer',
      Institution: 'Gulf Medical University',
      Email: '',
      Contact: '',
      Categories: 'Scientific Research, AI & Digital Health',
      Status: 'Active',
      Role: 'Judge',
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJudge || !editingJudge.Name || !editingJudge.Email) return;

    onSaveJudge(editingJudge);
    setEditingJudge(null);
  };

  const handleRegenerateCode = (judgeId: string) => {
    if (confirm('Regenerate access code for this judge? The previous code will become invalid.')) {
      onIssueAccessCode(judgeId, true);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopyStatus(code);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#11241C]">Judge Roster &amp; Access Codes</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage exhibition evaluators. Each judge signs in via their private 8-character Access Code without requiring Google Drive permissions.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Judge</span>
        </button>
      </div>

      {/* Judges Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F1F5F2] text-[#2C3F35] font-bold border-b border-[#E2E8E4]">
              <tr>
                <th className="py-3 px-4">Judge Name &amp; Title</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Categories</th>
                <th className="py-3 px-4 text-center">Access Code</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3F0]">
              {judges.map((j) => (
                <tr key={j.JudgeID} className="hover:bg-[#F9FBFA] transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#11241C]">{j.Name}</div>
                    <div className="text-[11px] text-gray-500">{j.Title || j.Role}</div>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-medium">
                    {j.Institution}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-mono text-xs">
                    {j.Email}
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 max-w-xs">
                    <span className="line-clamp-1">{j.Categories || 'All Categories'}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleCopyCode(j.AccessCode)}
                      title="Click to copy code"
                      className="font-mono font-bold text-xs bg-[#E6F1EC] text-[#0B6E4F] hover:bg-[#0B6E4F] hover:text-white px-2.5 py-1 rounded-md border border-[#0B6E4F]/30 transition"
                    >
                      {copyStatus === j.AccessCode ? 'Copied!' : j.AccessCode}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        j.Status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {j.Status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setEmailPreviewJudge(j)}
                      title="Preview / Send Invitation Email"
                      className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition inline-flex items-center"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRegenerateCode(j.JudgeID)}
                      title="Rotate Access Code"
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition inline-flex items-center"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingJudge(j)}
                      title="Edit Judge"
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition inline-flex items-center"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove judge ${j.Name}?`)) onDeleteJudge(j.JudgeID);
                      }}
                      title="Delete Judge"
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition inline-flex items-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Judge Modal */}
      {editingJudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E4]">
              <h3 className="font-bold text-base text-[#11241C]">
                {editingJudge.JudgeID ? 'Edit Judge Details' : 'Add New Evaluation Judge'}
              </h3>
              <button
                onClick={() => setEditingJudge(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingJudge.Name || ''}
                  onChange={(e) => setEditingJudge({ ...editingJudge, Name: e.target.value })}
                  placeholder="e.g. Dr. Sarah Mansour, MD"
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={editingJudge.Title || ''}
                    onChange={(e) => setEditingJudge({ ...editingJudge, Title: e.target.value })}
                    placeholder="Associate Professor"
                    className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={editingJudge.Institution || ''}
                    onChange={(e) => setEditingJudge({ ...editingJudge, Institution: e.target.value })}
                    placeholder="Gulf Medical University"
                    className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editingJudge.Email || ''}
                    onChange={(e) => setEditingJudge({ ...editingJudge, Email: e.target.value })}
                    placeholder="judge@gmu.ac.ae"
                    className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editingJudge.Contact || ''}
                    onChange={(e) => setEditingJudge({ ...editingJudge, Contact: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Assigned Categories</label>
                <input
                  type="text"
                  value={editingJudge.Categories || ''}
                  onChange={(e) => setEditingJudge({ ...editingJudge, Categories: e.target.value })}
                  placeholder="Comma-separated categories"
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={editingJudge.Status || 'Active'}
                  onChange={(e) => setEditingJudge({ ...editingJudge, Status: e.target.value as any })}
                  className="w-full p-2.5 bg-white border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E2E8E4]">
                <button
                  type="button"
                  onClick={() => setEditingJudge(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white font-bold rounded-xl shadow"
                >
                  Save Judge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Email Invite Modal */}
      {emailPreviewJudge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E4]">
              <div className="flex items-center gap-2 text-[#0B6E4F] font-bold text-sm">
                <Mail className="w-4 h-4" />
                <span>Invitation Email Preview</span>
              </div>
              <button
                onClick={() => setEmailPreviewJudge(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F6F8F7] p-4 rounded-2xl border border-[#E2E8E4] font-mono text-xs text-gray-800 space-y-2 leading-relaxed">
              <div><strong>To:</strong> {emailPreviewJudge.Email}</div>
              <div><strong>Subject:</strong> {exhibitionName} — Your Judge Access Code</div>
              <hr className="border-gray-200" />
              <p>Dear {emailPreviewJudge.Name},</p>
              <p>
                You have been registered as an official evaluation judge for <strong>{exhibitionName}</strong>.
              </p>
              <div className="p-3 bg-white border border-[#CBD7D0] rounded-xl text-center my-3">
                <div className="text-[10px] text-gray-400 uppercase font-sans font-bold">Your Private Access Code:</div>
                <div className="text-2xl font-black text-[#0B6E4F] tracking-widest mt-1">
                  {emailPreviewJudge.AccessCode}
                </div>
              </div>
              <p>
                Open the live evaluation portal on your smartphone or iPad and enter your Access Code to begin evaluating assigned student exhibition projects.
              </p>
              <p>Thank you,<br />GMU MASE Organising Committee</p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Dear ${emailPreviewJudge.Name},\nYour ${exhibitionName} Judge Access Code is: ${emailPreviewJudge.AccessCode}\nPlease keep this private.`
                  );
                  alert('Email text copied to clipboard!');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Copy Text
              </button>
              <button
                onClick={() => {
                  alert(`Invitation dispatched to ${emailPreviewJudge.Email}!`);
                  setEmailPreviewJudge(null);
                }}
                className="px-5 py-2 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
