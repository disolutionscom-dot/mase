import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, X, MapPin } from 'lucide-react';
import { School, Emirate } from '../../types';

interface SchoolManagerProps {
  schools: School[];
  onSaveSchool: (s: Partial<School>) => School;
  onDeleteSchool: (id: string) => void;
}

const EMIRATES: Emirate[] = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

export const SchoolManager: React.FC<SchoolManagerProps> = ({
  schools,
  onSaveSchool,
  onDeleteSchool,
}) => {
  const [editingSchool, setEditingSchool] = useState<Partial<School> | null>(null);

  const handleCreateNew = () => {
    setEditingSchool({
      Name: '',
      Code: '',
      Type: 'Private School',
      RepName: '',
      RepEmail: '',
      RepContact: '',
      Address: '',
      Status: 'Active',
      Emirate: 'Dubai',
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool || !editingSchool.Name) return;

    onSaveSchool(editingSchool);
    setEditingSchool(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#11241C]">
            Participating Schools ({schools.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Registered educational institutions across the United Arab Emirates.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New School</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F1F5F2] text-[#2C3F35] font-bold border-b border-[#E2E8E4]">
              <tr>
                <th className="py-3 px-4">School Name</th>
                <th className="py-3 px-4">Emirate</th>
                <th className="py-3 px-4">Representative</th>
                <th className="py-3 px-4">Contact Email</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF3F0]">
              {schools.map((s) => (
                <tr key={s.SchoolID} className="hover:bg-[#F9FBFA] transition">
                  <td className="py-3.5 px-4 font-bold text-[#11241C]">
                    <div>{s.Name}</div>
                    <div className="text-[11px] text-gray-400 font-normal">
                      {s.Code || s.SchoolID} • {s.Type}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">
                      <MapPin className="w-3 h-3 text-[#0B6E4F]" />
                      <span>{s.Emirate}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 font-medium">
                    {s.RepName || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 font-mono text-xs">
                    {s.RepEmail || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        s.Status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.Status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setEditingSchool(s)}
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition inline-flex items-center"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove school ${s.Name}?`)) onDeleteSchool(s.SchoolID);
                      }}
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
      {editingSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E4]">
              <h3 className="font-bold text-base text-[#11241C]">
                {editingSchool.SchoolID ? 'Edit School' : 'Add Participating School'}
              </h3>
              <button
                onClick={() => setEditingSchool(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">School Name *</label>
                <input
                  type="text"
                  required
                  value={editingSchool.Name || ''}
                  onChange={(e) => setEditingSchool({ ...editingSchool, Name: e.target.value })}
                  placeholder="e.g. Dubai College"
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Emirate (UAE)</label>
                  <select
                    value={editingSchool.Emirate || 'Dubai'}
                    onChange={(e) => setEditingSchool({ ...editingSchool, Emirate: e.target.value as any })}
                    className="w-full p-2.5 bg-white border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  >
                    {EMIRATES.map((em) => (
                      <option key={em} value={em}>
                        {em}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">School Code</label>
                  <input
                    type="text"
                    value={editingSchool.Code || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, Code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DC-DXB"
                    className="w-full p-2.5 font-mono uppercase bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Representative Name</label>
                  <input
                    type="text"
                    value={editingSchool.RepName || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, RepName: e.target.value })}
                    placeholder="Ms. Claire Jenkins"
                    className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Rep Email</label>
                  <input
                    type="email"
                    value={editingSchool.RepEmail || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, RepEmail: e.target.value })}
                    placeholder="rep@school.ae"
                    className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl focus:border-[#0B6E4F] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E2E8E4]">
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white font-bold rounded-xl shadow"
                >
                  Save School
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
