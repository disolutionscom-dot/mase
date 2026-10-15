import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Database,
  Upload,
  CheckCircle2,
  Sparkles,
  Trophy,
} from 'lucide-react';

interface ReportsExporterProps {
  onExportCsv: (type: 'overallTop10' | 'categories' | 'schools' | 'emirates') => string;
  onExportFullJson: () => string;
  onImportFullJson: (json: string) => boolean;
  exhibitionName: string;
  onOpenAwardsPdf?: () => void;
}

export const ReportsExporter: React.FC<ReportsExporterProps> = ({
  onExportCsv,
  onExportFullJson,
  onImportFullJson,
  exhibitionName,
  onOpenAwardsPdf,
}) => {
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const handleDownloadReport = (type: 'overallTop10' | 'categories' | 'schools' | 'emirates') => {
    const csv = onExportCsv(type);
    const yr = new Date().getFullYear();
    const filenames = {
      overallTop10: `GMU_MASE_OverallTop10_${yr}.csv`,
      categories: `GMU_MASE_CategoryResults_${yr}.csv`,
      schools: `GMU_MASE_SchoolStandings_${yr}.csv`,
      emirates: `GMU_MASE_EmiratePerformance_${yr}.csv`,
    };
    downloadFile(csv, filenames[type], 'text/csv;charset=utf-8');
  };

  const handleExportBackup = () => {
    const json = onExportFullJson();
    const date = new Date().toISOString().slice(0, 10);
    downloadFile(json, `GMU_MASE_Database_Backup_${date}.json`, 'application/json');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = onImportFullJson(content);
        if (ok) {
          setRestoreMessage('Database restored successfully from backup!');
        } else {
          setRestoreMessage('Failed to restore backup: Invalid JSON structure.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm">
        <h2 className="text-xl font-black text-[#11241C]">Reports &amp; Data Exports</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Download formatted Excel/Google Sheets CSV results or create full platform backups.
        </p>
      </div>

      {/* Awards Ceremony PDF Summary Card */}
      {onOpenAwardsPdf && (
        <div className="bg-gradient-to-r from-[#0A3D2C] to-[#0B6E4F] rounded-3xl p-6 sm:p-7 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-[#D4AF37]/30">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase bg-[#D4AF37]/25 text-[#E6C65C] px-3 py-1 rounded-full border border-[#D4AF37]/40">
              <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Official Awards Ceremony Document</span>
            </div>
            <h3 className="text-xl font-black text-white">
              Formatted PDF Summary of Final Rankings
            </h3>
            <p className="text-xs text-[#C7DDD3] max-w-xl leading-relaxed">
              Generates a formal, printable A4 awards ceremony dossier with executive podium medals (Gold, Silver, Bronze), category winners, institutional honors, and official verification sign-off lines.
            </p>
          </div>

          <button
            onClick={onOpenAwardsPdf}
            className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-110 text-[#241900] text-xs font-black rounded-2xl shadow-lg transition flex items-center gap-2 flex-shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Generate Ceremony PDF</span>
          </button>
        </div>
      )}

      {/* CSV Result Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#E2E8E4] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#E6F1EC] text-[#0B6E4F]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#11241C]">Overall Top 10 Report</h3>
              <p className="text-xs text-gray-500">Official winners and ranked exhibition entries.</p>
            </div>
          </div>
          <button
            onClick={() => handleDownloadReport('overallTop10')}
            className="w-full py-2.5 px-4 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Overall Top 10 (CSV)</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E2E8E4] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-[#B8860B]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#11241C]">Category Results Breakdown</h3>
              <p className="text-xs text-gray-500">Detailed scores by category with tie-breakers.</p>
            </div>
          </div>
          <button
            onClick={() => handleDownloadReport('categories')}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#CBD7D0] text-gray-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Category Standings (CSV)</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E2E8E4] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#11241C]">School Performance Standings</h3>
              <p className="text-xs text-gray-500">Overall school scores and participation metrics.</p>
            </div>
          </div>
          <button
            onClick={() => handleDownloadReport('schools')}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#CBD7D0] text-gray-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download School Standings (CSV)</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E2E8E4] shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#11241C]">Emirate Fair Mean Standings</h3>
              <p className="text-xs text-gray-500">Average project performance across UAE Emirates.</p>
            </div>
          </div>
          <button
            onClick={() => handleDownloadReport('emirates')}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#CBD7D0] text-gray-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Emirate Standings (CSV)</span>
          </button>
        </div>
      </div>

      {/* Print / PDF Option */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-[#11241C]">Printable Results / Save as PDF</h3>
          <p className="text-xs text-gray-500">
            Open the browser print dialog to print or save the current rankings as a formal PDF document.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-2 flex-shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Database Backup & Restore */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-[#11241C]">Complete Database Backup &amp; Restore</h3>
          <p className="text-xs text-gray-500">
            Backup all evaluations, schools, categories, and settings as a portable JSON snapshot.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2.5 bg-[#0A3D2C] hover:bg-[#06241a] text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>Download Full JSON Backup</span>
          </button>

          <label className="cursor-pointer px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Restore From JSON Backup</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleRestoreBackup}
              className="hidden"
            />
          </label>
        </div>

        {restoreMessage && (
          <div className="text-xs p-3 rounded-xl bg-[#E6F1EC] text-[#0A3D2C] border border-[#0B6E4F]/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0B6E4F]" />
            <span>{restoreMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
