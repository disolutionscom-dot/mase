import React, { useState } from 'react';
import { Copy, Check, Sparkles, X, MessageSquare, Terminal, ExternalLink } from 'lucide-react';

interface ClaudePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClaudePromptModal: React.FC<ClaudePromptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(CLAUDE_PROMPT_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-[#CBD7D0]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-[#0A3D2C] text-white flex items-center justify-between gap-4 border-b border-[#0B6E4F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#B8860B] text-[#241900] flex items-center justify-center font-black text-sm">
              AI
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Turnkey Claude / LLM Implementation Prompt
              </h3>
              <p className="text-[11px] text-[#9FC4B4]">
                Copy and paste this comprehensive prompt into Claude to rebuild or update the exact same project.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#c09d2e] text-[#241900] text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied Prompt!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prompt Content */}
        <div className="p-6 overflow-y-auto bg-[#FAFCFA] space-y-4">
          <div className="p-3 bg-[#E6F1EC] rounded-2xl border border-[#0B6E4F]/30 text-xs text-[#0A3D2C] flex items-center justify-between">
            <span>
              <strong>Ready to paste:</strong> Contains all schema definitions, mathematical formulas (Fair Mean, tie-breakers), component specs, and Google Apps Script fix.
            </span>
            <button
              onClick={handleCopy}
              className="text-xs font-bold text-[#0B6E4F] hover:underline flex items-center gap-1 flex-shrink-0 ml-3"
            >
              {copied ? '✓ Copied' : 'Copy Text'}
            </button>
          </div>

          <pre className="p-5 bg-[#05261B] text-[#DCEAE3] rounded-2xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed selection:bg-[#B8860B] selection:text-white border border-[#0B6E4F]/40 max-h-[60vh]">
            {CLAUDE_PROMPT_TEXT}
          </pre>
        </div>
      </div>
    </div>
  );
};

