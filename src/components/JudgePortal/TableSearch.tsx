import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  AlertCircle,
  HelpCircle,
  School as SchoolIcon,
  Tag,
  User,
} from 'lucide-react';
import { Participant, Judge } from '../../types';

interface TableSearchProps {
  currentJudge: Judge;
  onSelectProject: (project: Participant) => void;
  onOpenMyEvaluations: () => void;
  onReassignRequest: (project: Participant, currentTableQuery: string) => void;
  findTable: (tableName: string) => any;
  searchProjects: (query: string) => Participant[];
  myEvaluationsCount: number;
}

export const TableSearch: React.FC<TableSearchProps> = ({
  currentJudge,
  onSelectProject,
  onOpenMyEvaluations,
  onReassignRequest,
  findTable,
  searchProjects,
  myEvaluationsCount,
}) => {
  const [tableQuery, setTableQuery] = useState('');
  const [keywordQuery, setKeywordQuery] = useState('');
  const [activeSearchResult, setActiveSearchResult] = useState<any>(null);
  const [keywordResults, setKeywordResults] = useState<Participant[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTableSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tableQuery.trim()) return;

    setHasSearched(true);
    setKeywordResults([]);
    const res = findTable(tableQuery.trim());
    setActiveSearchResult(res);
  };

  const handleKeywordSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keywordQuery.trim()) return;

    setHasSearched(true);
    setActiveSearchResult(null);
    const results = searchProjects(keywordQuery.trim());
    setKeywordResults(results);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-[#0A3D2C] to-[#0B6E4F] rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">
            Evaluation Session
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
            Welcome, {currentJudge.Name}
          </h2>
          <p className="text-xs text-[#C7DDD3] mt-1">
            {currentJudge.Title || 'Evaluation Judge'} • {currentJudge.Institution}
          </p>
        </div>

        <button
          onClick={onOpenMyEvaluations}
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c09d2e] text-[#241900] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex-shrink-0"
        >
          <FolderOpen className="w-4 h-4" />
          <span>My Evaluations ({myEvaluationsCount})</span>
        </button>
      </div>

      {/* Search Area */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8E4] shadow-sm space-y-6">
        {/* Table Number Search */}
        <div>
          <label className="block text-xs font-bold text-[#11241C] uppercase tracking-wider mb-2">
            Step 1: Locate Project By Table Number
          </label>
          <form onSubmit={handleTableSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={tableQuery}
                onChange={(e) => setTableQuery(e.target.value.toUpperCase())}
                placeholder="Enter Table (e.g. A01, A02, B03)"
                className="w-full px-4 py-3 bg-[#F4F7F5] border-2 border-[#CBD7D0] focus:border-[#0B6E4F] focus:bg-white rounded-xl text-lg font-bold text-[#11241C] uppercase tracking-wider outline-none transition"
              />
              <MapPin className="w-5 h-5 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#0B6E4F] hover:bg-[#08533b] text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Find Table</span>
            </button>
          </form>
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[11px] text-[#5B6E64]">Quick pick table:</span>
            {['A01', 'A02', 'A03', 'A04', 'B01', 'B03'].map((tbl) => (
              <button
                key={tbl}
                type="button"
                onClick={() => {
                  setTableQuery(tbl);
                  setHasSearched(true);
                  setKeywordResults([]);
                  const res = findTable(tbl);
                  setActiveSearchResult(res);
                }}
                className="px-2 py-0.5 rounded-md bg-[#F4F7F5] hover:bg-[#E6F1EC] text-[#0B6E4F] text-xs font-mono font-bold border border-[#E2E8E4]"
              >
                {tbl}
              </button>
            ))}
          </div>
        </div>

        {/* Divider with Or */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#E2E8E4] w-full" />
          <span className="bg-white px-3 text-xs font-semibold text-[#5B6E64] uppercase tracking-wider">
            OR Search by keywords
          </span>
        </div>

        {/* Name / School / Keyword Search */}
        <div>
          <label className="block text-xs font-bold text-[#11241C] uppercase tracking-wider mb-2">
            Search by Project Title, Student, or School
          </label>
          <form onSubmit={handleKeywordSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={keywordQuery}
                onChange={(e) => setKeywordQuery(e.target.value)}
                placeholder="e.g. Retinopathy, GEMS Modern, Aarav..."
                className="w-full px-4 py-2.5 bg-[#F4F7F5] border border-[#CBD7D0] focus:border-[#0B6E4F] focus:bg-white rounded-xl text-sm text-[#11241C] outline-none transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-white hover:bg-[#F4F7F5] border border-[#CBD7D0] text-[#11241C] font-semibold rounded-xl text-sm transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results Display */}
      {hasSearched && (
        <div className="space-y-4">
          {/* Table Search Result */}
          {activeSearchResult && (
            <div>
              {activeSearchResult.notFound && (
                <div className="bg-white border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                  <h3 className="font-bold text-gray-900">{activeSearchResult.message}</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Check the table number label or search using the student’s name or school above.
                  </p>
                </div>
              )}

              {activeSearchResult.vacant && (
                <div className="bg-white border border-blue-200 rounded-2xl p-6 text-center space-y-3">
                  <MapPin className="w-10 h-10 text-blue-500 mx-auto" />
                  <h3 className="font-bold text-gray-900">
                    Table {activeSearchResult.table.TableName} is Vacant
                  </h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    {activeSearchResult.message} If a team is standing here, search their name or title to assign them to Table {activeSearchResult.table.TableName}.
                  </p>
                </div>
              )}

              {activeSearchResult.participant && (
                <div className="bg-white rounded-2xl border-2 border-[#0B6E4F] p-6 shadow-md hover:shadow-lg transition space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#0B6E4F] text-white font-mono text-xs font-bold px-2.5 py-1 rounded-md">
                          Table {activeSearchResult.participant.TableName}
                        </span>
                        <span className="bg-[#E6F1EC] text-[#0A3D2C] text-xs font-semibold px-2.5 py-1 rounded-md">
                          {activeSearchResult.participant.Category}
                        </span>
                        <span className="text-xs font-semibold text-[#5B6E64]">
                          {activeSearchResult.participant.EntryType}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#11241C] pt-1">
                        {activeSearchResult.participant.Title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {activeSearchResult.participant.Description || 'No description provided.'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs text-[#5B6E64] border-t border-[#E2E8E4]">
                    <div className="flex items-center gap-1.5">
                      <SchoolIcon className="w-3.5 h-3.5 text-[#0B6E4F]" />
                      <span className="font-medium truncate">{activeSearchResult.participant.SchoolName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0B6E4F]" />
                      <span className="font-medium truncate">
                        {activeSearchResult.participant.LeadName || 'Student'} ({activeSearchResult.participant.Grade || 'High School'})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                      <Clock className="w-3.5 h-3.5 text-[#B8860B]" />
                      <span className="font-medium text-[#B8860B]">
                        {activeSearchResult.participant.EntryType === 'Poster' ? '3 Min Limit' : '5 Min Limit'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E8E4]">
                    <button
                      onClick={() => onReassignRequest(activeSearchResult.participant, tableQuery)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Wrong table / Student moved?</span>
                    </button>

                    <button
                      onClick={() => onSelectProject(activeSearchResult.participant)}
                      className="px-5 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white font-bold text-sm rounded-xl shadow transition flex items-center gap-2"
                    >
                      <span>Start Evaluation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Keyword Search Results */}
          {keywordResults.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#5B6E64] uppercase tracking-wider">
                Matching Projects ({keywordResults.length})
              </div>
              {keywordResults.map((p) => (
                <div
                  key={p.ParticipantID}
                  className="bg-white rounded-xl border border-[#E2E8E4] p-4 hover:border-[#0B6E4F] transition shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="font-mono font-bold text-[#0B6E4F] bg-[#E6F1EC] px-2 py-0.5 rounded">
                          Table {p.TableName || 'Unassigned'}
                        </span>
                        <span className="text-[#5B6E64] font-medium">{p.Category}</span>
                      </div>
                      <h4 className="font-bold text-[#11241C] text-sm">{p.Title}</h4>
                      <div className="text-xs text-[#5B6E64] mt-0.5">
                        {p.SchoolName} • Lead: {p.LeadName || 'N/A'}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectProject(p)}
                      className="px-3.5 py-1.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-lg transition flex items-center gap-1 flex-shrink-0"
                    >
                      <span>Evaluate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {keywordResults.length === 0 && !activeSearchResult && (
            <div className="bg-white rounded-2xl border border-[#E2E8E4] p-8 text-center text-gray-500">
              No matching projects found. Try different keywords.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
