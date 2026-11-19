import {
  AppBackupData,
  CriterionId,
  CriterionInfo,
  EvaluatedPerformance,
  EventMetadata,
  JudgeCriteriaMap,
  JudgeId,
  JudgeInfo,
  PerformanceItem,
  PrizeConfig,
  PrizeTier,
  ScoringConfig,
} from '../types/scoring';

export function roundScore(val: number): number {
  return Math.round(val * 100) / 100;
}

export function getCriterionById(
  id: CriterionId,
  criteria: CriterionInfo[]
): CriterionInfo | undefined {
  return criteria.find((c) => c.id === id);
}

export function getJudgeMaxScore(
  judgeId: JudgeId,
  judgeCriteria: JudgeCriteriaMap,
  criteria: CriterionInfo[]
): number {
  const assigned = judgeCriteria[judgeId] ?? [];
  if (assigned.length === 0) return 0;
  return assigned.reduce((sum, critId) => {
    const c = getCriterionById(critId, criteria);
    return sum + (c ? c.maxPoints : 0);
  }, 0);
}

export function getJudgeColumnCriterionTitle(
  judgeId: JudgeId,
  judgeCriteria: JudgeCriteriaMap,
  criteria: CriterionInfo[],
  fallbackIndex: number
): string {
  const assigned = judgeCriteria[judgeId] ?? [];
  const names = assigned
    .map((cId) => getCriterionById(cId, criteria)?.shortName)
    .filter(Boolean) as string[];
  if (names.length === 0) {
    return `Tiêu chí ${fallbackIndex + 1}`;
  }
  if (names.length === 1) {
    return `Điểm ${names[0]}`;
  }
  return names.join(' & ');
}

export function getCriteriaCoverageStats(
  judges: JudgeInfo[],
  judgeCriteria: JudgeCriteriaMap,
  criteria: CriterionInfo[]
): {
  totalStandardPoints: number;
  totalAssignedPoints: number;
  unassignedCriteria: CriterionInfo[];
  duplicatedCriteria: CriterionInfo[];
  assignedCountByCriterion: Record<CriterionId, number>;
} {
  const counts: Record<CriterionId, number> = {};
  for (const c of criteria) {
    counts[c.id] = 0;
  }

  let totalAssignedPoints = 0;
  for (const j of judges) {
    const list = judgeCriteria[j.id] ?? [];
    for (const cId of list) {
      if (cId in counts) {
        counts[cId] += 1;
        const info = getCriterionById(cId, criteria);
        if (info) totalAssignedPoints += info.maxPoints;
      }
    }
  }

  const totalStandardPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0);
  const unassignedCriteria = criteria.filter((c) => (counts[c.id] ?? 0) === 0);
  const duplicatedCriteria = criteria.filter((c) => (counts[c.id] ?? 0) > 1);

  return {
    totalStandardPoints,
    totalAssignedPoints,
    unassignedCriteria,
    duplicatedCriteria,
    assignedCountByCriterion: counts,
  };
}

export function formatTotalScore(val: number | null): string {
  if (val === null || Number.isNaN(val)) return '—';
  return val.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
}

export function parseScoreInput(raw: string, maxScore: number): number | null {
  const trimmed = raw.trim().replace(',', '.');
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed) || parsed < 0) return null;
  const effectiveMax = maxScore > 0 ? maxScore : 100;
  const clamped = Math.min(parsed, effectiveMax);
  return roundScore(clamped);
}

