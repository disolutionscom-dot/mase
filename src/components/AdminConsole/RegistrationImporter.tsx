import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  Sparkles,
} from 'lucide-react';

interface RegistrationImporterProps {
  onImport: (
    rows: Record<string, string>[],
    mapping: Record<string, string>
  ) => {
    added: number;
    newSchools: number;
    newCategories: number;
    newTables: number;
    errors: { row: number; error: string }[];
  };
}

const TARGET_FIELDS: { key: string; label: string; required?: boolean; hints: string[] }[] = [
  { key: 'Title', label: 'Project / Poster Title', required: true, hints: ['title', 'project', 'poster', 'exhibit', 'name of project'] },
  { key: 'SchoolName', label: 'School Name', hints: ['school', 'institution', 'school name'] },
  { key: 'Emirate', label: 'Emirate (UAE)', hints: ['emirate', 'state', 'city'] },
  { key: 'Category', label: 'Category', hints: ['category', 'segment', 'stream', 'field'] },
  { key: 'EntryType', label: 'Entry Type (Project/Poster)', hints: ['type', 'entry type', 'format'] },
  { key: 'LeadName', label: 'Lead Student Name', hints: ['lead', 'student name', 'participant', 'name'] },
  { key: 'TeamMembers', label: 'Team Members', hints: ['team', 'members', 'co-authors'] },
  { key: 'Grade', label: 'Grade / Year', hints: ['grade', 'class', 'year'] },
  { key: 'RegNo', label: 'Registration Number', hints: ['reg', 'registration', 'code', 'id'] },
  { key: 'Email', label: 'Student / Rep Email', hints: ['email', 'mail'] },
  { key: 'Contact', label: 'Contact Number', hints: ['contact', 'phone', 'mobile'] },
  { key: 'Supervisor', label: 'Supervisor / Teacher', hints: ['supervisor', 'teacher', 'guide', 'mentor'] },
  { key: 'TableName', label: 'Exhibition Table (e.g. A01)', hints: ['table', 'table no', 'booth', 'stand'] },
];

export const RegistrationImporter: React.FC<RegistrationImporterProps> = ({ onImport }) => {
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<any>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      alert('The CSV file appears to be empty or has only headers.');
      return;
    }

    // Basic CSV parser accounting for quotes
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(cur.trim());
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = parseLine(lines[i]);
      if (vals.some((v) => v.length > 0)) {
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = vals[idx] || '';
        });
        rows.push(obj);
      }
    }

    setCsvHeaders(headers);
    setParsedRows(rows);

    // Auto-match headers based on hints
    const autoMap: Record<string, string> = {};
    TARGET_FIELDS.forEach((target) => {
      for (const h of headers) {
        const lowerH = h.toLowerCase();
        if (target.hints.some((hint) => lowerH.includes(hint))) {
          autoMap[target.key] = h;
          break;
        }
      }
    });
    setFieldMapping(autoMap);
    setImportResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) parseCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    if (!fieldMapping.Title) {
      alert('Please map the Project Title column before proceeding.');
      return;
    }

    const res = onImport(parsedRows, fieldMapping);
    setImportResult(res);
  };

  const loadSampleCsv = () => {
    const sample = `Project Title,School Name,Emirate,Category,Entry Type,Lead Student,Grade,Table Number
Smart Bionic Arm with EEG Control,Dubai International Academy,Dubai,Healthcare & Biomedical Innovation,Project,Zaid Al-Ali,Grade 12,A07
Algae-Based Carbon Capture Photobioreactor,Ajman American School,Ajman,Scientific Research,Project,Layla Mansoori,Grade 11,A08
Deep Learning for Sepsis Onset Prediction,GEMS Wellington Academy,Dubai,AI & Digital Health,Project,Kavya Sharma,Grade 12,A09
Antioxidant Properties of Camel Milk Whey,Sharjah Model School,Sharjah,Poster Presentation (Senior),Poster,Abdullah Qasimi,Grade 11,B05`;

    setFileName('Sample_MASE_Registrations.csv');
    parseCsvText(sample);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm">
        <h2 className="text-xl font-black text-[#11241C]">
          Smart Registration Importer
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Upload any student registration CSV from Google Forms or Excel. Map columns dynamically — schools, categories, and exhibition tables are auto-created!
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-4">
        <div className="border-2 border-dashed border-[#CBD7D0] hover:border-[#0B6E4F] rounded-2xl p-8 text-center transition bg-[#F9FBFA]">
          <FileSpreadsheet className="w-12 h-12 text-[#0B6E4F] mx-auto mb-3" />
          <div className="text-sm font-bold text-gray-900 mb-1">
            {fileName ? fileName : 'Upload Exhibition Registration CSV'}
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Supports CSV files exported from Google Sheets, Microsoft Excel, or registration portals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="cursor-pointer px-5 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Choose CSV File</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={loadSampleCsv}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#B8860B]" />
              <span>Load Sample CSV (4 Projects)</span>
            </button>
          </div>
        </div>

        {/* Column Mapping Section */}
        {csvHeaders.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-[#E2E8E4]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#11241C]">
                  Map Columns ({parsedRows.length} rows detected)
                </h3>
                <p className="text-xs text-gray-500">
                  We automatically matched matching header names. Review and adjust any dropdowns below.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TARGET_FIELDS.map((f) => (
                <div
                  key={f.key}
                  className="p-3 bg-[#F6F8F7] rounded-xl border border-[#E2E8E4] space-y-1"
                >
                  <label className="block text-xs font-bold text-gray-700">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={fieldMapping[f.key] || ''}
                    onChange={(e) =>
                      setFieldMapping({ ...fieldMapping, [f.key]: e.target.value })
                    }
                    className="w-full text-xs p-2 bg-white border border-[#CBD7D0] rounded-lg focus:border-[#0B6E4F] outline-none"
                  >
                    <option value="">— Unmapped —</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                onClick={handleImportSubmit}
                className="px-6 py-3 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>Import {parsedRows.length} Projects into MASE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Import Results Banner */}
        {importResult && (
          <div className="p-5 rounded-2xl bg-[#E6F1EC] border border-[#0B6E4F]/30 space-y-2">
            <div className="flex items-center gap-2 text-[#0B6E4F] font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Import Completed Successfully!</span>
            </div>
            <div className="text-xs text-[#0A3D2C] grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div>Projects Added: <strong>{importResult.added}</strong></div>
              <div>New Schools Created: <strong>{importResult.newSchools}</strong></div>
              <div>New Categories: <strong>{importResult.newCategories}</strong></div>
              <div>Tables Created: <strong>{importResult.newTables}</strong></div>
            </div>
            {importResult.errors.length > 0 && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {importResult.errors.length} row(s) had errors and were skipped.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
