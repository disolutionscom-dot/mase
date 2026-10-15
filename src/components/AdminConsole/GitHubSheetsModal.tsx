import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Terminal,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

interface GitHubSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSheetsModal: React.FC<GitHubSheetsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'autoSetup' | 'apiCode' | 'sampleCsv'>('deploy');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const gitDeployScript = `# Step 1: Initialize Git and add files
git init
git add .
git commit -m "Deploy Gulf Medical University MASE Platform"

# Step 2: Connect to your GitHub repository
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/gmu-mase-judging.git
git push -u origin main

# Step 3: Enable GitHub Pages in your repo settings:
# Settings -> Pages -> Build and deployment Source: "GitHub Actions"
# The workflow .github/workflows/deploy.yml will automatically build and publish!`;

  const downloadSampleFile = (filename: string, content: string, mime: string = 'text/csv') => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sampleParticipantsCsv = `ParticipantID,RegNo,SchoolID,SchoolName,Title,Description,Category,Subcategory,ParticipantType,EntryType,LeadName,TeamMembers,StudentId,Grade,Contact,Email,Supervisor,SupervisorContact,TableID,TableName,RegStatus,ProjectStatus,Emirate
PRT-001,REG-2026-001,SCH-0001,GEMS Modern Academy,Nanoparticle-Enhanced Drug Delivery for Targeted Cancer Therapy,Investigating functionalized lipid nanoparticles for selective doxorubicin release in triple-negative breast cancer models.,Scientific Research,Oncology & Nanomedicine,Project,Live Booth,Zayd Al-Maktoum,"Ayaansh Verma, Sarah Chen",STU-9801,Grade 12,+971 50 123 4567,zayd.m@gemsmodern.edu,Dr. Rajan Pillai,+971 50 999 1111,TBL-001,A01,Confirmed,Present,Dubai
PRT-002,REG-2026-002,SCH-0002,Al Noor International School,Eco-Friendly Antimicrobial Hydrogel from UAE Marine Algae,Synthesizing bio-degradable wound dressings utilizing Sargassum extracts harvested along the Sharjah coastline.,Scientific Research,Marine Biotechnology,Project,Live Booth,Mariam Al-Nuaimi,"Fatima Al-Zahra, Huda Bilal",STU-9802,Grade 11,+971 55 234 5678,mariam.n@alnoor.sch.ae,Mrs. Samia Qureshi,+971 55 888 2222,TBL-002,A02,Confirmed,Present,Sharjah
PRT-003,REG-2026-003,SCH-0003,Dubai College,Deep-Learning Detection of Diabetic Retinopathy from Low-Cost Smartphone Fundus Scans,Mobile computer vision platform screening retinal microaneurysms for community clinics in rural settings.,AI & Digital Health,Computer Vision & Telehealth,Project,Live Booth,Alexander Wright,Kian Patel,STU-9803,Grade 12,+971 52 345 6789,a.wright@dubaicollege.org,Mr. Simon Taylor,+971 52 777 3333,TBL-007,C01,Confirmed,Present,Dubai
PRT-004,REG-2026-004,SCH-0004,Ajman Academy,Smart Bionic Hand Prosthesis with Haptic Tactile Feedback,Myoelectric upper-limb exoskeleton printed from lightweight recycled filament with fingertip pressure sensors.,Healthcare & Biomedical Innovation,Prosthetics & Assistive Tech,Project,Live Booth,Sultan Al-Shamsi,Hamad Al-Kaabi,STU-9804,Grade 11,+971 56 456 7890,sultan.s@ajmanacademy.sch.ae,Eng. Omar Mansour,+971 56 666 4444,TBL-004,B01,Confirmed,Present,Ajman
PRT-005,REG-2026-005,SCH-0005,Emirates National Schools,Solar-Powered Microfluidic Blood Typing Cartridge,Point-of-care microfluidic paper chip for emergency blood agglutination analysis during ambulance transit.,Healthcare & Biomedical Innovation,Diagnostics & Microfluidics,Project,Live Booth,Reem Al-Husseini,Meera Al-Dhaheri,STU-9805,Grade 12,+971 50 567 8901,reem.h@ens.sch.ae,Dr. Mona Al-Shehhi,+971 50 555 5555,TBL-005,B02,Confirmed,Present,Abu Dhabi
PRT-006,REG-2026-006,SCH-0006,Our Own English High School,Early Predictive Modeling of Cardiovascular Risk in UAE Adolescents Using Wearable Biometrics,Correlation of heart rate variability sleep patterns and lipid markers in coastal communities.,Poster Presentation (Senior),Cardiology & Epidemiology,Poster,Display Board,Nikhil Menon,Rahul Nambiar,STU-9806,Grade 12,+971 54 678 9012,nikhil.m@gems.sch.ae,Mr. Sanjeev Kumar,+971 54 444 6666,TBL-009,D01,Confirmed,Present,Fujairah
PRT-007,REG-2026-007,SCH-0007,Ras Al Khaimah Academy,Real-time Tremor Suppression Sleeve for Parkinsonian Patients,Soft robotic actuator utilizing pneumatic muscle fibers to dampen resting tremors in elderly patients.,Healthcare & Biomedical Innovation,Neurology & Robotics,Project,Live Booth,Leila Al-Zaabi,Tariq Al-Ali,STU-9807,Grade 11,+971 58 789 0123,leila.z@raka.sch.ae,Dr. Kevin Brown,+971 58 333 7777,TBL-006,B03,Confirmed,Present,Ras Al Khaimah
PRT-008,REG-2026-008,SCH-0008,The International School of Choueifat,Microplastic Biosensors Using Engineered Bioluminescent Algae,Rapid water contamination detection for UAE municipal desalination intake ports.,Scientific Research,Environmental Toxicology,Project,Live Booth,Youssef El-Khoury,Jad Kassam,STU-9808,Grade 10,+971 55 890 1234,youssef.k@iscuaw.sabis.net,Ms. Maya Sleiman,+971 55 222 8888,TBL-003,A03,Confirmed,Present,Umm Al Quwain`;

  const sampleSchoolsCsv = `SchoolID,Name,Code,Type,RepName,RepContact,RepEmail,Address,Emirate,Status
SCH-0001,GEMS Modern Academy,GMA-DXB,Private CBSE/IB,Dr. Anita Roy,+971 4 326 3339,a.roy@gemsmodern.edu,Nad Al Sheba,Dubai,Active
SCH-0002,Al Noor International School,ANIS-SHJ,Private British,Mr. Tariq Mansoor,+971 6 534 8888,t.mansoor@alnoor.sch.ae,Al Qarayen,Sharjah,Active
SCH-0003,Dubai College,DC-DXB,British Curriculum,Ms. Claire Jenkins,+971 4 399 9111,c.jenkins@dubaicollege.org,Al Sufouh,Dubai,Active
SCH-0004,Ajman Academy,AA-AJM,IB World School,Dr. Sameer Al-Hashimi,+971 6 731 4444,s.hashimi@ajmanacademy.sch.ae,Sheikh Ammar St,Ajman,Active
SCH-0005,Emirates National Schools,ENS-AUH,National / American,Fatima Al Mansoori,+971 2 499 3000,f.mansoori@ens.sch.ae,MBZ City,Abu Dhabi,Active
SCH-0006,Our Own English High School,OOEHS-FUJ,CBSE,George Philip,+971 9 222 8855,g.philip@gems.sch.ae,Al Faseel,Fujairah,Active
SCH-0007,Ras Al Khaimah Academy,RAKA-RAK,British / IB,David Evans,+971 7 236 2441,d.evans@raka.sch.ae,Khuzam,Ras Al Khaimah,Active
SCH-0008,The International School of Choueifat,ISC-UAQ,SABIS,Lina Haddad,+971 6 766 5888,lhaddad@iscuaw.sabis.net,Al Salamah,Umm Al Quwain,Active`;

  const sampleJudgesCsv = `JudgeID,Name,Title,Institution,Email,Contact,Categories,AccessCode,Status,Role
JDG-0001,"Dr. Sarah Mansour, MD, PhD",Associate Professor of Biomedical Sciences,Gulf Medical University,dr.sarah.mansour@gmu.ac.ae,+971 6 743 1333,"Scientific Research, Healthcare & Biomedical Innovation",GMU-7821,Active,Senior Judge
JDG-0002,"Dr. Ahmed Al-Falasi, MBBS",Consultant Ophthalmologist & Clinical Researcher,Thumbay University Hospital,dr.ahmed.falasi@thumbay.com,+971 6 770 5555,"AI & Digital Health, Healthcare & Biomedical Innovation",GMU-4912,Active,Judge
JDG-0003,"Prof. Maria Fernandez, DSc",Chair of Pharmacology & Drug Discovery,Gulf Medical University,prof.maria@gmu.ac.ae,+971 6 743 1444,"Scientific Research, Poster Presentation (Senior)",GMU-9033,Active,Chief Judge
JDG-0004,"Dr. Khalid Al-Zaabi, PhD",Head of Health Informatics & Bioengineering,Ajman University,k.alzaabi@ajman.ac.ae,+971 6 748 2222,"AI & Digital Health, Poster Presentation (Junior)",GMU-3158,Active,Judge
JDG-0005,"Dr. Fatima Al-Qasimi, MD",Consultant Pediatrician & Research Fellow,Al Qassimi Hospital Sharjah,f.qasimi@mohap.gov.ae,+971 6 538 8888,"Scientific Research, Poster Presentation (Senior)",GMU-6274,Active,Judge`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#E2E8E4] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-[#0B6E4F] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">GitHub & Google Sheets Deployment Bundle</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                  v2026.1
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Complete deployment scripts, 1-click Google Sheet auto-setup, and sample datasets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E2E8E4] bg-[#F8FAF9] px-6 gap-2 pt-3 flex-shrink-0 overflow-x-auto">
          {[
            { id: 'deploy', label: '1. GitHub Pages Deploy', icon: GitBranch },
            { id: 'autoSetup', label: '2. Google Sheet 1-Click Auto-Setup', icon: Sparkles },
            { id: 'apiCode', label: '3. Apps Script REST Web App', icon: Code2 },
            { id: 'sampleCsv', label: '4. Download Sample CSVs', icon: Download },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-[#0B6E4F] text-[#0B6E4F] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: GITHUB PAGES DEPLOY */}
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div className="flex items-center gap-2 font-black text-sm mb-1 text-[#0B6E4F]">
                  <ShieldCheck className="w-5 h-5" />
                  GitHub Repository Ready with Built-in Actions Workflow
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Your project repository is already configured with <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono text-[11px]">.github/workflows/deploy.yml</code> and relative asset linking (<code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono text-[11px]">base: './'</code>), so it deploys seamlessly to GitHub Pages without white screens or 404 assets.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-[#0B6E4F]" />
                  Git Push Commands (Copy & Run in Terminal)
                </h4>
                <div className="relative">
                  <pre className="p-4 rounded-2xl bg-gray-900 text-gray-100 font-mono text-xs overflow-x-auto leading-relaxed">
                    {gitDeployScript}
                  </pre>
                  <button
                    onClick={() => handleCopy(gitDeployScript, 'gitDeploy')}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1.5 transition"
                  >
                    {copiedKey === 'gitDeploy' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Commands</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <h5 className="font-bold text-gray-800">Key GitHub Settings to Verify:</h5>
                <ol className="list-decimal list-inside space-y-1.5 text-gray-600 pl-1">
                  <li>In your GitHub repo, go to <strong>Settings</strong> &gt; <strong>Pages</strong>.</li>
                  <li>Under <strong>Build and deployment &gt; Source</strong>, choose <strong>GitHub Actions</strong>.</li>
                  <li>Pushing code to the <code className="font-mono bg-gray-200 px-1 rounded">main</code> branch will automatically trigger the build and launch the site at <code className="font-mono text-[#0B6E4F]">https://&lt;username&gt;.github.io/&lt;repo-name&gt;/</code>.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: 1-CLICK GOOGLE SHEET AUTO-SETUP */}
          {activeTab === 'autoSetup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                <div className="flex items-center gap-2 font-black text-sm mb-1 text-blue-900">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  1-Click Auto-Setup Creates All 10 Database Sheets in 5 Seconds
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Open a new spreadsheet at <a href="https://sheets.new" target="_blank" rel="noreferrer" className="underline font-bold text-blue-950 inline-flex items-center gap-1">sheets.new <ExternalLink className="w-3 h-3" /></a>, go to <strong>Extensions &gt; Apps Script</strong>, paste the script below, and click <strong>Run &gt; autoSetupDatabase</strong>!
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-700">File: google-sheets-template/GoogleSheet_AutoSetup_Script.js</span>
                <button
                  onClick={() => handleCopy(`// See full file in google-sheets-template/GoogleSheet_AutoSetup_Script.js`, 'fullSetupScript')}
                  className="px-3 py-1.5 rounded-lg bg-[#0B6E4F] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#08523b] transition"
                >
                  {copiedKey === 'fullSetupScript' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Script</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { name: 'Settings', desc: 'Formulas & Passwords' },
                  { name: 'Schools', desc: 'UAE 7 Emirates' },
                  { name: 'Categories', desc: 'Biomedical & Posters' },
                  { name: 'Participants', desc: 'Booths & Projects' },
                  { name: 'Tables', desc: 'North & South Wings' },
                  { name: 'TableAssignments', desc: 'Swap Audit Log' },
                  { name: 'Judges', desc: 'Faculty Roster' },
                  { name: 'JudgeAuth', desc: 'Access Codes' },
                  { name: 'Evaluations', desc: 'C1-C4 Scores' },
                  { name: 'AuditLog', desc: 'Real-time Trail' },
                ].map((s) => (
                  <div key={s.name} className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <div className="font-black text-[#0B6E4F] text-[11px] truncate">{s.name}</div>
                    <div className="text-[10px] text-gray-500 truncate">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REST WEB APP CODE */}
          {activeTab === 'apiCode' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950">
                <div className="flex items-center gap-2 font-black text-sm mb-1 text-amber-900">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  Permanent Drive Bypass Solution
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  When deploying the Web App, choose <strong>Execute as: Me</strong> and <strong>Who has access: Anyone</strong>. This prevents Google Drive from asking judges for Google account log-in or throwing "Access Denied" errors!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <h5 className="font-bold text-gray-800">Supported REST API Actions:</h5>
                <div className="font-mono text-[11px] space-y-1 text-gray-700">
                  <div>GET ?action=getRankings &rarr; Returns real-time Top 10 & all scores</div>
                  <div>GET ?action=getRegionalStats &rarr; Top projects by UAE Emirate</div>
                  <div>GET ?action=getJudgeActivity &rarr; Evaluation count per judge</div>
                  <div>POST action: "submitEvaluation" &rarr; Inserts evaluation & audit record</div>
                  <div>POST action: "reassignTable" &rarr; Updates participant booth allocation</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOWNLOAD SAMPLE CSVS */}
          {activeTab === 'sampleCsv' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Download pre-formatted GMU MASE sample CSV datasets with student participants from all 7 Emirates, participating UAE schools, and authenticated faculty judges:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#0B6E4F] transition flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-gray-900 text-sm mb-1">Participants Dataset</div>
                    <p className="text-[11px] text-gray-500 mb-3">10 projects across UAE Emirates with table allocations, categories, and supervisors.</p>
                  </div>
                  <button
                    onClick={() => downloadSampleFile('gmu_mase_participants.csv', sampleParticipantsCsv)}
                    className="w-full py-2 px-3 rounded-xl bg-[#0B6E4F] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#08523b] transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#0B6E4F] transition flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-gray-900 text-sm mb-1">Schools Dataset</div>
                    <p className="text-[11px] text-gray-500 mb-3">8 UAE schools registered across Dubai, Abu Dhabi, Sharjah, Ajman, RAK, and Fujairah.</p>
                  </div>
                  <button
                    onClick={() => downloadSampleFile('gmu_mase_schools.csv', sampleSchoolsCsv)}
                    className="w-full py-2 px-3 rounded-xl bg-[#0B6E4F] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#08523b] transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-[#0B6E4F] transition flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-gray-900 text-sm mb-1">Judges Dataset</div>
                    <p className="text-[11px] text-gray-500 mb-3">Faculty judges with institutional affiliations and 8-character access codes.</p>
                  </div>
                  <button
                    onClick={() => downloadSampleFile('gmu_mase_judges.csv', sampleJudgesCsv)}
                    className="w-full py-2 px-3 rounded-xl bg-[#0B6E4F] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#08523b] transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-[#E2E8E4] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span>All template files are stored in</span>
            <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono text-gray-800">/google-sheets-template/</code>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition"
          >
            Close Bundle
          </button>
        </div>
      </div>
    </div>
  );
};
