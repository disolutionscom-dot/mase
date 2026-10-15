import React, { useState } from 'react';
import {
  Table as TableIcon,
  Plus,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  UserCheck,
} from 'lucide-react';
import { Table, Participant } from '../../types';

interface TableManagerProps {
  tables: Table[];
  participants: Participant[];
  onSaveTable: (t: Partial<Table>) => Table;
  onDeleteTable: (id: string) => void;
  onAssignTable: (participantId: string, tableName: string) => void;
}

export const TableManager: React.FC<TableManagerProps> = ({
  tables,
  participants,
  onSaveTable,
  onDeleteTable,
  onAssignTable,
}) => {
  const [editingTable, setEditingTable] = useState<Partial<Table> | null>(null);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [targetTable, setTargetTable] = useState('');

  const handleCreateNew = () => {
    setEditingTable({
      TableName: `A${String(tables.length + 1).padStart(2, '0')}`,
      Location: 'Main Exhibition Hall',
      Floor: 'Ground Floor',
      Status: 'Active',
      Notes: '',
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !editingTable.TableName) return;

    onSaveTable(editingTable);
    setEditingTable(null);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || !targetTable) return;

    onAssignTable(selectedPartId, targetTable);
    setSelectedPartId('');
    setTargetTable('');
  };

  // Detect unassigned and conflicts
  const unassigned = participants.filter((p) => !p.TableName);
  const tableCounts = new Map<string, Participant[]>();
  participants.forEach((p) => {
    if (p.TableName) {
      const list = tableCounts.get(p.TableName.toUpperCase()) || [];
      list.push(p);
      tableCounts.set(p.TableName.toUpperCase(), list);
    }
  });

  const conflicts = Array.from(tableCounts.entries()).filter(
    ([, list]) => list.length > 1
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#11241C]">
            Exhibition Tables &amp; Assignments ({tables.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Physical exhibition floor spaces, booths, and assignment mapping.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Table</span>
        </button>
      </div>

      {/* Conflict / Unassigned Banner */}
      {(conflicts.length > 0 || unassigned.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {conflicts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <strong className="block font-bold">
                  {conflicts.length} Table Conflict(s) Detected
                </strong>
                <p className="mt-0.5 text-red-800">
                  Multiple projects share the same table number:{' '}
                  {conflicts.map(([tbl]) => tbl).join(', ')}.
                </p>
              </div>
            </div>
          )}

          {unassigned.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <strong className="block font-bold">
                  {unassigned.length} Project(s) Without Table
                </strong>
                <p className="mt-0.5 text-amber-800">
                  Assign tables below so judges can easily locate projects.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual Assignment Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#E2E8E4] shadow-sm">
        <h3 className="text-sm font-bold text-[#11241C] mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#0B6E4F]" />
          <span>Assign Project to Table</span>
        </h3>

        <form onSubmit={handleAssignSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={selectedPartId}
            onChange={(e) => setSelectedPartId(e.target.value)}
            className="text-xs p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
            required
          >
            <option value="">— Select Participant / Project —</option>
            {participants.map((p) => (
              <option key={p.ParticipantID} value={p.ParticipantID}>
                {p.Title} ({p.SchoolName}) {p.TableName ? `[Current: ${p.TableName}]` : '[Unassigned]'}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={targetTable}
            onChange={(e) => setTargetTable(e.target.value.toUpperCase())}
            placeholder="Target Table (e.g. A01)"
            className="text-xs p-2.5 font-mono uppercase bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
            required
          />

          <button
            type="submit"
            className="py-2.5 px-4 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition"
          >
            Assign Table
          </button>
        </form>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((t) => {
          const occupant = participants.find(
            (p) => p.TableName?.toUpperCase() === t.TableName.toUpperCase()
          );

          return (
            <div
              key={t.TableID}
              className={`bg-white rounded-3xl p-5 border shadow-sm space-y-3 transition ${
                occupant ? 'border-[#E2E8E4]' : 'border-dashed border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-[#0B6E4F] bg-[#E6F1EC] px-3 py-1 rounded-xl">
                  {t.TableName}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingTable(t)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove table ${t.TableName}?`)) onDeleteTable(t.TableID);
                    }}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <MapPin className="w-3 h-3 inline text-gray-400 mr-1" />
                <span>{t.Location || 'Main Hall'} • {t.Floor || 'Ground Floor'}</span>
              </div>

              <div className="pt-2 border-t border-[#E2E8E4]">
                {occupant ? (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#11241C] line-clamp-1">
                      {occupant.Title}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {occupant.SchoolName} • {occupant.Category}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">No project currently assigned</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {editingTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E4]">
              <h3 className="font-bold text-base text-[#11241C]">
                {editingTable.TableID ? 'Edit Table' : 'Add Physical Table'}
              </h3>
              <button onClick={() => setEditingTable(null)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Table Name / ID *</label>
                <input
                  type="text"
                  required
                  value={editingTable.TableName || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, TableName: e.target.value.toUpperCase() })}
                  placeholder="e.g. A01"
                  className="w-full p-2.5 font-mono uppercase bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Zone / Hall Location</label>
                <input
                  type="text"
                  value={editingTable.Location || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, Location: e.target.value })}
                  placeholder="Main Auditorium Hall A"
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Floor</label>
                <input
                  type="text"
                  value={editingTable.Floor || ''}
                  onChange={(e) => setEditingTable({ ...editingTable, Floor: e.target.value })}
                  placeholder="Ground Floor"
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E2E8E4]">
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B6E4F] text-white font-bold rounded-xl shadow"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
