import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  MapPin,
  School,
  Clock,
  User,
} from 'lucide-react';
import { Participant, School as SchoolType, Category, Table } from '../../types';

interface ParticipantManagerProps {
  participants: Participant[];
  schools: SchoolType[];
  categories: Category[];
  tables: Table[];
  onSaveParticipant: (p: Partial<Participant>) => Participant;
  onDeleteParticipant: (id: string) => void;
  onAssignTable: (participantId: string, tableName: string) => void;
}

export const ParticipantManager: React.FC<ParticipantManagerProps> = ({
  participants,
  schools,
  categories,
  tables,
  onSaveParticipant,
  onDeleteParticipant,
  onAssignTable,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingPart, setEditingPart] = useState<Partial<Participant> | null>(null);

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.Title.toLowerCase().includes(search.toLowerCase()) ||
      p.SchoolName.toLowerCase().includes(search.toLowerCase()) ||
      (p.LeadName && p.LeadName.toLowerCase().includes(search.toLowerCase())) ||
      (p.TableName && p.TableName.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || p.Category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNew = () => {
    setEditingPart({
      Title: '',
      SchoolID: schools[0]?.SchoolID || '',
      SchoolName: schools[0]?.Name || '',
      Category: categories[0]?.Name || 'Scientific Research',
      EntryType: 'Project',
      LeadName: '',
      TeamMembers: '',
      Grade: 'Grade 11',
      Supervisor: '',
      TableName: '',
      RegStatus: 'Registered',
      ProjectStatus: 'Active',
      Emirate: schools[0]?.Emirate || 'Dubai',
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart || !editingPart.Title) return;

    onSaveParticipant(editingPart);
    setEditingPart(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#11241C]">
            Participants &amp; Projects ({participants.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Registered projects and posters representing participating UAE schools.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E4] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, student, school, or table..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F4F7F5] border border-[#CBD7D0] focus:border-[#0B6E4F] rounded-xl outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs px-3 py-2 bg-white border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.CategoryID} value={c.Name}>
              {c.Name}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F1F5F2] text-[#2C3F35] font-bold border-b border-[#E2E8E4]">
              <tr>
                <th className="py-3 px-4">Project Title</th>
                <th className="py-3 px-4">School &amp; Emirate</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Lead / Team</th>
                <th className="py-3 px-4 text-center">Table</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3F0]">
              {filtered.map((p) => (
                <tr key={p.ParticipantID} className="hover:bg-[#F9FBFA] transition">
                  <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                    <div className="font-bold text-[#11241C] line-clamp-1">{p.Title}</div>
                    <div className="text-[11px] text-gray-400 font-mono">
                      {p.RegNo || p.ParticipantID} • {p.EntryType}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-700">{p.SchoolName}</div>
                    <div className="text-[11px] text-gray-400">{p.Emirate}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-[#E6F1EC] text-[#0B6E4F] text-xs font-semibold px-2 py-0.5 rounded">
                      {p.Category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-800">{p.LeadName || 'N/A'}</div>
                    <div className="text-[11px] text-gray-400">{p.Grade}</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {p.TableName ? (
                      <span className="font-mono text-xs font-bold bg-[#0B6E4F] text-white px-2 py-0.5 rounded">
                        {p.TableName}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        p.RegStatus === 'Registered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.RegStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setEditingPart(p)}
                      title="Edit Project"
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition inline-flex items-center"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete project "${p.Title}"?`)) onDeleteParticipant(p.ParticipantID);
                      }}
                      title="Delete Project"
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

      {/* Edit / Add Modal */}
      {editingPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E4]">
              <h3 className="font-bold text-base text-[#11241C]">
                {editingPart.ParticipantID ? 'Edit Project' : 'Register New Project'}
              </h3>
              <button
                onClick={() => setEditingPart(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Project / Poster Title *</label>
                <input
                  type="text"
                  required
                  value={editingPart.Title || ''}
                  onChange={(e) => setEditingPart({ ...editingPart, Title: e.target.value })}
                  placeholder="e.g. AI-Assisted Sepsis Screening"
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">School</label>
                  <select
                    value={editingPart.SchoolID || ''}
                    onChange={(e) => {
                      const s = schools.find((item) => item.SchoolID === e.target.value);
                      setEditingPart({
                        ...editingPart,
                        SchoolID: e.target.value,
                        SchoolName: s?.Name || '',
                        Emirate: s?.Emirate || editingPart.Emirate,
                      });
                    }}
                    className="w-full p-2.5 bg-white border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  >
                    {schools.map((s) => (
                      <option key={s.SchoolID} value={s.SchoolID}>
                        {s.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={editingPart.Category || ''}
                    onChange={(e) => setEditingPart({ ...editingPart, Category: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.CategoryID} value={c.Name}>
                        {c.Name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Entry Type</label>
                  <select
                    value={editingPart.EntryType || 'Project'}
                    onChange={(e) => setEditingPart({ ...editingPart, EntryType: e.target.value as any })}
                    className="w-full p-2.5 bg-white border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  >
                    <option value="Project">Project (5 min limit)</option>
                    <option value="Poster">Poster (3 min limit)</option>
                    <option value="Research">Research Paper</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assigned Table</label>
                  <input
                    type="text"
                    value={editingPart.TableName || ''}
                    onChange={(e) => setEditingPart({ ...editingPart, TableName: e.target.value.toUpperCase() })}
                    placeholder="e.g. A01, B04"
                    className="w-full p-2.5 font-mono uppercase bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Lead Student Name</label>
                  <input
                    type="text"
                    value={editingPart.LeadName || ''}
                    onChange={(e) => setEditingPart({ ...editingPart, LeadName: e.target.value })}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Grade / Year</label>
                  <input
                    type="text"
                    value={editingPart.Grade || ''}
                    onChange={(e) => setEditingPart({ ...editingPart, Grade: e.target.value })}
                    placeholder="Grade 12"
                    className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Team Members (Optional)</label>
                <input
                  type="text"
                  value={editingPart.TeamMembers || ''}
                  onChange={(e) => setEditingPart({ ...editingPart, TeamMembers: e.target.value })}
                  placeholder="Comma separated names"
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Supervisor / Mentor</label>
                <input
                  type="text"
                  value={editingPart.Supervisor || ''}
                  onChange={(e) => setEditingPart({ ...editingPart, Supervisor: e.target.value })}
                  placeholder="e.g. Dr. Helen Parker"
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E2E8E4]">
                <button
                  type="button"
                  onClick={() => setEditingPart(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white font-bold rounded-xl shadow"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
