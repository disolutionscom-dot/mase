/**
 * GULF MEDICAL UNIVERSITY - MASE EXHIBITION 2026
 * 1-CLICK GOOGLE SHEET DATABASE AUTO-INITIALIZER
 * 
 * =========================================================================
 * HOW TO USE (Takes under 30 seconds):
 * 1. Create a blank Google Sheet at https://sheets.new
 * 2. In the menu, click Extensions > Apps Script
 * 3. Delete any code in Code.gs, replace with this entire file
 * 4. In the function dropdown, select "autoSetupDatabase" and click "Run"
 * 5. Review permissions (click Advanced -> Go to Untitled project (unsafe))
 * 6. Within 5 seconds, all 10 relational tabs, colored headers, freeze rows,
 *    data validation, and authentic GMU MASE sample data will be generated!
 * =========================================================================
 */

var SCHEMA = {
  Settings:            ['Key','Value','Description'],
  Schools:             ['SchoolID','Name','Code','Type','RepName','RepContact','RepEmail','Address','Status','Notes','CreatedAt','UpdatedAt','Emirate'],
  Categories:          ['CategoryID','Name','Code','Description','ParentCategory','Status','RubricVersion','MaxScore','JudgesRequired','MultiJudge','RankingScope','SchoolRanking','Prize','TieBreak','OpenAt','CloseAt'],
  Participants:        ['ParticipantID','RegNo','SchoolID','SchoolName','Title','Description','Category','Subcategory','ParticipantType','EntryType','LeadName','TeamMembers','StudentId','Grade','Contact','Email','Supervisor','SupervisorContact','TableID','TableName','RegStatus','ProjectStatus','Notes','CreatedAt','UpdatedAt','Emirate'],
  Tables:              ['TableID','TableName','Location','Floor','Status','Notes','UpdatedAt'],
  TableAssignments:    ['AssignmentID','TableID','TableName','ParticipantID','SchoolName','Category','Active','PrevTableID','User','Timestamp','Reason'],
  Judges:              ['JudgeID','Name','Title','Institution','Email','Contact','Categories','Status','Role','Notes'],
  JudgeAuth:           ['JudgeID','AccessCode','CodeIssuedAt','LastLoginAt'],
  Evaluations:         ['EvaluationID','ParticipantID','SchoolID','CategoryID','TableID','JudgeID','JudgeName','RubricID','RubricVersion','C1','C2','C3','C4','TimePenalty','Total','MaxTotal','Percentage','Comments','Status','CreatedAt','SubmittedAt','UpdatedAt','CorrectionReason'],
  EvaluationResponses: ['EvaluationID','CriterionID','CriterionName','BandLabel','Points'],
  AuditLog:            ['Timestamp','User','Action','Entity','RefID','Details'],
  EmailLogs:           ['LogID','Timestamp','RecipientEmail','RecipientName','RecipientRole','CampaignType','Subject','Status','Details','TriggeredBy']
};

function autoSetupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Create and style each sheet
  Object.keys(SCHEMA).forEach(function(name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    var headers = SCHEMA[name];
    sh.clear();
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // GMU Emerald Green Header styling
    sh.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setFontFamily('Arial')
      .setFontSize(10)
      .setBackground('#0B6E4F')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
      
    sh.setFrozenRows(1);
    sh.setRowHeight(1, 32);
  });
  
  // 2. Populate Settings
  var settingsSh = ss.getSheetByName('Settings');
  var settingsData = [
    ['ExhibitionName', 'Gulf Medical University MASE Exhibition 2026', 'Official title of exhibition'],
    ['ScoringAggregation', 'average', 'Options: average | trimmedMean | weighted'],
    ['OverallRankMethod', 'percentage', 'Score standard: percentage | rawScore'],
    ['SchoolRankingMethod', 'avgEligible', 'How school trophies are ranked: avgEligible | top3Sum | totalScore'],
    ['RankingsPublished', 'true', 'Whether faculty & audience see live rankings'],
    ['ResultsFinal', 'false', 'Lock all scores when jury signs off'],
    ['AllowJudgeCorrect', 'true', 'Allows judges to revise scores before deadline'],
    ['AllowJudgeReassign', 'true', 'Allows judges to fix participant table swaps'],
    ['MinEvaluationsRequired', '1', 'Evaluations required to be ranking-eligible'],
    ['AdminPasswordHash', 'admin123', 'Password for Admin Console access'],
    ['DashboardPasswordHash', 'mase2026', 'Password for faculty dashboard access']
  ];
  settingsSh.getRange(2, 1, settingsData.length, settingsData[0].length).setValues(settingsData);
  
  // 3. Populate Schools across UAE Emirates
  var schoolsSh = ss.getSheetByName('Schools');
  var schoolsData = [
    ['SCH-0001','GEMS Modern Academy','GMA-DXB','Private CBSE/IB','Dr. Anita Roy','+971 4 326 3339','a.roy@gemsmodern.edu','Nad Al Sheba, Dubai','Active','','2026-09-01T08:00:00Z','','Dubai'],
    ['SCH-0002','Al Noor International School','ANIS-SHJ','Private British','Mr. Tariq Mansoor','+971 6 534 8888','t.mansoor@alnoor.sch.ae','Al Qarayen, Sharjah','Active','','2026-09-01T08:30:00Z','','Sharjah'],
    ['SCH-0003','Dubai College','DC-DXB','British Curriculum','Ms. Claire Jenkins','+971 4 399 9111','c.jenkins@dubaicollege.org','Al Sufouh, Dubai','Active','','2026-09-02T09:00:00Z','','Dubai'],
    ['SCH-0004','Ajman Academy','AA-AJM','IB World School','Dr. Sameer Al-Hashimi','+971 6 731 4444','s.hashimi@ajmanacademy.sch.ae','Sheikh Ammar St, Ajman','Active','','2026-09-02T10:00:00Z','','Ajman'],
    ['SCH-0005','Emirates National Schools','ENS-AUH','National / American','Fatima Al Mansoori','+971 2 499 3000','f.mansoori@ens.sch.ae','MBZ City, Abu Dhabi','Active','','2026-09-03T11:00:00Z','','Abu Dhabi'],
    ['SCH-0006','Our Own English High School','OOEHS-FUJ','CBSE','George Philip','+971 9 222 8855','g.philip@gems.sch.ae','Al Faseel, Fujairah','Active','','2026-09-03T12:00:00Z','','Fujairah'],
    ['SCH-0007','Ras Al Khaimah Academy','RAKA-RAK','British / IB','David Evans','+971 7 236 2441','d.evans@raka.sch.ae','Khuzam, RAK','Active','','2026-09-04T08:00:00Z','','Ras Al Khaimah'],
    ['SCH-0008','The International School of Choueifat','ISC-UAQ','SABIS','Lina Haddad','+971 6 766 5888','lhaddad@iscuaw.sabis.net','Al Salamah, Umm Al Quwain','Active','','2026-09-04T09:00:00Z','','Umm Al Quwain']
  ];
  schoolsSh.getRange(2, 1, schoolsData.length, schoolsData[0].length).setValues(schoolsData);

  // 4. Populate Categories
  var catSh = ss.getSheetByName('Categories');
  var catData = [
    ['CAT-0001','Scientific Research','SCI-RES','Hypothesis-driven scientific investigations','','Active',1,40,1,'true','both','true','Gold Trophy + Scholarship','Creativity score','',''],
    ['CAT-0002','Healthcare & Biomedical Innovation','HLT-BIO','Biomedical devices and assistive prototypes','','Active',1,40,1,'true','both','true','Gold Trophy + Scholarship','Knowledge score','',''],
    ['CAT-0003','AI & Digital Health','AI-HLT','Machine learning, medical telemetry and robotics','','Active',1,40,1,'true','both','true','Gold Trophy + Scholarship','Presentation score','',''],
    ['CAT-0004','Poster Presentation (Senior)','PST-SNR','Senior high school clinical case posters','','Active',1,40,1,'true','both','true','First Place Plaque','Presentation score','',''],
    ['CAT-0005','Poster Presentation (Junior)','PST-JNR','Junior scientific discovery posters','','Active',1,40,1,'true','category','true','First Place Plaque','Theme score','','']
  ];
  catSh.getRange(2, 1, catData.length, catData[0].length).setValues(catData);

  // 5. Populate Tables
  var tableSh = ss.getSheetByName('Tables');
  var tableData = [
    ['TBL-001','A01','Main Exhibition Hall - North Wing','Ground Floor','Assigned','Scientific Research zone','2026-10-14T08:00:00Z'],
    ['TBL-002','A02','Main Exhibition Hall - North Wing','Ground Floor','Assigned','Scientific Research zone','2026-10-14T08:00:00Z'],
    ['TBL-003','A03','Main Exhibition Hall - North Wing','Ground Floor','Assigned','Scientific Research zone','2026-10-14T08:00:00Z'],
    ['TBL-004','B01','Biomedical Innovation Quad','Ground Floor','Assigned','Power supply equipped','2026-10-14T08:00:00Z'],
    ['TBL-005','B02','Biomedical Innovation Quad','Ground Floor','Assigned','Power supply equipped','2026-10-14T08:00:00Z'],
    ['TBL-006','B03','Biomedical Innovation Quad','Ground Floor','Assigned','Power supply equipped','2026-10-14T08:00:00Z'],
    ['TBL-007','C01','Digital Health Lab Hall','First Floor','Assigned','Screen & WiFi booth','2026-10-14T08:00:00Z'],
    ['TBL-008','C02','Digital Health Lab Hall','First Floor','Assigned','Screen & WiFi booth','2026-10-14T08:00:00Z'],
    ['TBL-009','D01','Poster Gallery Concourse','Ground Floor','Assigned','Double easel board','2026-10-14T08:00:00Z'],
    ['TBL-010','D02','Poster Gallery Concourse','Ground Floor','Assigned','Double easel board','2026-10-14T08:00:00Z']
  ];
  tableSh.getRange(2, 1, tableData.length, tableData[0].length).setValues(tableData);

  // 6. Populate Participants across UAE Emirates
  var partSh = ss.getSheetByName('Participants');
  var partData = [
    ['PRT-001','REG-2026-001','SCH-0001','GEMS Modern Academy','Nanoparticle-Enhanced Drug Delivery for Targeted Cancer Therapy','Investigating functionalized lipid nanoparticles for selective doxorubicin release in triple-negative breast cancer models.','Scientific Research','Oncology & Nanomedicine','Project','Live Booth','Zayd Al-Maktoum','Ayaansh Verma, Sarah Chen','STU-9801','Grade 12','+971 50 123 4567','zayd.m@gemsmodern.edu','Dr. Rajan Pillai','+971 50 999 1111','TBL-001','A01','Confirmed','Present','','2026-10-01T08:00:00Z','','Dubai'],
    ['PRT-002','REG-2026-002','SCH-0002','Al Noor International School','Eco-Friendly Antimicrobial Hydrogel from UAE Marine Algae','Synthesizing bio-degradable wound dressings utilizing Sargassum extracts harvested along the Sharjah coastline.','Scientific Research','Marine Biotechnology','Project','Live Booth','Mariam Al-Nuaimi','Fatima Al-Zahra, Huda Bilal','STU-9802','Grade 11','+971 55 234 5678','mariam.n@alnoor.sch.ae','Mrs. Samia Qureshi','+971 55 888 2222','TBL-002','A02','Confirmed','Present','','2026-10-01T08:30:00Z','','Sharjah'],
    ['PRT-003','REG-2026-003','SCH-0003','Dubai College','Deep-Learning Detection of Diabetic Retinopathy from Low-Cost Smartphone Fundus Scans','Mobile computer vision platform screening retinal microaneurysms for community clinics in rural settings.','AI & Digital Health','Computer Vision & Telehealth','Project','Live Booth','Alexander Wright','Kian Patel','STU-9803','Grade 12','+971 52 345 6789','a.wright@dubaicollege.org','Mr. Simon Taylor','+971 52 777 3333','TBL-007','C01','Confirmed','Present','','2026-10-02T09:00:00Z','','Dubai'],
    ['PRT-004','REG-2026-004','SCH-0004','Ajman Academy','Smart Bionic Hand Prosthesis with Haptic Tactile Feedback','Myoelectric upper-limb exoskeleton printed from lightweight recycled filament with fingertip pressure sensors.','Healthcare & Biomedical Innovation','Prosthetics & Assistive Tech','Project','Live Booth','Sultan Al-Shamsi','Hamad Al-Kaabi','STU-9804','Grade 11','+971 56 456 7890','sultan.s@ajmanacademy.sch.ae','Eng. Omar Mansour','+971 56 666 4444','TBL-004','B01','Confirmed','Present','','2026-10-02T10:00:00Z','','Ajman'],
    ['PRT-005','REG-2026-005','SCH-0005','Emirates National Schools','Solar-Powered Microfluidic Blood Typing Cartridge','Point-of-care microfluidic paper chip for emergency blood agglutination analysis during ambulance transit.','Healthcare & Biomedical Innovation','Diagnostics & Microfluidics','Project','Live Booth','Reem Al-Husseini','Meera Al-Dhaheri','STU-9805','Grade 12','+971 50 567 8901','reem.h@ens.sch.ae','Dr. Mona Al-Shehhi','+971 50 555 5555','TBL-005','B02','Confirmed','Present','','2026-10-03T11:00:00Z','','Abu Dhabi'],
    ['PRT-006','REG-2026-006','SCH-0006','Our Own English High School','Early Predictive Modeling of Cardiovascular Risk in UAE Adolescents Using Wearable Biometrics','Correlation of heart rate variability, sleep patterns, and lipid markers in coastal communities.','Poster Presentation (Senior)','Cardiology & Epidemiology','Poster','Display Board','Nikhil Menon','Rahul Nambiar','STU-9806','Grade 12','+971 54 678 9012','nikhil.m@gems.sch.ae','Mr. Sanjeev Kumar','+971 54 444 6666','TBL-009','D01','Confirmed','Present','','2026-10-03T12:00:00Z','','Fujairah'],
    ['PRT-007','REG-2026-007','SCH-0007','Ras Al Khaimah Academy','Real-time Tremor Suppression Sleeve for Parkinsonian Patients','Soft robotic actuator utilizing pneumatic muscle fibers to dampen resting tremors in elderly patients.','Healthcare & Biomedical Innovation','Neurology & Robotics','Project','Live Booth','Leila Al-Zaabi','Tariq Al-Ali','STU-9807','Grade 11','+971 58 789 0123','leila.z@raka.sch.ae','Dr. Kevin Brown','+971 58 333 7777','TBL-006','B03','Confirmed','Present','','2026-10-04T08:00:00Z','','Ras Al Khaimah'],
    ['PRT-008','REG-2026-008','SCH-0008','The International School of Choueifat','Microplastic Biosensors Using Engineered Bioluminescent Algae','Rapid water contamination detection for UAE municipal desalination intake ports.','Scientific Research','Environmental Toxicology','Project','Live Booth','Youssef El-Khoury','Jad Kassam','STU-9808','Grade 10','+971 55 890 1234','youssef.k@iscuaw.sabis.net','Ms. Maya Sleiman','+971 55 222 8888','TBL-003','A03','Confirmed','Present','','2026-10-04T09:00:00Z','','Umm Al Quwain'],
    ['PRT-009','REG-2026-009','SCH-0001','GEMS Modern Academy','Automated Insulin Titration Assistant via Continuous Glucose Monitor Streams','Edge computing algorithm calculating personalized bolus recommendations based on carbohydrate intake and physical exertion.','AI & Digital Health','Metabolic Endocrinology','Project','Live Booth','Diya Shenoy','Aryan Kapoor','STU-9809','Grade 12','+971 50 901 2345','diya.s@gemsmodern.edu','Dr. Rajan Pillai','+971 50 999 1111','TBL-008','C02','Confirmed','Present','','2026-10-05T09:00:00Z','','Dubai'],
    ['PRT-010','REG-2026-010','SCH-0004','Ajman Academy','Comparative Efficacy of Date Palm Leaf Extracts against Multidrug-Resistant Nosocomial Bacteria','Ethanolic extraction of Phoenix dactylifera bioactive polyphenols tested against MRSA and Pseudomonas isolates.','Poster Presentation (Senior)','Microbiology & Infectious Diseases','Poster','Display Board','Noura Al-Nuaimi','Alia Al-Matrooshi','STU-9810','Grade 11','+971 56 012 3456','noura.n@ajmanacademy.sch.ae','Dr. Sameer Al-Hashimi','+971 56 731 4444','TBL-010','D02','Confirmed','Present','','2026-10-05T10:00:00Z','','Ajman']
  ];
  partSh.getRange(2, 1, partData.length, partData[0].length).setValues(partData);

  // 7. Populate Judges & Credentials
  var judgeSh = ss.getSheetByName('Judges');
  var judgeAuthSh = ss.getSheetByName('JudgeAuth');
  var judgeData = [
    ['JDG-0001','Dr. Sarah Mansour, MD, PhD','Associate Professor of Biomedical Sciences','Gulf Medical University','dr.sarah.mansour@gmu.ac.ae','+971 6 743 1333','Scientific Research, Healthcare & Biomedical Innovation','Active','Senior Judge',''],
    ['JDG-0002','Dr. Ahmed Al-Falasi, MBBS','Consultant Ophthalmologist & Clinical Researcher','Thumbay University Hospital','dr.ahmed.falasi@thumbay.com','+971 6 770 5555','AI & Digital Health, Healthcare & Biomedical Innovation','Active','Judge',''],
    ['JDG-0003','Prof. Maria Fernandez, DSc','Chair of Pharmacology & Drug Discovery','Gulf Medical University','prof.maria@gmu.ac.ae','+971 6 743 1444','Scientific Research, Poster Presentation (Senior)','Active','Chief Judge',''],
    ['JDG-0004','Dr. Khalid Al-Zaabi, PhD','Head of Health Informatics & Bioengineering','Ajman University','k.alzaabi@ajman.ac.ae','+971 6 748 2222','AI & Digital Health, Poster Presentation (Junior)','Active','Judge',''],
    ['JDG-0005','Dr. Fatima Al-Qasimi, MD','Consultant Pediatrician & Research Fellow','Al Qassimi Hospital Sharjah','f.qasimi@mohap.gov.ae','+971 6 538 8888','Scientific Research, Poster Presentation (Senior)','Active','Judge','']
  ];
  var judgeAuthData = [
    ['JDG-0001','GMU-7821','2026-10-01T08:00:00Z','2026-10-14T09:15:00Z'],
    ['JDG-0002','GMU-4912','2026-10-01T08:15:00Z','2026-10-14T09:30:00Z'],
    ['JDG-0003','GMU-9033','2026-10-01T08:30:00Z','2026-10-14T09:45:00Z'],
    ['JDG-0004','GMU-3158','2026-10-01T08:45:00Z','2026-10-14T10:00:00Z'],
    ['JDG-0005','GMU-6274','2026-10-01T09:00:00Z','2026-10-14T10:15:00Z']
  ];
  judgeSh.getRange(2, 1, judgeData.length, judgeData[0].length).setValues(judgeData);
  judgeAuthSh.getRange(2, 1, judgeAuthData.length, judgeAuthData[0].length).setValues(judgeAuthData);

  // 8. Populate Initial Evaluations
  var evalSh = ss.getSheetByName('Evaluations');
  var evalData = [
    ['EVL-0001','PRT-001','SCH-0001','CAT-0001','TBL-001','JDG-0001','Dr. Sarah Mansour, MD, PhD','RUB-MASE-V1',1,9.5,9.0,9.5,9.5,0,37.5,40,93.75,'Exceptional methodology and understanding of targeted nanomedicine kinetics. Highly commendable senior school project.','Submitted','2026-10-14T09:00:00Z','2026-10-14T09:25:00Z','',''],
    ['EVL-0002','PRT-001','SCH-0001','CAT-0001','TBL-001','JDG-0003','Prof. Maria Fernandez, DSc','RUB-MASE-V1',1,9.0,9.5,9.0,9.0,0,36.5,40,91.25,'Clear pharmacological rationale and rigorous control groups. High potential for undergraduate publication.','Submitted','2026-10-14T09:30:00Z','2026-10-14T09:55:00Z','',''],
    ['EVL-0003','PRT-002','SCH-0002','CAT-0001','TBL-002','JDG-0001','Dr. Sarah Mansour, MD, PhD','RUB-MASE-V1',1,8.5,8.5,9.0,9.0,0,35.0,40,87.50,'Brilliant ecological sustainability focus utilizing local UAE marine biomass. Dressing tensile strength testing was impressive.','Submitted','2026-10-14T10:00:00Z','2026-10-14T10:20:00Z','',''],
    ['EVL-0004','PRT-003','SCH-0003','CAT-0003','TBL-007','JDG-0002','Dr. Ahmed Al-Falasi, MBBS','RUB-MASE-V1',1,9.5,9.5,9.5,9.5,0,38.0,40,95.00,'Outstanding validation dataset with 94.2% specificity. Hardware optical adapter was elegantly 3D printed. Superb work.','Submitted','2026-10-14T09:15:00Z','2026-10-14T09:40:00Z','',''],
    ['EVL-0005','PRT-003','SCH-0003','CAT-0003','TBL-007','JDG-0004','Dr. Khalid Al-Zaabi, PhD','RUB-MASE-V1',1,9.0,9.0,9.5,9.0,0,36.5,40,91.25,'Strong grasp of convolutional neural network hyperparameter tuning. Great responses to jury technical inquiries.','Submitted','2026-10-14T09:45:00Z','2026-10-14T10:10:00Z','',''],
    ['EVL-0006','PRT-004','SCH-0004','CAT-0002','TBL-004','JDG-0001','Dr. Sarah Mansour, MD, PhD','RUB-MASE-V1',1,9.0,8.5,9.0,9.5,0,36.0,40,90.00,'Functioning haptic feedback mechanism was demonstrated live with blindfolded grasping test. Outstanding mechanical execution.','Submitted','2026-10-14T10:30:00Z','2026-10-14T10:55:00Z','',''],
    ['EVL-0007','PRT-005','SCH-0005','CAT-0002','TBL-005','JDG-0002','Dr. Ahmed Al-Falasi, MBBS','RUB-MASE-V1',1,8.5,9.0,8.5,8.5,0,34.5,40,86.25,'Innovative passive capillary microfluidics. Practical implementation for remote emergency services in Abu Dhabi.','Submitted','2026-10-14T10:00:00Z','2026-10-14T10:25:00Z','',''],
    ['EVL-0008','PRT-006','SCH-0006','CAT-0004','TBL-009','JDG-0003','Prof. Maria Fernandez, DSc','RUB-MASE-V1',1,8.0,8.5,9.0,8.0,0,33.5,40,83.75,'Solid statistical analysis of teenage cardiovascular markers. Great public health implications for the Northern Emirates.','Submitted','2026-10-14T10:30:00Z','2026-10-14T10:50:00Z','',''],
    ['EVL-0009','PRT-007','SCH-0007','CAT-0002','TBL-006','JDG-0002','Dr. Ahmed Al-Falasi, MBBS','RUB-MASE-V1',1,8.5,8.5,8.5,9.0,0,34.5,40,86.25,'Clever application of soft pneumatic actuators for neurological tremor dampening. Thorough safety considerations.','Submitted','2026-10-14T10:35:00Z','2026-10-14T11:00:00Z','',''],
    ['EVL-0010','PRT-008','SCH-0008','CAT-0001','TBL-003','JDG-0003','Prof. Maria Fernandez, DSc','RUB-MASE-V1',1,8.5,8.0,8.0,8.5,0,33.0,40,82.50,'Creative biosensor design using photosynthetic bioluminescence. Great potential for coastal environmental monitoring.','Submitted','2026-10-14T11:05:00Z','2026-10-14T11:25:00Z','','']
  ];
  evalSh.getRange(2, 1, evalData.length, evalData[0].length).setValues(evalData);

  // 9. Auto-fit column widths
  Object.keys(SCHEMA).forEach(function(name) {
    var sh = ss.getSheetByName(name);
    var colCount = SCHEMA[name].length;
    for (var c = 1; c <= Math.min(colCount, 12); c++) {
      sh.autoResizeColumn(c);
    }
  });

  // Clean empty default sheet if exists
  var junk = ss.getSheetByName('Sheet1');
  if (junk && ss.getSheets().length > 1) {
    try { ss.deleteSheet(junk); } catch(e) {}
  }
  
  SpreadsheetApp.flush();
  Logger.log('GMU MASE Database auto-initialized successfully with 10 tables!');
}