export const CLAUDE_PROMPT_TEXT = `# TASK: Build the Complete "Gulf Medical University MASE Live Judging, Evaluation & Real-Time Dashboard Platform"

Please build or update the full-stack web application for the Gulf Medical University Annual Medical and Science Exhibition (MASE). The platform is used by academic judges, organizing faculty, and live exhibition audiences. It must solve Google Drive permission blocking, provide real-time score tabulation, and deliver executive-grade competition analytics.

---

## 1. CORE PROBLEM & ARCHITECTURAL SOLUTION

### The Google Drive / Apps Script Blocking Issue:
- When using Google Apps Script or Google Sites with external judges, Google Drive blocks them with 403 Forbidden, domain restriction errors (@gmu.ac.ae cross-domain policy), or third-party cookie/iframe failures.
- **The Solution:**
  1. The platform operates as a standalone responsive web application that requires ZERO Google account sign-ins for judges.
  2. Judges authenticate using a private, permanent 8-character Access Code (e.g. \`GMU-7821\`).
  3. The Apps Script backend is deployed with:
     - \`Execute as: "Me (your account)"\` (this executes with the spreadsheet owner's permissions, completely insulating external judges from Google Drive permission checks).
     - \`Who has access: "Anyone"\`.
     - \`X-Frame-Options: ALLOWALL\` to allow iframe embedding on Google Sites without cookie rejection.

---

## 2. OFFICIAL GMU 40-POINT EVALUATION RUBRIC

Implement the exact standardized 4-criteria rubric:
1. **C1: Theme / Topic / Concept (Max 10 marks):**
   - 0–2: Limited understanding; lacks clarity.
   - 3–4: Basic scientific understanding; minimal exploration.
   - 5–6: Good understanding with reasonable scientific depth.
   - 7–8: Strong understanding, thoughtful exploration, logical reasoning.
   - 9–10: Exceptional scientific insight, originality, and advanced grasp.
2. **C2: Knowledge about the Exhibit (Max 10 marks):**
   - 0–2: Minimal understanding; unclear/incorrect explanations.
   - 3–4: Partial understanding; lacks confidence.
   - 5–6: Good understanding; accurate explanations.
   - 7–8: Solid knowledge; explains concepts clearly.
   - 9–10: Excellent command; explains confidently in depth.
3. **C3: Presentation Skills (Max 10 marks):**
   - 0–2: Disorganised; lacks audience engagement.
   - 3–4: Somewhat clear; lacks structure or confidence.
   - 5–6: Organised; moderate audience engagement.
   - 7–8: Clear, confident, well-paced with good engagement.
   - 9–10: Highly engaging, confident, exceptional clarity and delivery.
4. **C4: Creativity / Innovation (Max 10 marks):**
   - 0–2: Little to no originality; replicates existing ideas.
   - 3–4: Some creative elements; lacks novelty.
   - 5–6: Moderate creativity; few innovative aspects.
   - 7–8: Strong creativity and originality in approach/design.
   - 9–10: Exceptionally creative; out-of-the-box thinking.
- **Time Penalty:** Automatic \`-1 mark\` deduction if presentation exceeds time limits (Project: 5 minutes, Poster: 3 minutes).
- **Calculation Formula:**
  \`\`\`ts
  RawScore = C1 + C2 + C3 + C4;
  FinalTotal = Math.max(0, RawScore - (OverTime ? 1 : 0)); // max 40
  Percentage = Math.round((FinalTotal / 40) * 1000) / 10;
  \`\`\`

---

## 3. FAIR RANKING & TABULATION ALGORITHMS

1. **Multi-Judge Aggregation:**
   - When multiple judges evaluate the same project, aggregate using Average (\`mean\`), \`median\`, or \`sum\` (configurable in settings).
   - Project eligibility: \`evaluationCount >= category.JudgesRequired\` and \`RegStatus !== 'Pending'\`.
2. **Overall Top 10:**
   - Ranked by Normalized Percentage (%) or Raw Points.
   - Tie-breakers: Creativity (C4), then Knowledge (C2), then Presentation (C3).
3. **School Standings:**
   - Ranked by Average Eligible Project Score (Fair Metric) or Total Accumulated Points.
4. **UAE Emirate Fair Mean Standings:**
   - **Formula:** Mean average of eligible project percentage scores originating from that Emirate:
     \`EmirateScore = (Sum of Eligible Project % from Emirate) / (Count of Eligible Projects from Emirate)\`
   - **Advantage:** Prevents populous Emirates with 20 entries from unfairly dominating over Emirates with 3 exceptional projects.
   - **Tie-Breaker:** Count of Top-3 category podium placements won by that Emirate.

---

## 4. SYSTEM MODULES TO IMPLEMENT

### Module A: Judge Evaluation Portal (Mobile & Tablet First)
- **Access Code Login:** Simple uppercase text field with quick demo buttons for judges.
- **Table Locator & Search:**
  - Fast search by table number (e.g. \`A01\`, \`B03\`).
  - Search by project keywords, student name, or school.
  - **Table Reassignment Modal:** If a student team physically shifted exhibition tables, allow the judge to reassign the table on the spot with automatic conflict resolution.
- **Evaluation Form:**
  - Rubric criteria cards with 5 clickable band chips (0–2, 3–4, 5–6, 7–8, 9–10) that instantly set the score, paired with a precision range slider / number input (step 0.1).
  - Time penalty toggle with limit indicator (5 min vs 3 min).
  - Constructive feedback notes.
  - Sticky bottom total bar showing live calculated total out of 40 and percentage.
  - Pre-submission Review Modal and confirmation screen with unique Evaluation ID.
- **My Submitted Evaluations:**
  - History view of past evaluations with score breakdown and revision/correction mode.

### Module B: Live Results Dashboard
- **Auto-Refreshing Ticker:** Refreshes live scores every 15 seconds.
- **Metric Cards:** Total Projects, Evaluations Completed, Progress %, Average Exhibition Score, Competition Status (Provisional vs Final).
- **Tab 1 — Overall Top 10:** Podium medals (Gold, Silver, Bronze), project title, school, category, final score /40, %, and judge count.
- **Tab 2 — Category Standings:** Filterable by academic stream with tie-breaker sorting.
- **Tab 3 — School Standings:** Ranked schools with eligible counts and metric scores.
- **Tab 4 — Regional Performance (New Comprehensive Section):**
  - Emirate comparison cards for all 7 Emirates (Abu Dhabi, Dubai, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain).
  - Comparative visual bars benchmarking each Emirate's average against the exhibition benchmark.
  - Emirate Filter Chips + keyword search within the region.
  - Under each Emirate:
    * 🥇 **Top Performing Projects in that Emirate** (1st, 2nd, 3rd place with lead student, school, category, score, %).
    * 🏫 **Top Performing Schools in that Emirate** (rank, school name, metric score, entries count).
    * One-click "Export [Emirate] CSV".
- **Tab 5 — Live Stream:** Real-time ticker showing incoming evaluations from judges.

### Module C: Admin Console
- **Overview:** Workload counters, table conflict alerts, unassigned participants count.
- **Judge Activity Monitor:**
  - Visual progress bar per judge tracking completed evaluations against assigned quota.
  - Workload comparison horizontal chart.
  - Scoring tendency detector (*Balanced*, *Strict / Discerning*, or *Generous* based on average score given).
  - Last active timestamp and status filter (*All*, *Target Met*, *In Progress*, *Idle*).
- **Registration CSV Importer:**
  - Smart drag-and-drop column mapper (mapping Project Title, School, Emirate, Category, Table, Lead Student, Grade, RegNo).
  - Auto-creates schools, categories, and tables on import.
- **Judge Roster & Codes:**
  - Add/edit judges, rotate access codes, and preview email invitations.
- **Reports & Data Exports:**
  - Download CSVs: Overall Top 10, Category Results, School Standings, Emirate Regional Standings.
  - Full JSON Database Backup & Restore.
- **Awards Ceremony Official PDF Summary:**
  - A4 print-optimized ceremony dossier with GMU header, executive podium medals, category champions, regional champions by Emirate, institutional honors, and official verification signature lines for the Jury Chairperson, Dean, and Exhibition Director.
- **Apps Script Code Bundle & Guide:**
  - Interactive code viewer for \`Code.gs\`, \`Judge.html\`, \`Admin.html\`, \`Dashboard.html\`, and \`Styles.html\` with 1-click copy buttons and step-by-step deployment guide.
- **System Settings:**
  - Exhibition title, scoring aggregation method, ranking method, publish toggle, final results lock, and passwords.

---

## 5. DESIGN & BRANDING SPECIFICATIONS
- **Instituion:** Gulf Medical University (GMU), Ajman, UAE.
- **Palette:**
  - Deep Forest Green: \`#0A3D2C\`, \`#0B6E4F\`, \`#E6F1EC\`
  - GMU Gold: \`#B8860B\`, \`#D4AF37\`, \`#F6EEDB\`
  - Background & Surface: \`#F6F8F7\`, \`#FFFFFF\`, \`#11241C\`, \`#5B6E64\`
- **Typography:** Plus Jakarta Sans & JetBrains Mono for scores.
- **Touch Targets:** Minimum 44px on mobile devices for judges walking exhibition aisles.
- **Print Styles:** Standardized \`@media print\` rules for A4 awards ceremony printing.

Build this complete, production-grade application with clean TypeScript, modular components, and responsive Tailwind CSS.`;
