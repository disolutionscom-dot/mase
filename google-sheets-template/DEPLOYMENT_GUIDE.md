# Gulf Medical University MASE 2026 - Google Sheets Backend Setup

This guide shows you how to initialize the Google Sheet database and deploy it as a high-speed Web App REST API.

---

## ⚡ Step 1: 1-Click Google Sheet Database Setup (30 Seconds)

1. Open your browser and navigate to [https://sheets.new](https://sheets.new) to create a blank Google Sheet.
2. Rename the spreadsheet to **`GMU MASE 2026 Database`**.
3. In the top navigation menu, click **Extensions** > **Apps Script**.
4. In the Apps Script code editor, delete any default code inside `Code.gs`.
5. Open `google-sheets-template/GoogleSheet_AutoSetup_Script.js` from this project, copy its entire contents, and paste it into the editor.
6. In the function dropdown menu at the top toolbar, ensure **`autoSetupDatabase`** is selected.
7. Click **Run** (the ▶ button).
8. Google will request authorization permissions:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** > **Go to Untitled project (unsafe)**
   - Click **Allow**
9. Within 5 seconds, switch back to your Google Sheet:
   - All **10 database tabs** are automatically created!
   - Emerald green GMU header styling is applied with frozen rows.
   - UAE schools, participants from all 7 Emirates, rubric criteria, and sample judges are pre-loaded.

---

## 🚀 Step 2: Deploy as a Web App (Bypasses Google Drive Blocking)

> ### 🛑 WHY GOOGLE DRIVE BLOCKS JUDGES:
> When judges try accessing standard Apps Script links, Google Drive throws *"Access Denied"* or *"Sign in with a Google Account"*, because judges might have personal emails, institutional emails, or no Google account at all.
>
> ### ✅ THE PERMANENT FIX:
> Deploying as a **Web App** with **Execute as: Me** and **Who has access: Anyone**.
> This runs the API using your admin permissions behind the scenes, allowing the web app to query scores and submit evaluations without touching Google Drive login!

### Exact Web App Deployment Steps:
1. In the Apps Script editor, paste the contents of `google-sheets-template/Code.gs` into `Code.gs`.
2. Click the blue **Deploy** button (top right) > select **New deployment**.
3. Click the gear icon next to "Select type" > choose **Web app**.
4. Fill in the deployment details:
   - **Description**: `GMU MASE Live Judging API v1`
   - **Execute as**: **`Me (your_email@gmail.com)`** *(CRITICAL: Do NOT choose "User accessing the web app")*
   - **Who has access**: **`Anyone`** *(CRITICAL: Do NOT choose "Anyone with Google account" or "Only myself")*
5. Click **Deploy**.
6. Copy the **Web App URL** provided (it looks like `https://script.google.com/macros/s/AKfycb.../exec`).
7. Save this URL! You can paste it into the frontend Admin Console Settings or use it as an external sync endpoint.

---

## 📡 API Endpoints Provided by Code.gs

Your Web App automatically supports the following GET & POST actions:

| Method | URL Parameter | Description |
|---|---|---|
| `GET` | `?action=ping` | Healthcheck & server time |
| `GET` | `?action=getRankings` | Returns live calculated Top 10 and all project rankings |
| `GET` | `?action=getRegionalStats` | Returns top performing schools and projects broken down by Emirate |
| `GET` | `?action=getJudgeActivity` | Returns number of evaluations completed per judge |
| `GET` | `?action=verifyJudgeCode&code=GMU-7821` | Authenticates judge access code |
| `GET` | `?action=getEmailQuota` | Returns remaining daily Gmail/MailApp quota |
| `GET` | `?action=getEmailLogs` | Returns recent email dispatch audit logs |
| `POST` | `action: "testEmail"` | Sends verification test email to admin |
| `POST` | `action: "sendJudgeInvite"` | Dispatches official judge credentials and access code |
| `POST` | `action: "sendBatchJudgeInvites"` | Batch sends credentials to all or selected jurors |
| `POST` | `action: "sendResultNotification"` | Delivers final scorecards, percentage, and ceremony notes |
| `POST` | `action: "sendBatchResults"` | Batch dispatches results to winners or all projects |
| `POST` | `action: "sendCustomAnnouncement"` | Broadcasts announcements to Jurors, Schools, or Students |
| `POST` | `action: "submitEvaluation"` | Saves rubric scores and writes audit trail |
| `POST` | `action: "reassignTable"` | Updates project table assignment when booths move |

---

## 📧 Email Integration Architecture (GitHub Static + Apps Script Backend)

This application is engineered specifically for **static deployment on GitHub Pages** paired with **Google Apps Script as a serverless backend**:

1. **Frontend**: Static React single-page app deployed on GitHub Pages with zero server costs and instant CDN delivery.
2. **Backend**: Google Apps Script handles data persistence in Google Sheets and email delivery via `MailApp.sendEmail()`.
3. **No Mailgun / SendGrid required**: Uses your existing Google/Gmail quota (100 free emails/day on consumer Gmail accounts, or 1,500 emails/day on Google Workspace).
4. **Branded GMU HTML Templates**: Automatically formats emails with official GMU emerald and gold styling, responsive mobile layouts, dynamic merge tags, and call-to-action buttons.
5. **Auto-Logging**: Every email sent is automatically logged to the `EmailLogs` sheet with timestamp, recipient, subject, campaign, and delivery status.

---

## 📂 The 11 Relational Sheets Structure

1. **`Settings`**: Exhibition parameters, ranking formulas, password hashes.
2. **`Schools`**: UAE registered schools with Emirate, representative contacts.
3. **`Categories`**: Exhibition categories (Biomedical, AI Health, Research, Posters).
4. **`Participants`**: Student project entries, table allocations, booth status, Emirate.
5. **`Tables`**: Physical floor locations, hall wings, booth power allocation.
6. **`TableAssignments`**: Audit log of participant booth moves and swaps.
7. **`Judges`**: Full roster of academic and clinical faculty judges.
8. **`JudgeAuth`**: 8-character unique alphanumeric access codes and login stamps.
9. **`Evaluations`**: Criteria scores (C1-C4), time penalties, percentages, comments.
10. **`AuditLog`**: Tamper-proof history of every score submitted or table reassigned.
11. **`EmailLogs`**: Complete record of all emails dispatched with delivery status.

