import {
  School,
  Category,
  Table,
  Participant,
  TableAssignment,
  Judge,
  Evaluation,
  SystemSettings,
  AuditLogItem,
  RegistrationRequest,
  Rubric,
  UserRole,
} from '../types';
import {
  MASE_RUBRIC,
  INITIAL_SCHOOLS,
  INITIAL_CATEGORIES,
  INITIAL_TABLES,
  INITIAL_PARTICIPANTS,
  INITIAL_TABLE_ASSIGNMENTS,
  INITIAL_JUDGES,
  INITIAL_EVALUATIONS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { computeRankings, round2 } from './rankingEngine';

const STORAGE_KEY = 'GMU_MASE_PLATFORM_V1';

interface AppState {
  schools: School[];
  categories: Category[];
  tables: Table[];
  participants: Participant[];
  assignments: TableAssignment[];
  judges: Judge[];
  evaluations: Evaluation[];
  settings: SystemSettings;
  rubric: Rubric;
  auditLog: AuditLogItem[];
  registrationRequests: RegistrationRequest[];
}

type Listener = () => void;

class StorageService {
  private state: AppState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        let storedEvals: Evaluation[] = parsed.evaluations || INITIAL_EVALUATIONS;
        if (Array.isArray(storedEvals) && storedEvals.length < INITIAL_EVALUATIONS.length) {
          const existingIds = new Set(storedEvals.map((e) => e.EvaluationID));
          const toAdd = INITIAL_EVALUATIONS.filter((e) => !existingIds.has(e.EvaluationID));
          storedEvals = [...storedEvals, ...toAdd];
        }
        return {
          schools: parsed.schools || INITIAL_SCHOOLS,
          categories: parsed.categories || INITIAL_CATEGORIES,
          tables: parsed.tables || INITIAL_TABLES,
          participants: parsed.participants || INITIAL_PARTICIPANTS,
          assignments: parsed.assignments || INITIAL_TABLE_ASSIGNMENTS,
          judges: parsed.judges || INITIAL_JUDGES,
          evaluations: storedEvals,
          settings: { ...INITIAL_SETTINGS, ...(parsed.settings || {}) },
          rubric: parsed.rubric || MASE_RUBRIC,
          auditLog: parsed.auditLog || [],
          registrationRequests: parsed.registrationRequests || [],
        };
      }
    } catch (e) {
      console.warn('Could not parse stored state, using defaults', e);
    }

    return {
      schools: [...INITIAL_SCHOOLS],
      categories: [...INITIAL_CATEGORIES],
      tables: [...INITIAL_TABLES],
      participants: [...INITIAL_PARTICIPANTS],
      assignments: [...INITIAL_TABLE_ASSIGNMENTS],
      judges: [...INITIAL_JUDGES],
      evaluations: [...INITIAL_EVALUATIONS],
      settings: { ...INITIAL_SETTINGS },
      rubric: MASE_RUBRIC,
      auditLog: [
        {
          id: 'AUD-0001',
          Timestamp: new Date().toISOString(),
          User: 'System',
          Action: 'INIT',
          Entity: 'System',
          RefID: 'SYSTEM',
          Details: 'GMU MASE Exhibition Database Initialized with demo records.',
        },
      ],
      registrationRequests: [],
    };
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    this.notify();
  }

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.error('Error in listener', err);
      }
    });
  }

  public logAudit(user: string, action: string, entity: string, refId: string, details: string): void {
    this.state.auditLog.unshift({
      id: `AUD-${Date.now().toString().slice(-6)}`,
      Timestamp: new Date().toISOString(),
      User: user,
      Action: action,
      Entity: entity,
      RefID: refId,
      Details: details,
    });
    if (this.state.auditLog.length > 500) {
      this.state.auditLog.pop();
    }
  }

  // Getters
  public getState(): AppState {
    return this.state;
  }

  public getSchools(): School[] {
    return this.state.schools;
  }

  public getCategories(): Category[] {
    return this.state.categories;
  }

  public getTables(): Table[] {
    return this.state.tables;
  }

  public getParticipants(): Participant[] {
    return this.state.participants;
  }

  public getJudges(): Judge[] {
    return this.state.judges;
  }

  public getEvaluations(): Evaluation[] {
    return this.state.evaluations;
  }

  public getSettings(): SystemSettings {
    return this.state.settings;
  }

  public getRubric(): Rubric {
    return this.state.rubric;
  }

  public getAuditLog(): AuditLogItem[] {
    return this.state.auditLog;
  }

  public getRegistrationRequests(): RegistrationRequest[] {
    return this.state.registrationRequests;
  }

  public getRankings() {
    return computeRankings(
      this.state.participants,
      this.state.categories,
      this.state.evaluations,
      this.state.schools,
      this.state.settings,
      this.state.rubric
    );
  }

  // Auth
  public loginJudge(code: string): { ok: boolean; judge?: Judge; message?: string } {
    const clean = code.trim().toUpperCase();
    if (!clean) return { ok: false, message: 'Please enter your access code.' };

    const judge = this.state.judges.find(
      (j) => j.AccessCode.trim().toUpperCase() === clean && j.Status !== 'Inactive'
    );

    if (!judge) {
      return { ok: false, message: 'Invalid or inactive access code.' };
    }

    judge.LastLoginAt = new Date().toISOString();
    this.save();
    return { ok: true, judge };
  }

  public loginAdmin(password: string): boolean {
    const expected = this.state.settings.AdminPasswordHash || 'admin123';
    return password.trim() === expected;
  }

  public loginViewer(password: string): boolean {
    const expected = this.state.settings.DashboardPasswordHash || 'mase2026';
    const adminExpected = this.state.settings.AdminPasswordHash || 'admin123';
    return password.trim() === expected || password.trim() === adminExpected;
  }

  // Judge Operations
  public findTable(tableName: string) {
    const key = tableName.trim().toLowerCase();
    if (!key) return null;

    const table = this.state.tables.find(
      (t) => t.TableName.trim().toLowerCase() === key
    );

    if (!table) {
      return { notFound: true, message: `No table named "${tableName}" found.` };
    }

    const assignedParticipant = this.state.participants.find(
      (p) => p.TableName?.trim().toLowerCase() === key && p.ProjectStatus === 'Active'
    );

    if (!assignedParticipant) {
      return {
        vacant: true,
        table,
        message: `Table ${table.TableName} currently has no active project assigned.`,
      };
    }

    return {
      participant: assignedParticipant,
      table,
    };
  }

  public searchProjects(query: string): Participant[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.state.participants.filter((p) => {
      return (
        p.Title.toLowerCase().includes(q) ||
        p.SchoolName.toLowerCase().includes(q) ||
        p.Category.toLowerCase().includes(q) ||
        (p.LeadName && p.LeadName.toLowerCase().includes(q)) ||
        (p.TableName && p.TableName.toLowerCase().includes(q)) ||
        (p.RegNo && p.RegNo.toLowerCase().includes(q))
      );
    });
  }

  public submitEvaluation(payload: {
    participantId: string;
    judgeId: string;
    judgeName: string;
    c1: number;
    c2: number;
    c3: number;
    c4: number;
    overTime: boolean;
    comments?: string;
    correctionOf?: string;
    correctionReason?: string;
  }): { ok: boolean; evaluation?: Evaluation; message?: string } {
    const participant = this.state.participants.find(
      (p) => p.ParticipantID === payload.participantId
    );
    if (!participant) return { ok: false, message: 'Project not found.' };

    const c1 = Number(payload.c1);
    const c2 = Number(payload.c2);
    const c3 = Number(payload.c3);
    const c4 = Number(payload.c4);

    if ([c1, c2, c3, c4].some((s) => isNaN(s) || s < 0 || s > 10)) {
      return { ok: false, message: 'Scores must be numeric and between 0 and 10.' };
    }

    // Check existing evaluation by this judge
    const existing = this.state.evaluations.find(
      (e) =>
        e.ParticipantID === payload.participantId &&
        e.JudgeID === payload.judgeId &&
        e.Status === 'Submitted'
    );

    if (existing && !payload.correctionOf) {
      return {
        ok: false,
        message: `You have already evaluated this project (ref ${existing.EvaluationID}). Use correction mode to revise scores.`,
      };
    }

    if (existing && payload.correctionOf) {
      if (!this.state.settings.AllowJudgeCorrect) {
        return { ok: false, message: 'Evaluations revisions are disabled in competition settings.' };
      }
      existing.Status = 'Corrected';
      existing.UpdatedAt = new Date().toISOString();
      existing.CorrectionReason = payload.correctionReason || 'Score revised by judge';
    }

    const timePenalty = payload.overTime ? 1 : 0;
    const rawTotal = c1 + c2 + c3 + c4;
    const total = round2(Math.max(0, rawTotal - timePenalty));
    const maxTotal = this.state.rubric.maxTotal || 40;
    const percentage = round2((total / maxTotal) * 100);

    const evalId = `EVL-${String(this.state.evaluations.length + 1).padStart(4, '0')}`;
    const newEval: Evaluation = {
      EvaluationID: evalId,
      ParticipantID: participant.ParticipantID,
      SchoolID: participant.SchoolID,
      CategoryID: participant.Category,
      TableID: participant.TableID,
      JudgeID: payload.judgeId,
      JudgeName: payload.judgeName,
      RubricID: this.state.rubric.id,
      RubricVersion: this.state.rubric.version,
      C1: c1,
      C2: c2,
      C3: c3,
      C4: c4,
      TimePenalty: timePenalty,
      Total: total,
      MaxTotal: maxTotal,
      Percentage: percentage,
      Comments: payload.comments || '',
      Status: 'Submitted',
      CreatedAt: new Date().toISOString(),
      SubmittedAt: new Date().toISOString(),
    };

    this.state.evaluations.push(newEval);
    this.logAudit(
      payload.judgeName,
      'SUBMIT_EVAL',
      'Evaluations',
      evalId,
      `Project: ${participant.Title} (${participant.ParticipantID}) - Score: ${total}/${maxTotal}`
    );

    this.save();
    return { ok: true, evaluation: newEval };
  }

  // Table Reassignment
  public reassignTable(
    participantId: string,
    targetTableName: string,
    user: string,
    reason: string = 'Reassigned at table by judge'
  ): { ok: boolean; message?: string; displacedProject?: string } {
    const cleanTable = targetTableName.trim().toUpperCase();
    if (!cleanTable) return { ok: false, message: 'Please provide a table number.' };

    const participant = this.state.participants.find((p) => p.ParticipantID === participantId);
    if (!participant) return { ok: false, message: 'Participant not found.' };

    // Find or create Table
    let table = this.state.tables.find(
      (t) => t.TableName.trim().toUpperCase() === cleanTable
    );

    if (!table) {
      table = {
        TableID: `TBL-${String(this.state.tables.length + 1).padStart(4, '0')}`,
        TableName: cleanTable,
        Location: 'Main Exhibition Floor',
        Status: 'Active',
        Notes: 'Created on the fly during judging',
      };
      this.state.tables.push(table);
    }

    // Check if table currently has another active participant
    let displacedTitle: string | undefined;
    const currentOccupant = this.state.participants.find(
      (p) =>
        p.TableName?.trim().toUpperCase() === cleanTable &&
        p.ParticipantID !== participantId &&
        p.ProjectStatus === 'Active'
    );

    if (currentOccupant) {
      displacedTitle = currentOccupant.Title;
      currentOccupant.TableName = '';
      currentOccupant.TableID = '';
      currentOccupant.UpdatedAt = new Date().toISOString();
    }

    // Mark previous assignment inactive
    this.state.assignments.forEach((a) => {
      if (a.ParticipantID === participantId && a.Active) {
        a.Active = false;
      }
    });

    // Create new assignment record
    const asgId = `ASG-${String(this.state.assignments.length + 1).padStart(4, '0')}`;
    this.state.assignments.push({
      AssignmentID: asgId,
      TableID: table.TableID,
      TableName: table.TableName,
      ParticipantID: participant.ParticipantID,
      SchoolName: participant.SchoolName,
      Category: participant.Category,
      Active: true,
      User: user,
      Timestamp: new Date().toISOString(),
      Reason: reason,
    });

    participant.TableID = table.TableID;
    participant.TableName = table.TableName;
    participant.UpdatedAt = new Date().toISOString();

    this.logAudit(
      user,
      'REASSIGN_TABLE',
      'Participants',
      participant.ParticipantID,
      `Assigned to Table ${table.TableName}${
        displacedTitle ? ` (Displaced: ${displacedTitle})` : ''
      }`
    );

    this.save();
    return { ok: true, displacedProject: displacedTitle };
  }

  // Admin CRUD
  public saveSchool(school: Partial<School>): School {
    const isNew = !school.SchoolID;
    let target: School;

    if (isNew) {
      const id = `SCH-${String(this.state.schools.length + 1).padStart(4, '0')}`;
      target = {
        SchoolID: id,
        Name: school.Name || 'New School',
        Code: school.Code || '',
        Type: school.Type || 'Private',
        RepName: school.RepName || '',
        RepEmail: school.RepEmail || '',
        RepContact: school.RepContact || '',
        Address: school.Address || '',
        Status: school.Status || 'Active',
        Emirate: school.Emirate || 'Dubai',
        CreatedAt: new Date().toISOString(),
      };
      this.state.schools.push(target);
      this.logAudit('Admin', 'CREATE_SCHOOL', 'Schools', target.SchoolID, target.Name);
    } else {
      const idx = this.state.schools.findIndex((s) => s.SchoolID === school.SchoolID);
      if (idx === -1) throw new Error('School not found');
      target = { ...this.state.schools[idx], ...school, UpdatedAt: new Date().toISOString() };
      this.state.schools[idx] = target;
      this.logAudit('Admin', 'UPDATE_SCHOOL', 'Schools', target.SchoolID, target.Name);
    }

    this.save();
    return target;
  }

  public deleteSchool(id: string): void {
    this.state.schools = this.state.schools.filter((s) => s.SchoolID !== id);
    this.logAudit('Admin', 'DELETE_SCHOOL', 'Schools', id, 'Deleted school');
    this.save();
  }

  public saveCategory(category: Partial<Category>): Category {
    const isNew = !category.CategoryID;
    let target: Category;

    if (isNew) {
      const id = `CAT-${String(this.state.categories.length + 1).padStart(4, '0')}`;
      target = {
        CategoryID: id,
        Name: category.Name || 'New Category',
        Code: category.Code || '',
        Description: category.Description || '',
        JudgesRequired: Number(category.JudgesRequired) || 1,
        RankingScope: category.RankingScope || 'both',
        Prize: category.Prize || '',
        TieBreak: category.TieBreak || '',
        Status: category.Status || 'Active',
      };
      this.state.categories.push(target);
      this.logAudit('Admin', 'CREATE_CATEGORY', 'Categories', target.CategoryID, target.Name);
    } else {
      const idx = this.state.categories.findIndex((c) => c.CategoryID === category.CategoryID);
      if (idx === -1) throw new Error('Category not found');
      target = { ...this.state.categories[idx], ...category };
      this.state.categories[idx] = target;
      this.logAudit('Admin', 'UPDATE_CATEGORY', 'Categories', target.CategoryID, target.Name);
    }

    this.save();
    return target;
  }

  public deleteCategory(id: string): void {
    this.state.categories = this.state.categories.filter((c) => c.CategoryID !== id);
    this.logAudit('Admin', 'DELETE_CATEGORY', 'Categories', id, 'Deleted category');
    this.save();
  }

  public saveTable(table: Partial<Table>): Table {
    const isNew = !table.TableID;
    let target: Table;

    if (isNew) {
      const id = `TBL-${String(this.state.tables.length + 1).padStart(4, '0')}`;
      target = {
        TableID: id,
        TableName: table.TableName || 'T00',
        Location: table.Location || '',
        Floor: table.Floor || 'Ground Floor',
        Status: table.Status || 'Active',
        Notes: table.Notes || '',
        UpdatedAt: new Date().toISOString(),
      };
      this.state.tables.push(target);
    } else {
      const idx = this.state.tables.findIndex((t) => t.TableID === table.TableID);
      if (idx === -1) throw new Error('Table not found');
      target = { ...this.state.tables[idx], ...table, UpdatedAt: new Date().toISOString() };
      this.state.tables[idx] = target;
    }

    this.save();
    return target;
  }

  public deleteTable(id: string): void {
    this.state.tables = this.state.tables.filter((t) => t.TableID !== id);
    this.save();
  }

  public saveParticipant(p: Partial<Participant>): Participant {
    const isNew = !p.ParticipantID;
    let target: Participant;

    // Resolve school info if school ID provided
    let schoolName = p.SchoolName || '';
    let emirate = p.Emirate || '';
    if (p.SchoolID) {
      const s = this.state.schools.find((item) => item.SchoolID === p.SchoolID);
      if (s) {
        schoolName = s.Name;
        emirate = s.Emirate;
      }
    }

    if (isNew) {
      const id = `PRT-${String(this.state.participants.length + 1).padStart(4, '0')}`;
      target = {
        ParticipantID: id,
        RegNo: p.RegNo || `MASE-26-${String(this.state.participants.length + 101)}`,
        SchoolID: p.SchoolID || '',
        SchoolName: schoolName,
        Title: p.Title || 'Untitled Project',
        Description: p.Description || '',
        Category: p.Category || (this.state.categories[0]?.Name || 'General'),
        EntryType: p.EntryType || 'Project',
        LeadName: p.LeadName || '',
        TeamMembers: p.TeamMembers || '',
        Grade: p.Grade || '',
        Contact: p.Contact || '',
        Email: p.Email || '',
        Supervisor: p.Supervisor || '',
        TableID: p.TableID || '',
        TableName: p.TableName || '',
        RegStatus: p.RegStatus || 'Registered',
        ProjectStatus: p.ProjectStatus || 'Active',
        Emirate: emirate,
        CreatedAt: new Date().toISOString(),
      };
      this.state.participants.push(target);
      this.logAudit('Admin', 'CREATE_PARTICIPANT', 'Participants', target.ParticipantID, target.Title);
    } else {
      const idx = this.state.participants.findIndex((item) => item.ParticipantID === p.ParticipantID);
      if (idx === -1) throw new Error('Participant not found');
      target = {
        ...this.state.participants[idx],
        ...p,
        SchoolName: schoolName || this.state.participants[idx].SchoolName,
        Emirate: emirate || this.state.participants[idx].Emirate,
        UpdatedAt: new Date().toISOString(),
      };
      this.state.participants[idx] = target;
      this.logAudit('Admin', 'UPDATE_PARTICIPANT', 'Participants', target.ParticipantID, target.Title);
    }

    this.save();
    return target;
  }

  public deleteParticipant(id: string): void {
    this.state.participants = this.state.participants.filter((p) => p.ParticipantID !== id);
    this.save();
  }

  public saveJudge(j: Partial<Judge>): Judge {
    const isNew = !j.JudgeID;
    let target: Judge;

    if (isNew) {
      const id = `JDG-${String(this.state.judges.length + 1).padStart(4, '0')}`;
      // generate 8-char alphanumeric code
      const accessCode =
        j.AccessCode || `GMU-${Math.floor(1000 + Math.random() * 9000)}`;
      target = {
        JudgeID: id,
        Name: j.Name || 'New Judge',
        Title: j.Title || '',
        Institution: j.Institution || 'Gulf Medical University',
        Email: j.Email || '',
        Contact: j.Contact || '',
        Categories: j.Categories || '',
        Status: j.Status || 'Active',
        Role: j.Role || 'Judge',
        Notes: j.Notes || '',
        AccessCode: accessCode,
        CodeIssuedAt: new Date().toISOString(),
      };
      this.state.judges.push(target);
      this.logAudit('Admin', 'CREATE_JUDGE', 'Judges', target.JudgeID, `${target.Name} (Code: ${target.AccessCode})`);
    } else {
      const idx = this.state.judges.findIndex((item) => item.JudgeID === j.JudgeID);
      if (idx === -1) throw new Error('Judge not found');
      target = { ...this.state.judges[idx], ...j };
      this.state.judges[idx] = target;
      this.logAudit('Admin', 'UPDATE_JUDGE', 'Judges', target.JudgeID, target.Name);
    }

    this.save();
    return target;
  }

  public deleteJudge(id: string): void {
    this.state.judges = this.state.judges.filter((j) => j.JudgeID !== id);
    this.save();
  }

  public issueAccessCode(judgeId: string, regenerate: boolean = false): { code: string; judge: Judge } {
    const judge = this.state.judges.find((j) => j.JudgeID === judgeId);
    if (!judge) throw new Error('Judge not found');

    if (regenerate || !judge.AccessCode) {
      judge.AccessCode = `GMU-${Math.floor(1000 + Math.random() * 9000)}`;
      judge.CodeIssuedAt = new Date().toISOString();
      this.logAudit('Admin', 'REGEN_CODE', 'Judges', judge.JudgeID, `New Code: ${judge.AccessCode}`);
      this.save();
    }

    return { code: judge.AccessCode, judge };
  }

  public updateSettings(settings: Partial<SystemSettings>): SystemSettings {
    this.state.settings = { ...this.state.settings, ...settings };
    this.logAudit('Admin', 'UPDATE_SETTINGS', 'Settings', 'SYSTEM', 'Updated system preferences');
    this.save();
    return this.state.settings;
  }

  public resetToDemo(): void {
    this.state = {
      schools: [...INITIAL_SCHOOLS],
      categories: [...INITIAL_CATEGORIES],
      tables: [...INITIAL_TABLES],
      participants: [...INITIAL_PARTICIPANTS],
      assignments: [...INITIAL_TABLE_ASSIGNMENTS],
      judges: [...INITIAL_JUDGES],
      evaluations: [...INITIAL_EVALUATIONS],
      settings: { ...INITIAL_SETTINGS },
      rubric: MASE_RUBRIC,
      auditLog: [
        {
          id: `AUD-${Date.now()}`,
          Timestamp: new Date().toISOString(),
          User: 'Admin',
          Action: 'RESET_DEMO',
          Entity: 'System',
          RefID: 'SYSTEM',
          Details: 'Restored Gulf Medical University MASE demo database with preloaded projects and evaluations.',
        },
      ],
      registrationRequests: [],
    };
    this.save();
  }

  // Registration Importer with column mapping
  public importRegistrations(
    rows: Record<string, string>[],
    mapping: Record<string, string>
  ): {
    added: number;
    newSchools: number;
    newCategories: number;
    newTables: number;
    errors: { row: number; error: string }[];
  } {
    let added = 0;
    let newSchools = 0;
    let newCategories = 0;
    let newTables = 0;
    const errors: { row: number; error: string }[] = [];

    const schoolMap = new Map<string, School>();
    this.state.schools.forEach((s) => schoolMap.set(s.Name.trim().toLowerCase(), s));

    const catMap = new Map<string, Category>();
    this.state.categories.forEach((c) => catMap.set(c.Name.trim().toLowerCase(), c));

    const tableMap = new Map<string, Table>();
    this.state.tables.forEach((t) => tableMap.set(t.TableName.trim().toLowerCase(), t));

    rows.forEach((row, idx) => {
      try {
        const title = row[mapping.Title || 'Title']?.trim();
        if (!title) {
          throw new Error('Missing project title');
        }

        const schoolName = row[mapping.SchoolName || 'SchoolName']?.trim() || 'Independent';
        const catName = row[mapping.Category || 'Category']?.trim() || 'Scientific Research';
        const emirate = row[mapping.Emirate || 'Emirate']?.trim() || 'Dubai';
        const tableName = row[mapping.TableName || 'TableName']?.trim();

        // Auto create school
        let school = schoolMap.get(schoolName.toLowerCase());
        if (!school) {
          const sid = `SCH-${String(this.state.schools.length + 1).padStart(4, '0')}`;
          school = {
            SchoolID: sid,
            Name: schoolName,
            Emirate: emirate,
            Status: 'Active',
            CreatedAt: new Date().toISOString(),
          };
          this.state.schools.push(school);
          schoolMap.set(schoolName.toLowerCase(), school);
          newSchools++;
        }

        // Auto create category
        let category = catMap.get(catName.toLowerCase());
        if (!category) {
          const cid = `CAT-${String(this.state.categories.length + 1).padStart(4, '0')}`;
          category = {
            CategoryID: cid,
            Name: catName,
            JudgesRequired: 1,
            Status: 'Active',
          };
          this.state.categories.push(category);
          catMap.set(catName.toLowerCase(), category);
          newCategories++;
        }

        // Auto create table
        let table: Table | undefined;
        if (tableName) {
          table = tableMap.get(tableName.toLowerCase());
          if (!table) {
            const tid = `TBL-${String(this.state.tables.length + 1).padStart(4, '0')}`;
            table = {
              TableID: tid,
              TableName: tableName,
              Status: 'Active',
              Location: 'Exhibition Hall',
            };
            this.state.tables.push(table);
            tableMap.set(tableName.toLowerCase(), table);
            newTables++;
          }
        }

        const pid = `PRT-${String(this.state.participants.length + 1).padStart(4, '0')}`;
        const newPart: Participant = {
          ParticipantID: pid,
          RegNo: row[mapping.RegNo || 'RegNo']?.trim() || `MASE-26-${pid}`,
          SchoolID: school.SchoolID,
          SchoolName: school.Name,
          Title: title,
          Category: category.Name,
          EntryType: (row[mapping.EntryType || 'EntryType']?.trim() as any) || 'Project',
          LeadName: row[mapping.LeadName || 'LeadName']?.trim() || '',
          TeamMembers: row[mapping.TeamMembers || 'TeamMembers']?.trim() || '',
          Grade: row[mapping.Grade || 'Grade']?.trim() || '',
          Email: row[mapping.Email || 'Email']?.trim() || '',
          Contact: row[mapping.Contact || 'Contact']?.trim() || '',
          Supervisor: row[mapping.Supervisor || 'Supervisor']?.trim() || '',
          TableID: table?.TableID || '',
          TableName: table?.TableName || '',
          Emirate: school.Emirate || emirate,
          RegStatus: 'Registered',
          ProjectStatus: 'Active',
          CreatedAt: new Date().toISOString(),
        };

        this.state.participants.push(newPart);

        if (table) {
          this.state.assignments.push({
            AssignmentID: `ASG-${String(this.state.assignments.length + 1).padStart(4, '0')}`,
            TableID: table.TableID,
            TableName: table.TableName,
            ParticipantID: pid,
            SchoolName: school.Name,
            Category: category.Name,
            Active: true,
            User: 'CSV Importer',
            Timestamp: new Date().toISOString(),
            Reason: 'Bulk CSV registration import',
          });
        }

        added++;
      } catch (err: any) {
        errors.push({ row: idx + 1, error: err.message || 'Row import failed' });
      }
    });

    this.logAudit(
      'Admin',
      'BULK_IMPORT',
      'Participants',
      `Imported ${added} projects`,
      `New schools: ${newSchools}, New categories: ${newCategories}, New tables: ${newTables}`
    );

    this.save();
    return { added, newSchools, newCategories, newTables, errors };
  }

  // Reports Export
  public exportReportCsv(reportType: 'overallTop10' | 'categories' | 'schools' | 'emirates'): string {
    const rankings = this.getRankings();
    const rows: (string | number)[][] = [];

    if (reportType === 'overallTop10') {
      rows.push(['Overall Rank', 'Project Title', 'School', 'Category', 'Emirate', 'Final Score (/40)', 'Percentage (%)', 'Judges']);
      rankings.overallTop10.forEach((p) => {
        rows.push([
          p.overallRank || '',
          `"${p.title.replace(/"/g, '""')}"`,
          `"${p.schoolName.replace(/"/g, '""')}"`,
          `"${p.category.replace(/"/g, '""')}"`,
          p.emirate,
          p.finalScore,
          `${p.percentage}%`,
          p.judgeCount,
        ]);
      });
    } else if (reportType === 'categories') {
      rows.push(['Category', 'Rank', 'Project Title', 'School', 'Score (/40)', 'Percentage (%)', 'Judges']);
      rankings.categoryRankings.forEach((c) => {
        c.projects.forEach((p) => {
          rows.push([
            `"${c.category.replace(/"/g, '""')}"`,
            p.rank || '',
            `"${p.title.replace(/"/g, '""')}"`,
            `"${p.schoolName.replace(/"/g, '""')}"`,
            p.finalScore,
            `${p.percentage}%`,
            p.judgeCount,
          ]);
        });
      });
    } else if (reportType === 'schools') {
      rows.push(['Rank', 'School', 'Total Projects', 'Eligible Projects', 'Metric Score']);
      rankings.schoolRankings.forEach((s) => {
        rows.push([s.rank, `"${s.school.replace(/"/g, '""')}"`, s.projects, s.eligible, s.metric]);
      });
    } else if (reportType === 'emirates') {
      rows.push(['Rank', 'Emirate', 'Average Project %', 'Top-3 Placements', 'Eligible Projects', 'Schools', 'Top Performing Project', 'Top Performing School']);
      rankings.emirateRankings.forEach((e) => {
        const topProj = e.topProjects[0]
          ? `"${e.topProjects[0].title.replace(/"/g, '""')} (${e.topProjects[0].schoolName} - ${e.topProjects[0].finalScore} pts)"`
          : 'N/A';
        const topSch = e.topSchools[0]
          ? `"${e.topSchools[0].school.replace(/"/g, '""')} (${e.topSchools[0].metric} pts)"`
          : 'N/A';
        rows.push([e.rank, e.emirate, `${e.avgPct}%`, e.placements, e.eligible, e.schoolCount, topProj, topSch]);
      });
    }

    return rows.map((r) => r.join(',')).join('\n');
  }

  public exportFullJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importFullJson(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.participants || !parsed.schools) {
        throw new Error('Invalid JSON backup format');
      }
      this.state = parsed;
      this.save();
      return true;
    } catch (e) {
      console.error('Failed to restore JSON database', e);
      return false;
    }
  }
}

export const storage = new StorageService();