export function getPrizeForSlot(
  slotIndexZeroBased: number,
  prizeConfig: PrizeConfig
): {
  prize: PrizeTier;
  prizeLabel: string;
} {
  const nhatEnd = prizeConfig.nhat;
  const nhiEnd = nhatEnd + prizeConfig.nhi;
  const baEnd = nhiEnd + prizeConfig.ba;
  const kkEnd = baEnd + prizeConfig.khuyen_khich;

  if (slotIndexZeroBased >= 0 && slotIndexZeroBased < nhatEnd) {
    return { prize: 'nhat', prizeLabel: 'Giải Nhất' };
  }
  if (slotIndexZeroBased >= nhatEnd && slotIndexZeroBased < nhiEnd) {
    return { prize: 'nhi', prizeLabel: 'Giải Nhì' };
  }
  if (slotIndexZeroBased >= nhiEnd && slotIndexZeroBased < baEnd) {
    return { prize: 'ba', prizeLabel: 'Giải Ba' };
  }
  if (slotIndexZeroBased >= baEnd && slotIndexZeroBased < kkEnd) {
    return { prize: 'khuyen_khich', prizeLabel: 'Khuyến khích' };
  }
  return { prize: 'none', prizeLabel: 'Không đạt giải' };
}

export function evaluatePerformances(
  items: PerformanceItem[],
  judges: JudgeInfo[],
  config: ScoringConfig,
  prizeConfig: PrizeConfig,
  bonusPoints: number
): EvaluatedPerformance[] {
  const chairJudge = judges.find((j) => j.isChair) ?? judges[0];
  const chairId = chairJudge?.id ?? '';

  const activeJudges = judges.filter(
    (j) => (config.judgeCriteria[j.id] ?? []).length > 0
  );
  const judgeListForCheck = activeJudges.length > 0 ? activeJudges : judges;

  const baseList = items.map((item) => {
    let sum = 0;
    let scoredCount = 0;
    for (const j of judges) {
      const s = item.scores[j.id];
      if (s !== null && s !== undefined && !Number.isNaN(s)) {
        sum += s;
        scoredCount += 1;
      }
    }
    const judgeScoreSum = scoredCount > 0 ? roundScore(sum) : null;
    const teacherBonus = scoredCount > 0 && item.isTeacherTheme ? bonusPoints : 0;
    const totalScore = judgeScoreSum !== null ? roundScore(judgeScoreSum + teacherBonus) : null;
    const isComplete =
      judgeListForCheck.length > 0 &&
      judgeListForCheck.every(
        (j) =>
          item.scores[j.id] !== null &&
          item.scores[j.id] !== undefined &&
          !Number.isNaN(item.scores[j.id])
      );

    return {
      ...item,
      judgeScoreSum,
      teacherBonus,
      totalScore,
      scoredCount,
      isComplete,
    };
  });

  const eligible = baseList.filter((item) =>
    config.requireAllJudgesToRank ? item.isComplete : item.scoredCount > 0
  );

  const totalCountMap = new Map<number, number>();
  for (const item of eligible) {
    if (item.totalScore !== null) {
      totalCountMap.set(item.totalScore, (totalCountMap.get(item.totalScore) ?? 0) + 1);
    }
  }

  const sorted = [...eligible].sort((a, b) => {
    const totA = a.totalScore ?? -1;
    const totB = b.totalScore ?? -1;
    if (totB !== totA) return totB - totA;

    if (config.tieBreakByChair && chairId) {
      const chairA = a.scores[chairId] ?? -1;
      const chairB = b.scores[chairId] ?? -1;
      if (chairB !== chairA) return chairB - chairA;
    }

    return a.stt - b.stt;
  });

  const evaluatedMap = new Map<
    string,
    {
      rank: number | null;
      prize: PrizeTier;
      prizeLabel: string;
      hasTiedTotal: boolean;
      resolvedByChair: boolean;
    }
  >();

  let currentCompetitionRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const hasTiedTotal =
      item.totalScore !== null && (totalCountMap.get(item.totalScore) ?? 0) > 1;

    let rankToAssign: number;
    let resolvedByChair = false;

    if (i === 0) {
      rankToAssign = 1;
    } else {
      const prev = sorted[i - 1];
      const sameTotal = item.totalScore === prev.totalScore;
      const sameChair =
        chairId ? (item.scores[chairId] ?? -1) === (prev.scores[chairId] ?? -1) : true;

      if (sameTotal && config.tieBreakByChair && !sameChair) {
        rankToAssign = i + 1;
        resolvedByChair = true;
      } else if (sameTotal) {
        rankToAssign = currentCompetitionRank;
      } else {
        rankToAssign = i + 1;
      }
    }

    currentCompetitionRank = rankToAssign;

    if (hasTiedTotal && config.tieBreakByChair && chairId) {
      const hasDifferentChairAmongSameTotal = sorted.some(
        (other) =>
          other.id !== item.id &&
          other.totalScore === item.totalScore &&
          (other.scores[chairId] ?? -1) !== (item.scores[chairId] ?? -1)
      );
      if (hasDifferentChairAmongSameTotal) {
        resolvedByChair = true;
      }
    }

    const slotForPrize = config.tieBreakByChair ? i : rankToAssign - 1;
    const { prize, prizeLabel } = getPrizeForSlot(slotForPrize, prizeConfig);

    evaluatedMap.set(item.id, {
      rank: rankToAssign,
      prize,
      prizeLabel,
      hasTiedTotal,
      resolvedByChair,
    });
  }

  return baseList.map((item) => {
    const evalInfo = evaluatedMap.get(item.id);
    if (!evalInfo) {
      return {
        ...item,
        rank: null,
        prize: 'none',
        prizeLabel: 'Chưa xếp',
        hasTiedTotal: false,
        resolvedByChair: false,
      };
    }
    return {
      ...item,
      ...evalInfo,
    };
  });
}

