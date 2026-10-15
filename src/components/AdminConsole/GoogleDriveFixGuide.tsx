import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  Server,
  Cloud,
  Terminal,
} from 'lucide-react';

export const GoogleDriveFixGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const appScriptDeploymentFixCode = `/**
 * FIX FOR APPS SCRIPT "ANYONE ACCESS" GOOGLE DRIVE BLOCKING:
 * 
 * 1. DEPLOYMENT SETTINGS (In Google Apps Script Editor):
 *    - Click "Deploy" > "New deployment"
 *    - Select type: "Web app"
 *    - Description: "MASE Judging Production"
 *    - Execute as: "Me (your-email@gmu.ac.ae)"   <-- CRITICAL! DO NOT select "User accessing the web app"
 *    - Who has access: "Anyone"                    <-- Allows judges without needing Google login!
 * 
 * 2. IF RUNNING IN GOOGLE WORKSPACE (@gmu.ac.ae):
 *    If your institutional admin restricts sharing outside GMU, the "Anyone" option
 *    will show a 403 or "You need permission" to external judges.
 *    SOLUTIONS:
 *    a) Use this independent standalone Web App (which has zero Google Drive blocks)
 *    b) OR deploy the Apps Script from a standard Google account (@gmail.com) with Editor rights on the Sheet!
 */

function doGet(e) {
  // Always allow embedding in iframes / mobile browsers:
  return HtmlService.createTemplateFromFile('Judge')
    .evaluate()
    .setTitle('Gulf Medical University MASE')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // <-- Fixes iframe blocking!
}
`;

  const serviceAccountGuide = `// ==============================================================================
// SOLUTION 2: GOOGLE SERVICE ACCOUNT FOR DIRECT GOOGLE SHEETS SYNC
// (Zero user sign-in required, completely bypasses Google Drive login blocks)
// ==============================================================================

// Step 1: Create a Service Account in Google Cloud Console
// 1. Visit https://console.cloud.google.com/iam-admin/serviceaccounts
// 2. Click "Create Service Account" (Name: "gmu-mase-eval-sync")
// 3. Grant role: "Project > Editor"
// 4. Click Keys > "Add Key" > "Create new key" > Select "JSON". Download the JSON key file.
// 5. Note the client_email inside the JSON (e.g., gmu-mase-sync@your-project.iam.gserviceaccount.com)

// Step 2: Share your Google Sheet with the Service Account
// 1. Open your GMU MASE Evaluation Google Sheet
// 2. Click the green "Share" button
// 3. Paste the service account email (gmu-mase-sync@your-project.iam.gserviceaccount.com)
// 4. Give it "Editor" permissions!

// Step 3: Node.js / Express Server code using 'googleapis':
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: './gmu-service-account.json', // path to downloaded JSON key
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function appendEvaluationToSheet(spreadsheetId, evalData) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId,
    range: 'Evaluations!A:W',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        evalData.EvaluationID,
        evalData.ParticipantID,
        evalData.SchoolID,
        evalData.CategoryID,
        evalData.TableID,
        evalData.JudgeID,
        evalData.JudgeName,
        'RUB-MASE-V1',
        1,
        evalData.C1,
        evalData.C2,
        evalData.C3,
        evalData.C4,
        evalData.TimePenalty,
        evalData.Total,
        40,
        evalData.Percentage,
        evalData.Comments || '',
        'Submitted',
        new Date().toISOString(),
        new Date().toISOString()
      ]]
    }
  });
}
`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B8860B] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
          <HelpCircle className="w-4 h-4" />
          <span>Diagnostic & Solution Guide</span>
        </div>
        <h2 className="text-xl font-black text-[#11241C]">
          Solving the Google Apps Script &amp; Drive Blocking Issue
        </h2>
        <p className="text-xs text-gray-500 max-w-2xl">
          Why Google Drive blocks judges when accessing Apps Script with "Anyone" permissions, and the two reliable solutions to ensure 100% smooth judging for Gulf Medical University MASE.
        </p>
      </div>

      {/* Why Google Drive Blocks Judges */}
      <div className="bg-red-50/70 border border-red-200 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>The Root Causes of Google Drive Blocking Judges</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-red-950">
          <div className="bg-white p-3.5 rounded-xl border border-red-100 space-y-1">
            <strong className="block text-red-800">1. Domain Restriction Policy</strong>
            <p className="text-gray-600">
              If your Apps Script was created with an institutional account (e.g. <code>@gmu.ac.ae</code>), Google Workspace policies often disallow outside users. External judges get a 403 Forbidden or "You need permission" screen.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-red-100 space-y-1">
            <strong className="block text-red-800">2. "Execute As" Misconfiguration</strong>
            <p className="text-gray-600">
              If deployed as <em>"Execute as: User accessing the web app"</em>, every judge is forced to log into a Google Account that already has Drive file permissions. It fails if they have personal accounts or aren't logged in.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-red-100 space-y-1">
            <strong className="block text-red-800">3. Iframe &amp; 3rd-Party Cookie Block</strong>
            <p className="text-gray-600">
              When an Apps Script is embedded in Google Sites or an iframe, Safari and Chrome block cross-site cookies, causing endless login redirect loops (<code>accounts.google.com refused to connect</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Solution 1: Use this Native Web App */}
      <div className="bg-white rounded-3xl p-6 border-2 border-[#0B6E4F] shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#0B6E4F] font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Recommended Solution 1: Use This Standalone Web Platform</span>
          </div>
          <span className="text-xs bg-[#E6F1EC] text-[#0B6E4F] font-bold px-2.5 py-1 rounded-full">
            Active Now
          </span>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          This platform is completely independent of Google Drive authorization. Judges access it using an 8-character Access Code (e.g., <code>GMU-7821</code>) directly in any mobile or desktop browser without needing any Google account, eliminating Drive permission blocks completely.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-[#F6F8F7] p-3 rounded-xl border border-[#E2E8E4]">
            <strong className="text-gray-800 block mb-0.5">Zero Google Login</strong>
            <span className="text-gray-500">Judges just enter their simple Access Code. Works on every phone or iPad.</span>
          </div>
          <div className="bg-[#F6F8F7] p-3 rounded-xl border border-[#E2E8E4]">
            <strong className="text-gray-800 block mb-0.5">Works Offline</strong>
            <span className="text-gray-500">Scores are cached locally so exhibition hall Wi-Fi dropouts do not lose marks.</span>
          </div>
          <div className="bg-[#F6F8F7] p-3 rounded-xl border border-[#E2E8E4]">
            <strong className="text-gray-800 block mb-0.5">Export to Excel / Sheets</strong>
            <span className="text-gray-500">Download clean CSVs and import directly to Google Sheets anytime.</span>
          </div>
        </div>
      </div>

      {/* Solution 2: Fix Apps Script Web App Deployment Settings */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-[#11241C]">
            <FileCode className="w-4 h-4 text-[#0B6E4F]" />
            <span>Solution 2: Correct Google Apps Script Deployment Settings</span>
          </div>
          <button
            onClick={() => copyToClipboard(appScriptDeploymentFixCode, 'appscript')}
            className="flex items-center gap-1 text-xs text-[#0B6E4F] hover:text-[#08533b] font-bold"
          >
            {copiedSection === 'appscript' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Instructions</span>
              </>
            )}
          </button>
        </div>

        <div className="text-xs text-gray-600 space-y-2">
          <p>
            If you still want to deploy via Google Apps Script, you MUST configure the deployment with these exact parameters:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-gray-700">
            <li>In Apps Script Editor, click <strong>Deploy &gt; New deployment</strong>.</li>
            <li>Select <strong>Web app</strong>.</li>
            <li>Set <strong>Execute as: "Me (your email)"</strong>. (This ensures the script runs with your sheet permissions, so judges don't need access to the Google Sheet!).</li>
            <li>Set <strong>Who has access: "Anyone"</strong>. (Note: If your GMU Google Workspace account disables "Anyone outside the organization", copy the script to a personal @gmail.com account that has edit permissions on the sheet).</li>
            <li>In <code>doGet(e)</code>, add <code>.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)</code> to allow iframe embedding on Google Sites.</li>
          </ol>
        </div>

        <pre className="bg-[#05261B] text-[#DCEAE3] p-4 rounded-2xl text-xs font-mono overflow-x-auto">
          {appScriptDeploymentFixCode}
        </pre>
      </div>

      {/* Solution 3: Google Service Account Guide */}
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-[#11241C]">
            <Cloud className="w-4 h-4 text-[#B8860B]" />
            <span>Solution 3: Google Service Account Setup (For Automated Sync)</span>
          </div>
          <button
            onClick={() => copyToClipboard(serviceAccountGuide, 'serviceaccount')}
            className="flex items-center gap-1 text-xs text-[#0B6E4F] hover:text-[#08533b] font-bold"
          >
            {copiedSection === 'serviceaccount' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Service Account Code</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-600">
          A <strong>Google Cloud Service Account</strong> is a robot account with its own private credentials. It talks directly to Google Sheets API without any user login or browser authentication:
        </p>

        <pre className="bg-[#0A1812] text-[#9FC4B4] p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-72">
          {serviceAccountGuide}
        </pre>
      </div>
    </div>
  );
};
