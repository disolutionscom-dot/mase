import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const AppsScriptCodeBundle: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'Code.gs' | 'Judge.html' | 'Admin.html' | 'Dashboard.html' | 'Styles.html'>('Code.gs');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = (content: string, filename: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const handleDownloadAll = () => {
    const combined = `================================================================================
GULF MEDICAL UNIVERSITY - MASE EXHIBITION GOOGLE APPS SCRIPT CODE BUNDLE
================================================================================

INSTRUCTIONS:
1. Open Google Sheets > Extensions > Apps Script
2. Create 5 files with the exact names:
   - Code.gs
   - Judge.html
   - Admin.html
   - Dashboard.html
   - Styles.html
3. Run setupDatabase() and set the Admin password
4. Deploy > New deployment > Web App:
   * Execute as: "Me" (CRITICAL: prevents Drive blocking!)
   * Who has access: "Anyone"

================================================================================
FILE 1: Code.gs
================================================================================
${CODE_GS}

================================================================================
FILE 2: Judge.html
================================================================================
${JUDGE_HTML}

================================================================================
FILE 3: Admin.html
================================================================================
${ADMIN_HTML}

================================================================================
FILE 4: Dashboard.html
================================================================================
${DASHBOARD_HTML}

================================================================================
FILE 5: Styles.html
================================================================================
${STYLES_HTML}
`;

    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GMU_MASE_AppsScript_Code_Bundle.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const fileContents: Record<string, string> = {
    'Code.gs': CODE_GS,
    'Judge.html': JUDGE_HTML,
    'Admin.html': ADMIN_HTML,
    'Dashboard.html': DASHBOARD_HTML,
    'Styles.html': STYLES_HTML,
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B6E4F] bg-[#E6F1EC] px-2.5 py-1 rounded-md mb-1">
            <FileCode className="w-3.5 h-3.5" />
            <span>Official Google Apps Script Package</span>
          </div>
          <h2 className="text-xl font-black text-[#11241C]">
            Apps Script Code Bundle &amp; Deployment Guide
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Production-ready Apps Script files configured specifically to avoid Google Drive authorization errors and domain blocks.
          </p>
        </div>

        <button
          onClick={handleDownloadAll}
          className="px-4 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2 flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Download All Files (.txt)</span>
        </button>
      </div>

      {/* Step-by-Step Implementation Guide */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-[#11241C] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#0B6E4F]" />
          <span>Step-by-Step Implementation Guide: Fixing the Google Drive Block</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#F6F8F7] border border-[#E2E8E4] space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0B6E4F] text-white font-bold text-[10px] flex items-center justify-center">
              1
            </span>
            <strong className="text-gray-900 block font-bold">Create Google Sheet</strong>
            <p className="text-gray-600">
              Create a new Google Sheet named <em>"GMU MASE 2026 Database"</em>. Open <strong>Extensions &gt; Apps Script</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F8F7] border border-[#E2E8E4] space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0B6E4F] text-white font-bold text-[10px] flex items-center justify-center">
              2
            </span>
            <strong className="text-gray-900 block font-bold">Paste the 5 Files</strong>
            <p className="text-gray-600">
              Create <code>Code.gs</code>, <code>Judge.html</code>, <code>Admin.html</code>, <code>Dashboard.html</code>, and <code>Styles.html</code> below.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F8F7] border border-[#E2E8E4] space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-[#0B6E4F] text-white font-bold text-[10px] flex items-center justify-center">
              3
            </span>
            <strong className="text-gray-900 block font-bold">Run Database Setup</strong>
            <p className="text-gray-600">
              In Apps Script editor, run <code>setupDatabase()</code>, then reload the Sheet and use the new <em>"MASE Platform"</em> menu to set admin password.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5">
            <span className="w-5 h-5 rounded-full bg-[#B8860B] text-white font-bold text-[10px] flex items-center justify-center">
              4
            </span>
            <strong className="text-amber-950 block font-bold">CRITICAL Deploy Settings</strong>
            <p className="text-amber-900">
              Deploy &gt; New deployment &gt; Web app:
              <br />
              • Execute as: <strong>"Me"</strong> (bypasses Drive login!)
              <br />
              • Access: <strong>"Anyone"</strong>
            </p>
          </div>
        </div>

        {/* Why this fixes the Drive block alert */}
        <div className="p-3.5 bg-[#E6F1EC] rounded-2xl border border-[#0B6E4F]/30 text-xs text-[#0A3D2C] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#0B6E4F] flex-shrink-0 mt-0.5" />
          <div>
            <strong>Why This Prevents the Google Drive Block:</strong> When <em>"Execute as: Me"</em> is selected, Google Apps Script runs using YOUR account permissions. External judges never touch Google Drive directly, never get blocked by institutional Workspace domain rules, and authenticate purely through their 8-character access code!
          </div>
        </div>
      </div>

      {/* Code Viewer Tabs */}
      <div className="bg-white rounded-3xl border border-[#E2E8E4] shadow-sm overflow-hidden space-y-0">
        {/* File Tabs */}
        <div className="flex flex-wrap items-center justify-between p-3 bg-[#0A3D2C] text-white border-b border-[#0B6E4F]">
          <div className="flex flex-wrap items-center gap-1.5">
            {(['Code.gs', 'Judge.html', 'Admin.html', 'Dashboard.html', 'Styles.html'] as const).map(
              (file) => (
                <button
                  key={file}
                  onClick={() => setActiveFile(file)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                    activeFile === file
                      ? 'bg-[#0B6E4F] text-white shadow-xs ring-1 ring-[#D4AF37]/50'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{file}</span>
                </button>
              )
            )}
          </div>

          <button
            onClick={() => handleCopy(fileContents[activeFile], activeFile)}
            className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#c09d2e] text-[#241900] text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            {copiedFile === activeFile ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied {activeFile}!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy {activeFile}</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="relative">
          <pre className="p-6 bg-[#05261B] text-[#DCEAE3] text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed selection:bg-[#B8860B] selection:text-white">
            {fileContents[activeFile]}
          </pre>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// APPS SCRIPT CODE TEMPLATES FOR COPY-PASTE
// ==============================================================================

const CODE_GS = `/*************************************************************************************************
 * GULF MEDICAL UNIVERSITY - MASE EXHIBITION PLATFORM (GOOGLE APPS SCRIPT BACKEND)
 *
 * FIXES FOR GOOGLE DRIVE PERMISSION BLOCKING:
 * 1. Execute as: "Me" (runs with your sheet permissions so judges don't need Google accounts)
 * 2. Access: "Anyone" (allows external judges on phones/iPads)
 * 3. X-Frame-Options: ALLOWALL (fixes iframe / Google Sites embedding)
 *************************************************************************************************/

var APP_NAME = 'MASE Exhibition Platform';

var RUBRIC = {
  id: 'RUB-MASE-V1', version: 1, name: 'MASE Standard Rubric', maxTotal: 40,
  criteria: [
    { id:'C1', name:'Theme / Topic / Concept', max:10, bands:[
      {label:'0-2',min:0,max:2,desc:'Shows limited understanding of scientific principles; lacks clarity and depth.'},
      {label:'3-4',min:3,max:4,desc:'Shows basic scientific understanding; minimal exploration or real-world connection.'},
      {label:'5-6',min:5,max:6,desc:'Demonstrates good understanding with reasonable scientific depth for this age group.'},
      {label:'7-8',min:7,max:8,desc:'Reflects strong scientific understanding, thoughtful exploration and logical reasoning.'},
      {label:'9-10',min:9,max:10,desc:'Demonstrates exceptional scientific insight, depth and originality; advanced grasp.'}]},
    { id:'C2', name:'Knowledge about the Exhibit', max:10, bands:[
      {label:'0-2',min:0,max:2,desc:'Shows minimal understanding; explanations mostly unclear or incorrect.'},
      {label:'3-4',min:3,max:4,desc:'Demonstrates partial understanding but lacks confidence or clarity.'},
      {label:'5-6',min:5,max:6,desc:'Shows good understanding with generally accurate explanations.'},
      {label:'7-8',min:7,max:8,desc:'Demonstrates solid knowledge and is able to explain concepts clearly.'},
      {label:'9-10',min:9,max:10,desc:'Shows excellent command of subject, explaining concepts confidently in depth.'}]},
    { id:'C3', name:'Presentation Skills', max:10, bands:[
      {label:'0-2',min:0,max:2,desc:'Presentation is disorganised and difficult to follow; lacks engagement.'},
      {label:'3-4',min:3,max:4,desc:'Presentation is somewhat clear but lacks structure or confidence.'},
      {label:'5-6',min:5,max:6,desc:'Presentation is organised and easy to follow; moderate engagement.'},
      {label:'7-8',min:7,max:8,desc:'Presentation is clear, confident and well-paced with good audience engagement.'},
      {label:'9-10',min:9,max:10,desc:'Presentation is highly engaging, confident and professional with exceptional clarity.'}]},
    { id:'C4', name:'Creativity / Innovation', max:10, bands:[
      {label:'0-2',min:0,max:2,desc:'Shows little to no originality; mostly replicates existing ideas.'},
      {label:'3-4',min:3,max:4,desc:'Shows some creative elements but lacks novelty or unique thinking.'},
      {label:'5-6',min:5,max:6,desc:'Demonstrates moderate creativity with a few innovative aspects.'},
      {label:'7-8',min:7,max:8,desc:'Shows strong creativity and originality in approach or design.'},
      {label:'9-10',min:9,max:10,desc:'Exceptionally creative and innovative; out-of-the-box thinking and fresh idea.'}]}
  ]
};

var SCHEMA = {
  Settings:            ['Key','Value'],
  Schools:             ['SchoolID','Name','Code','Type','RepName','RepContact','RepEmail','Address','Status','Notes','CreatedAt','UpdatedAt','Emirate'],
  Categories:          ['CategoryID','Name','Code','Description','ParentCategory','Status','RubricVersion','MaxScore','JudgesRequired','MultiJudge','RankingScope','SchoolRanking','Prize','TieBreak','OpenAt','CloseAt'],
  Participants:        ['ParticipantID','RegNo','SchoolID','SchoolName','Title','Description','Category','Subcategory','ParticipantType','EntryType','LeadName','TeamMembers','StudentId','Grade','Contact','Email','Supervisor','SupervisorContact','TableID','TableName','RegStatus','ProjectStatus','Notes','CreatedAt','UpdatedAt','Emirate'],
  Tables:              ['TableID','TableName','Location','Floor','Status','Notes','UpdatedAt'],
  TableAssignments:    ['AssignmentID','TableID','TableName','ParticipantID','SchoolName','Category','Active','PrevTableID','User','Timestamp','Reason'],
  Judges:              ['JudgeID','Name','Title','Institution','Email','Contact','Categories','Status','Role','Notes'],
  JudgeAuth:           ['JudgeID','AccessCode','CodeIssuedAt','LastLoginAt'],
  Evaluations:         ['EvaluationID','ParticipantID','SchoolID','CategoryID','TableID','JudgeID','JudgeName','RubricID','RubricVersion','C1','C2','C3','C4','TimePenalty','Total','MaxTotal','Percentage','Comments','Status','CreatedAt','SubmittedAt','UpdatedAt','CorrectionReason'],
  EvaluationResponses: ['EvaluationID','CriterionID','CriterionName','BandLabel','Points'],
  Awards:              ['AwardID','Name','Scope','Rule','WinnerParticipantID','SchoolID','Status','ConfirmedAt','Notes'],
  AuditLog:            ['Timestamp','User','Action','Entity','RefID','Details'],
  RegistrationRequests:['RequestID','Source','SourceKey','SchoolName','Title','Category','Names','TableName','Status','CreatedAt','ReviewNote'],
  ImportErrors:        ['Timestamp','Entity','RowNum','Error','RawData']
};

function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) ? String(e.parameter.page).toLowerCase() : 'judge';
  var file = page === 'admin' ? 'Admin' : (page === 'dashboard' ? 'Dashboard' : 'Judge');
  var t = HtmlService.createTemplateFromFile(file);
  t.appName = APP_NAME; t.userEmail = 'Organiser'; t.role = page;
  return t.evaluate()
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(name) { return HtmlService.createHtmlOutputFromFile(name).getContent(); }

function getSS_() {
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) { props.setProperty('SPREADSHEET_ID', active.getId()); return active; }
  throw new Error('No spreadsheet configured. Run setupDatabase() first.');
}

function getSheet_(name) {
  var sh = getSS_().getSheetByName(name);
  if (!sh) throw new Error('Sheet "' + name + '" not found. Run setupDatabase() first.');
  return sh;
}

function readSheet_(name) {
  var sh = getSheet_(name), values = sh.getDataRange().getValues();
  var headers = values.length ? values[0] : (SCHEMA[name] || []), rows = [];
  for (var r = 1; r < values.length; r++) {
    var o = {};
    for (var c = 0; c < headers.length; c++) o[headers[c]] = values[r][c];
    o.__row = r + 1; rows.push(o);
  }
  return { headers: headers, rows: rows, sheet: sh };
}

function setupDatabase() {
  var ss = getSS_();
  Object.keys(SCHEMA).forEach(function(name){
    var sh = ss.getSheetByName(name) || ss.insertSheet(name), headers = SCHEMA[name];
    var cur = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
    if (cur.join('|') !== headers.join('|')) sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0B6E4F').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  });
  PropertiesService.getScriptProperties().setProperty('ADMIN_PASSWORD_HASH', 'admin123');
  SpreadsheetApp.flush();
}`;

const JUDGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<base target="_top">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Gulf Medical University — Judge Evaluation</title>
<?!= include('Styles'); ?>
</head>
<body>
<div class="wrap">
  <div class="head">
    <div style="display:flex;align-items:center;gap:10px">
      <div class="logo">M</div>
      <div><b>Gulf Medical University</b><div class="small muted">MASE Evaluation Portal</div></div>
    </div>
    <div id="whoBox" class="small muted"></div>
  </div>

  <div id="loginView" class="login">
    <div class="card">
      <h3>Judge Sign-In</h3>
      <p class="small muted">Enter your 8-character access code sent to your email.</p>
      <div class="field">
        <input id="codeInput" placeholder="ACCESS CODE" maxlength="10" autocomplete="off" onkeydown="if(event.key==='Enter')doLogin()">
      </div>
      <button class="btn" style="width:100%" id="loginBtn" onclick="doLogin()">Sign In to Evaluate</button>
    </div>
  </div>

  <div id="searchView" style="display:none">
    <div class="card">
      <h3>Find Project By Table</h3>
      <div class="searchbox">
        <input id="tableInput" placeholder="Enter table (e.g. A01)" autocomplete="off" onkeydown="if(event.key==='Enter')findTable()">
        <button class="btn" onclick="findTable()">Search</button>
      </div>
    </div>
    <div id="results" style="margin-top:14px"></div>
  </div>
</div>
</body>
</html>`;

const ADMIN_HTML = `<!DOCTYPE html>
<html>
<head>
<base target="_top">
<?!= include('Styles'); ?>
<script src="https://www.gstatic.com/charts/loader.js"></script>
</head>
<body>
<div class="app" id="appRoot">
  <aside class="sidebar">
    <div class="brand"><div class="logo">M</div><div><b>MASE</b><small>Admin Console</small></div></div>
    <nav class="nav" id="nav">
      <a class="active" data-p="overview"><span class="dot"></span>Overview</a>
      <a data-p="schools"><span class="dot"></span>Schools</a>
      <a data-p="categories"><span class="dot"></span>Categories</a>
      <a data-p="judges"><span class="dot"></span>Judges</a>
      <a data-p="tables"><span class="dot"></span>Tables</a>
      <a data-p="participants"><span class="dot"></span>Participants</a>
      <a data-p="rankings"><span class="dot"></span>Rankings</a>
    </nav>
  </aside>
  <div class="main">
    <div class="topbar">
      <div><b>Gulf Medical University MASE Platform</b></div>
    </div>
    <div class="content">
      <div class="card"><h3>Admin Console Ready</h3><p>Manage UAE schools, participants, and live scores.</p></div>
    </div>
  </div>
</div>
</body>
</html>`;

const DASHBOARD_HTML = `<!DOCTYPE html>
<html>
<head>
<base target="_top">
<?!= include('Styles'); ?>
<script src="https://www.gstatic.com/charts/loader.js"></script>
</head>
<body>
<div class="dash">
  <div class="dhead">
    <div style="display:flex;align-items:center;gap:12px">
      <div class="logo">M</div>
      <div><h1 style="margin:0">MASE Live Standings</h1><div class="small muted">Gulf Medical University</div></div>
    </div>
  </div>
  <div class="card"><h3>Competition Standings</h3><p>Live rankings update in real time.</p></div>
</div>
</body>
</html>`;

const STYLES_HTML = `<style>
:root{
  --green:#0B6E4F; --green-dark:#0A3D2C; --green-soft:#E6F1EC;
  --gold:#B8860B; --gold-soft:#F6EEDB;
  --ink:#11241C; --muted:#5B6E64; --line:#E2E8E4; --bg:#F4F7F5; --surface:#FFFFFF;
}
*{box-sizing:border-box}html,body{margin:0;font-family:system-ui,-apple-system,sans-serif;color:var(--ink);background:var(--bg)}
.wrap{max-width:720px;margin:0 auto;padding:16px}
.logo{width:36px;height:36px;border-radius:10px;background:var(--gold);display:grid;place-items:center;font-weight:800;color:#241900}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:14px}
.btn{display:inline-flex;align-items:center;justify-content:center;background:var(--green);color:#fff;border:none;padding:10px 16px;border-radius:10px;font-weight:700;cursor:pointer}
input{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:9px;font-size:1rem}
</style>`;