// Export CSV for sharing with classes: headers strictly show Criterion Names (no judge personal names)
export function exportToCsv(
  evaluated: EvaluatedPerformance[],
  judges: JudgeInfo[],
  criteria: CriterionInfo[],
  judgeCriteria: JudgeCriteriaMap,
  eventMeta: EventMetadata
): void {
  const headers = [
    'STT',
    'Tên lớp',
    'Tên tiết mục',
    `${eventMeta.bonusLabel} (+${eventMeta.bonusPoints}đ)`,
    ...judges.map((j, idx) => {
      const title = getJudgeColumnCriterionTitle(j.id, judgeCriteria, criteria, idx);
      const maxScore = getJudgeMaxScore(j.id, judgeCriteria, criteria);
      return `${title} (${maxScore}đ)`;
    }),
    'Tổng điểm',
    'Xếp thứ',
    'Xếp giải',
  ];

  const escapeCsv = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = evaluated.map((row) => [
    row.stt,
    row.className,
    row.performanceName,
    row.isTeacherTheme ? `+${eventMeta.bonusPoints}` : '0',
    ...judges.map((j) => (row.scores[j.id] !== null && row.scores[j.id] !== undefined ? row.scores[j.id] : '')),
    row.totalScore !== null ? row.totalScore : '',
    row.rank !== null ? row.rank : '',
    row.rank !== null ? row.prizeLabel : '',
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'bien-ban-cham-diem-van-nghe.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBackupJson(data: Omit<AppBackupData, 'version' | 'exportedAt'>): string {
  const now = new Date();
  const dateStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const fileName = `du-phong-van-nghe-${dateStamp}.json`;

  const payload: AppBackupData = {
    version: 1,
    exportedAt: now.toISOString(),
    ...data,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
}

export function parseBackupJson(rawText: string): AppBackupData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('File không đúng định dạng JSON hợp lệ.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Nội dung file dự phòng không hợp lệ.');
  }

  const obj = parsed as Partial<AppBackupData>;

  if (
    !Array.isArray(obj.performances) ||
    obj.performances.length === 0 ||
    !Array.isArray(obj.judges) ||
    obj.judges.length === 0 ||
    !Array.isArray(obj.criteria) ||
    obj.criteria.length === 0 ||
    !obj.eventMeta ||
    !obj.config ||
    !obj.prizeConfig
  ) {
    throw new Error('File dự phòng thiếu dữ liệu cấu hình hoặc danh sách tiết mục.');
  }

  return {
    version: typeof obj.version === 'number' ? obj.version : 1,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : new Date().toISOString(),
    eventMeta: obj.eventMeta,
    judges: obj.judges,
    criteria: obj.criteria,
    prizeConfig: obj.prizeConfig,
    config: obj.config,
    performances: obj.performances,
  };
}

