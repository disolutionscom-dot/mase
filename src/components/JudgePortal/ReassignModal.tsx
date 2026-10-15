import React, { useState } from 'react';
import { MapPin, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { Participant } from '../../types';

interface ReassignModalProps {
  project: Participant;
  currentTableQuery: string;
  onClose: () => void;
  onConfirmReassign: (newTableName: string, reason: string) => void;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  project,
  currentTableQuery,
  onClose,
  onConfirmReassign,
}) => {
  const [newTable, setNewTable] = useState(currentTableQuery || '');
  const [reason, setReason] = useState('Participants physically shifted exhibition table');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTable.trim()) {
      onConfirmReassign(newTable.trim().toUpperCase(), reason.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700">
            <RefreshCw className="w-5 h-5" />
            <h3 className="font-bold text-base text-[#11241C]">
              Reassign Exhibition Table
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#F6F8F7] p-3 rounded-xl border border-[#E2E8E4] text-xs space-y-1">
          <div className="font-bold text-gray-900">{project.Title}</div>
          <div className="text-gray-500">
            {project.SchoolName} • Current Assigned: <strong>Table {project.TableName || 'Unassigned'}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              New Physical Table Number *
            </label>
            <input
              type="text"
              value={newTable}
              onChange={(e) => setNewTable(e.target.value.toUpperCase())}
              placeholder="e.g. A05, B02"
              className="w-full px-3 py-2.5 font-bold uppercase tracking-wider text-base bg-[#F4F7F5] border border-[#CBD7D0] focus:border-[#0B6E4F] rounded-xl outline-none"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Reason for Shift
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Moved closer to electrical power outlet"
              className="w-full px-3 py-2 text-xs bg-[#F4F7F5] border border-[#CBD7D0] focus:border-[#0B6E4F] rounded-xl outline-none"
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              If another project was registered at table {newTable || '...'}, it will be automatically detached and logged in the faculty audit trail.
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTable.trim()}
              className="flex-1 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition disabled:opacity-50"
            >
              Confirm Reassignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
