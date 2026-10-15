# 🏛️ Gulf Medical University (GMU) MASE Exhibition
### Real-Time Live Judging Platform, Faculty Dashboard & Google Sheets Backend

[![Deploy to GitHub Pages](https://github.com/your-username/gmu-mase-judging/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/gmu-mase-judging/actions/workflows/deploy.yml)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A production-grade, responsive, and secure live evaluation system designed for the **Gulf Medical University Annual Medical and Science Exhibition (MASE)**.

Faculty judges evaluate high-school and university student scientific research and biomedical inventions live on tablets and smartphones. Scores are instantly compiled into real-time category, school, and UAE Emirate rankings.

---

## 🌟 Key Features

- **🔐 Zero-Friction Judge Portal**: 
  - Judges log in using dedicated 8-character access codes (e.g., `GMU-7821`, `GMU-4912`)—no complicated Google accounts or passwords required.
  - Interactive table search (e.g. `A01`, `B02`, `1`) and student/school keyword locator.
  - In-app booth reassignment tool for when participants physically swap tables in the hall.

- **📋 Official GMU MASE Evaluation Rubric**:
  - 4 core scientific criteria (10 pts each, Max 40 pts):
    1. *Relevance of Theme / Topic & Concept*
    2. *Knowledge, Understanding & Methodology*
    3. *Presentation, Articulation & Defense*
    4. *Creativity, Originality & Innovation*
  - Dedicated time penalty toggle (-1 point for presentations over time limit).
  - Decimal precision fine-tuning, band guidance, and qualitative jury remarks.

- **📊 Live Faculty & Audience Dashboard**:
  - Real-time pulse with 10-second auto-refresh and sound toggle.
  - **Overall Top 10 Leaderboard** with Gold, Silver, and Bronze trophy badges.
  - **Category Standings** filterable by Scientific Research, Biomedical Innovation, AI & Digital Health, and Poster Presentations.
  - **Overall School Standings** ranking UAE institutions.
  - **Emirates Rankings** with fair multi-project formula.

- **🇦🇪 Regional Performance Breakdown**:
  - Live analysis filtering top schools and highest-scoring projects across each of the **7 UAE Emirates**:
    *Abu Dhabi, Dubai, Sharjah, Ajman, Umm Al Quwain, Ras Al Khaimah, and Fujairah*.
  - Visual distribution of schools, entries, and average scores per region.

- **📈 Judge Activity Monitor**:
  - Real-time admin tracker monitoring how many projects each judge has scored.
  - Visual completion progress bars, category coverage badges, and last submission timestamps.

- **🏆 Awards Ceremony Printout (Formatted PDF)**:
  - One-click print-ready summary of final winners, category podiums, top UAE schools, and jury sign-off lines for the closing ceremony.

- **✉️ Serverless Email Dispatch Engine (Google Apps Script Backend)**:
  - Built-in Email Dispatch Center in the Admin Console:
    - **Juror Credentials Delivery**: Dispatches encrypted 8-character access codes and portal URLs to judges.
    - **Awards & Scorecard Notifications**: Delivers final percentages, scores, and ceremony invitations to student teams and school supervisors.
    - **Broadcast Announcements**: Sends urgent schedule announcements to all participants or selected groups.
    - **Zero-Server Delivery**: Runs via Google Apps Script `MailApp`, requiring zero paid mail servers or API keys.
    - **GMU Branded Responsive Emails**: Styled with official GMU emerald and gold headers, mobile-friendly layouts, and dynamic merge tags.

- **🛡️ Permanent Fix for Google Drive Blocking**:
  - Detailed turnkey instructions and code to deploy Google Apps Script as an open Web App (`Execute as: Me`, `Who has access: Anyone`), bypassing Google Drive login prompts and permission blocks completely.

---

## 🚀 Quick Deployment Guide

### Option 1: Deploy to GitHub Pages (Recommended - 2 Minutes)

1. **Fork or push this repository** to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of GMU MASE Judging Platform"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - In your GitHub repository, click **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, select **GitHub Actions**.
   - Push to `main` or trigger the workflow manually under **Actions** > **Deploy GMU MASE to GitHub Pages** > **Run workflow**.

3. **Your app is LIVE!**:
   - GitHub Actions will build and deploy the app to:
     `https://<your-username>.github.io/<repo-name>/`
   - Notice: The app is preconfigured with `base: './'` in `vite.config.ts`, so assets load cleanly on any subpath without 404 errors!

---

### Option 2: Deploy to Vercel, Netlify, or Cloudflare Pages

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: `20.x` or higher

---

## 📊 Google Sheet Database Setup (1-Click Auto-Setup)

The project includes an automatic database setup script in `/google-sheets-template/GoogleSheet_AutoSetup_Script.js`.

### How to set it up:
1. Create a blank Google Sheet at [https://sheets.new](https://sheets.new).
2. Go to **Extensions** > **Apps Script**.
3. Replace the contents of `Code.gs` with `/google-sheets-template/GoogleSheet_AutoSetup_Script.js`.
4. In the function dropdown, select **`autoSetupDatabase`** and click **Run**.
5. Grant permissions when prompted.
6. **Done!** All 10 sheets with headers, GMU branding, and UAE sample data will be instantly created:
   - `Settings`
   - `Schools`
   - `Categories`
   - `Participants`
   - `Tables`
   - `TableAssignments`
   - `Judges`
   - `JudgeAuth`
   - `Evaluations`
   - `AuditLog`

### Setting up the Web App REST API (`Code.gs`):
1. In the Apps Script editor, copy the contents of `/google-sheets-template/Code.gs` into `Code.gs`.
2. Click **Deploy** > **New deployment**.
3. Select type: **Web app**.
4. Set **Execute as**: **`Me (your email)`** *(Important: Prevents Drive blocks)*.
5. Set **Who has access**: **`Anyone`** *(Important: Allows judges to evaluate without Google sign-in)*.
6. Click **Deploy** and copy your Web App URL.
7. Paste this URL in the web app under **Admin Console** > **Settings** or use it for live syncing!

---

## 💻 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/gmu-mase-judging.git
cd gmu-mase-judging

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# The app opens at http://localhost:3000

# 4. Run typecheck & build
npm run lint
npm run build

# 5. Preview the production build locally
npm run preview
```

---

## 🔑 Default Credentials & Access Codes

### Admin Console Access:
- **Default Password**: `admin123` (or `admin1`)
- Gives full access to table assignments, participant rosters, reports, and system settings.

### Faculty Live Dashboard:
- **Default Password**: `mase2026` (open viewing mode also available).

### Pre-Configured Demo Judges:
| Judge Name | Title & Institution | Assigned Categories | Access Code |
|---|---|---|---|
| **Dr. Sarah Mansour, MD, PhD** | Assoc. Professor, Gulf Medical University | Scientific Research, Biomedical Innovation | `GMU-7821` |
| **Dr. Ahmed Al-Falasi, MBBS** | Consultant, Thumbay University Hospital | AI & Digital Health, Biomedical Innovation | `GMU-4912` |
| **Prof. Maria Fernandez, DSc** | Chair, Pharmacology, GMU | Scientific Research, Senior Posters | `GMU-9033` |
| **Dr. Khalid Al-Zaabi, PhD** | Bioengineering, Ajman University | AI & Digital Health, Junior Posters | `GMU-3158` |
| **Dr. Fatima Al-Qasimi, MD** | Research Fellow, Al Qassimi Hospital | Scientific Research, Senior Posters | `GMU-6274` |

---

## 📁 Repository Structure

```text
├── .github/
│   └── workflows/
│       ├── deploy.yml                   # Automated GitHub Pages deploy workflow
│       └── ci.yml                       # Continuous Integration lint & build check
├── google-sheets-template/
│   ├── DEPLOYMENT_GUIDE.md             # In-depth Google Sheet & Apps Script guide
│   ├── GoogleSheet_AutoSetup_Script.js # 1-Click spreadsheet generator
│   ├── Code.gs                         # Production REST API for Google Apps Script
│   ├── appsscript.json                 # Apps Script manifest configuration
│   └── sample-data/
│       ├── participants.csv            # UAE student project roster
│       ├── schools.csv                 # UAE participating schools
│       └── judges.csv                  # Judges roster with access codes
├── src/
│   ├── components/
│   │   ├── AdminConsole/               # Admin management, PDF generator & guides
│   │   ├── JudgePortal/                # Secure scoring, rubric & table reassign
│   │   ├── LiveDashboard/              # Real-time rankings & Regional analytics
│   │   ├── Navbar.tsx                  # Header with status pulse & role switcher
│   │   └── AuthModal.tsx               # Secure role gateway
│   ├── data/
│   │   └── initialData.ts              # Authentic GMU MASE dataset
│   ├── services/
│   │   ├── rankingEngine.ts            # Scoring formulas & tie-break logic
│   │   └── storageService.ts           # Reactive state & persistence engine
│   ├── types/
│   │   └── index.ts                    # TypeScript models & enums
│   ├── App.tsx                         # Main app router & layout
│   └── index.css                       # Tailwind CSS 4 styling
├── index.html                          # Entry point with SEO metadata
├── package.json                        # Dependencies and npm scripts
├── tsconfig.json                       # TypeScript compiler options
└── vite.config.ts                      # Vite build configuration (base: './')
```

---

## 🏛️ About Gulf Medical University MASE

The **Medical and Science Exhibition (MASE)** is the premier annual scientific event hosted by Gulf Medical University in Ajman, UAE, bringing together hundreds of schools from across the Emirates to showcase innovative healthcare solutions, biomedical inventions, and medical research.

---

## 📄 License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.
