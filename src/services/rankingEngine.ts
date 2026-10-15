import {
  Participant,
  Category,
  Evaluation,
  School,
  SystemSettings,
  Rubric,
  ProjectResult,
  RankingsData,
  CategoryRanking,
  SchoolRanking,
  EmirateRanking,
} from '../types';

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function aggregateScores(scores: number[], method: 'average' | 'sum' | 'median'): number {
  if (!scores || scores.length === 0) return 0;
  if (method === 'sum') {
    return round2(scores.reduce((a, b) => a + b, 0));
  }
  if (method === 'median') {
    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return round2(sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
  }
  // default: average
  return round2(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function computeProjectResults(
  participants: Participant[],
  categories: Category[],
  evaluations: Evaluation[],
  schools: School[],
  settings: SystemSettings,
  rubric: Rubric
): ProjectResult[] {
  const schoolEmirateMap = new Map<string, string>();
  schools.forEach((s) => {
    schoolEmirateMap.set(s.SchoolID, s.Emirate || 'Unspecified');
    schoolEmirateMap.set(s.Name.toLowerCase().trim(), s.Emirate || 'Unspecified');
  });

  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => {
    categoryMap.set(c.CategoryID, c);
    categoryMap.set(c.Name.toLowerCase().trim(), c);
  });

  const evalsByParticipant = new Map<string, Evaluation[]>();
  evaluations
    .filter((e) => e.Status === 'Submitted')
    .forEach((e) => {
      const list = evalsByParticipant.get(e.ParticipantID) || [];
      list.push(e);
      evalsByParticipant.set(e.ParticipantID, list);
    });

  return participants.map((p) => {
    const cat =
      categoryMap.get(p.Category) ||
      categoryMap.get(p.Category.toLowerCase().trim()) || {
        CategoryID: 'CAT-GEN',
        Name: p.Category,
        JudgesRequired: 1,
        Status: 'Active',
      };

    const req = cat.JudgesRequired || 1;
    const projectEvals = evalsByParticipant.get(p.ParticipantID) || [];
    const totals = projectEvals.map((e) => Number(e.Total));

    const finalScore = aggregateScores(totals, settings.ScoringAggregation || 'average');
    const emirate =
      p.Emirate ||
      (p.SchoolID ? schoolEmirateMap.get(p.SchoolID) : undefined) ||
      schoolEmirateMap.get(p.SchoolName.toLowerCase().trim()) ||
      'Unspecified';

    const eligible =
      totals.length >= req && String(p.RegStatus || 'Registered').toLowerCase() !== 'pending';

    const percentage = round2((finalScore / rubric.maxTotal) * 100);

    return {
      participantId: p.ParticipantID,
      title: p.Title,
      schoolId: p.SchoolID,
      schoolName: p.SchoolName,
      emirate,
      category: p.Category,
      tableName: p.TableName,
      leadName: p.LeadName,
      entryType: p.EntryType,
      judgeCount: totals.length,
      required: req,
      finalScore,
      maxScore: rubric.maxTotal,
      percentage,
      eligible,
      evaluations: projectEvals,
    };
  });
}

export function computeRankings(
  participants: Participant[],
  categories: Category[],
  evaluations: Evaluation[],
  schools: School[],
  settings: SystemSettings,
  rubric: Rubric
): RankingsData {
  const results = computeProjectResults(participants, categories, evaluations, schools, settings, rubric);
  const eligible = results.filter((r) => r.eligible);

  // Group by category
  const byCat = new Map<string, ProjectResult[]>();
  eligible.forEach((r) => {
    const list = byCat.get(r.category) || [];
    list.push({ ...r });
    byCat.set(r.category, list);
  });

  const categoryRankings: CategoryRanking[] = Array.from(byCat.entries())
    .sort(([catA], [catB]) => catA.localeCompare(catB))
    .map(([category, list]) => {
      // Sort projects in category descending by finalScore, tie-break by max creativity/innovation score
      const sorted = list.sort((a, b) => {
        if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
        const c4a = a.evaluations[0]?.C4 || 0;
        const c4b = b.evaluations[0]?.C4 || 0;
        return c4b - c4a;
      });

      sorted.forEach((item, idx) => {
        item.rank = idx + 1;
      });

      return { category, projects: sorted };
    });

  // Overall Top 10
  const rankKey: 'finalScore' | 'percentage' =
    settings.OverallRankMethod === 'raw' ? 'finalScore' : 'percentage';

  const overallTop10 = [...eligible]
    .sort((a, b) => b[rankKey] - a[rankKey])
    .slice(0, 10)
    .map((item, idx) => ({
      ...item,
      overallRank: idx + 1,
    }));

  // School standings
  const schoolMap = new Map<
    string,
    {
      school: string;
      projects: number;
      eligible: number;
      totalPoints: number;
      scores: number[];
    }
  >();

  results.forEach((r) => {
    const key = r.schoolName;
    const entry = schoolMap.get(key) || {
      school: key,
      projects: 0,
      eligible: 0,
      totalPoints: 0,
      scores: [],
    };
    entry.projects++;
    if (r.eligible) {
      entry.eligible++;
      entry.totalPoints += r.finalScore;
      entry.scores.push(r.finalScore);
    }
    schoolMap.set(key, entry);
  });

  const schoolMethod = settings.SchoolRankingMethod || 'avgEligible';
  const schoolRankings: SchoolRanking[] = Array.from(schoolMap.values())
    .map((s) => {
      const metric =
        schoolMethod === 'totalPoints'
          ? round2(s.totalPoints)
          : s.scores.length
          ? round2(s.totalPoints / s.scores.length)
          : 0;
      return {
        rank: 0,
        school: s.school,
        projects: s.projects,
        eligible: s.eligible,
        totalPoints: round2(s.totalPoints),
        metric,
      };
    })
    .sort((a, b) => b.metric - a.metric)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  // Emirate standings
  // Count top-3 placements by emirate as a fair tie-breaker
  const placements: Record<string, number> = {};
  categoryRankings.forEach((c) => {
    c.projects.slice(0, 3).forEach((r) => {
      const em = r.emirate || 'Unspecified';
      placements[em] = (placements[em] || 0) + 1;
    });
  });

  const emirateMap = new Map<
    string,
    {
      emirate: string;
      schools: Set<string>;
      projects: number;
      eligible: number;
      pctSum: number;
    }
  >();

  results.forEach((r) => {
    const em = r.emirate || 'Unspecified';
    const entry = emirateMap.get(em) || {
      emirate: em,
      schools: new Set<string>(),
      projects: 0,
      eligible: 0,
      pctSum: 0,
    };
    entry.projects++;
    if (r.schoolName) entry.schools.add(r.schoolName);
    if (r.eligible) {
      entry.eligible++;
      entry.pctSum += r.percentage;
    }
    emirateMap.set(em, entry);
  });

  const emirateRankings: EmirateRanking[] = Array.from(emirateMap.values())
    .map((item) => {
      const avgPct = item.eligible > 0 ? round2(item.pctSum / item.eligible) : 0;

      // Filter and rank projects belonging to this emirate
      const emProjects = results
        .filter((r) => (r.emirate || 'Unspecified').toLowerCase() === item.emirate.toLowerCase())
        .sort((a, b) => b.finalScore - a.finalScore)
        .map((p, pIdx) => ({
          ...p,
          rank: pIdx + 1,
        }));

      // Filter and rank schools belonging to this emirate
      const emSchools = schoolRankings
        .filter((s) => {
          const matchedSchool = schools.find(
            (sch) => sch.Name.toLowerCase().trim() === s.school.toLowerCase().trim()
          );
          const schEmirate = matchedSchool?.Emirate || 'Unspecified';
          return schEmirate.toLowerCase() === item.emirate.toLowerCase();
        })
        .map((s, sIdx) => ({
          rank: sIdx + 1,
          school: s.school,
          metric: s.metric,
          projects: s.projects,
        }));

      return {
        rank: 0,
        emirate: item.emirate,
        avgPct,
        placements: placements[item.emirate] || 0,
        eligible: item.eligible,
        schoolCount: item.schools.size,
        topProjects: emProjects,
        topSchools: emSchools,
      };
    })
    .sort((a, b) => b.avgPct - a.avgPct || b.placements - a.placements)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  return {
    published: settings.RankingsPublished ?? true,
    final: settings.ResultsFinal ?? false,
    method: {
      overall: settings.OverallRankMethod === 'raw' ? 'Raw Total Points (out of 40)' : 'Normalized Percentage Score (%)',
      school: schoolMethod === 'totalPoints' ? 'Total Accumulated Points' : 'Average of Eligible Project Scores',
      aggregation: settings.ScoringAggregation || 'average',
      emirate: 'Fair Average of Eligible Project % (Tie-break: Top-3 category placements)',
    },
    overallTop10,
    categoryRankings,
    schoolRankings,
    emirateRankings,
    generatedAt: new Date().toISOString(),
  };
}
