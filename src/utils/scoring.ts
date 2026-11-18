import { CRITERIA, JUDGES } from '../data/initialData';
import {
  CriterionId,
  CriterionInfo,
  EvaluatedPerformance,
  JudgeCriteriaMap,
  JudgeId,
  PerformanceItem,
  PrizeTier,
  ScoringConfig,
} from '../types/scoring';

const JUDGE_IDS: JudgeId[] = ['gk1', 'gk2', 'gk3', 'gk4', 'gk5'];

export const TEACHER_THEME_BONUS = 3;

export const PRIZE_QUOTA: Record<Exclude<PrizeTier, 'none'>, { label: string; count: number }> = {
  nhat: { label: 'Giải Nhất', count: 1 },
  nhi: { label: 'Giải Nhì', count: 2 },
  ba: { label: 'Giải Ba', count: 2 },
  khuyen_khich: { label: 'Giải Khuyến khích', count: 6 },
};

export function roundScore(val: number): number {
  return Math.round(val * 100) / 100;
}

export function getCriterionById(id: CriterionId): CriterionInfo | undefined {
  return CRITERIA.find((c) => c.id === id);
}

export function getJudgeMaxScore(
  judgeId: JudgeId,
  judgeCriteria: JudgeCriteriaMap
): number {
  const assigned = judgeCriteria[judgeId] ?? [];
  if (assigned.length === 0) return 0;
  return assigned.reduce((sum, critId) => {
    const c = getCriterionById(critId);
    return sum + (c ? c.maxPoints : 0);
  }, 0);
}

export function getCriteriaCoverageStats(judgeCriteria: JudgeCriteriaMap): {
  totalAssignedPoints: number;
  unassignedCriteria: CriterionInfo[];
  duplicatedCriteria: CriterionInfo[];
  assignedCountByCriterion: Record<CriterionId, number>;
} {
  const counts: Record<CriterionId, number> = {
    chu_de: 0,
    trang_phuc: 0,
    dan_dung: 0,
    hat: 0,
    file_nhac: 0,
    ky_luat: 0,
  };

  let totalAssignedPoints = 0;
  for (const jId of JUDGE_IDS) {
    const list = judgeCriteria[jId] ?? [];
    for (const cId of list) {
      if (cId in counts) {
        counts[cId] += 1;
        const info = getCriterionById(cId);
        if (info) totalAssignedPoints += info.maxPoints;
      }
    }
  }

  const unassignedCriteria = CRITERIA.filter((c) => counts[c.id] === 0);
  const duplicatedCriteria = CRITERIA.filter((c) => counts[c.id] > 1);

  return {
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

export function getPrizeForSlot(slotIndexZeroBased: number): {
  prize: PrizeTier;
  prizeLabel: string;
} {
  if (slotIndexZeroBased === 0) {
    return { prize: 'nhat', prizeLabel: 'Giải Nhất' };
  }
  if (slotIndexZeroBased === 1 || slotIndexZeroBased === 2) {
    return { prize: 'nhi', prizeLabel: 'Giải Nhì' };
  }
  if (slotIndexZeroBased === 3 || slotIndexZeroBased === 4) {
    return { prize: 'ba', prizeLabel: 'Giải Ba' };
  }
  if (slotIndexZeroBased >= 5 && slotIndexZeroBased < 11) {
    return { prize: 'khuyen_khich', prizeLabel: 'Khuyến khích' };
  }
  return { prize: 'none', prizeLabel: '—' };
}

export function evaluatePerformances(
  items: PerformanceItem[],
  config: ScoringConfig
): EvaluatedPerformance[] {
  const activeJudges = JUDGE_IDS.filter(
    (jId) => (config.judgeCriteria[jId] ?? []).length > 0
  );
  const requiredJudgeCount = activeJudges.length > 0 ? activeJudges.length : JUDGE_IDS.length;

  const baseList = items.map((item) => {
    let sum = 0;
    let scoredCount = 0;
    for (const jId of JUDGE_IDS) {
      const s = item.scores[jId];
      if (s !== null && !Number.isNaN(s)) {
        sum += s;
        scoredCount += 1;
      }
    }
    const judgeScoreSum = scoredCount > 0 ? roundScore(sum) : null;
    const teacherBonus = scoredCount > 0 && item.isTeacherTheme ? TEACHER_THEME_BONUS : 0;
    const totalScore = judgeScoreSum !== null ? roundScore(judgeScoreSum + teacherBonus) : null;
    const isComplete =
      activeJudges.length > 0
        ? activeJudges.every((jId) => item.scores[jId] !== null && !Number.isNaN(item.scores[jId]))
        : scoredCount === requiredJudgeCount;

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

    if (config.tieBreakByChair) {
      const chairA = a.scores.gk1 ?? -1;
      const chairB = b.scores.gk1 ?? -1;
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
      const sameChair = (item.scores.gk1 ?? -1) === (prev.scores.gk1 ?? -1);

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

    if (hasTiedTotal && config.tieBreakByChair) {
      const hasDifferentChairAmongSameTotal = sorted.some(
        (other) =>
          other.id !== item.id &&
          other.totalScore === item.totalScore &&
          (other.scores.gk1 ?? -1) !== (item.scores.gk1 ?? -1)
      );
      if (hasDifferentChairAmongSameTotal) {
        resolvedByChair = true;
      }
    }

    const slotForPrize = config.tieBreakByChair ? i : rankToAssign - 1;
    const { prize, prizeLabel } = getPrizeForSlot(slotForPrize);

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

export function exportToCsv(
  evaluated: EvaluatedPerformance[],
  judgeCriteria: JudgeCriteriaMap
): void {
  const headers = [
    'STT',
    'Tên lớp',
    'Tên tiết mục',
    'CĐ Thầy cô (+3đ)',
    ...JUDGES.map((j) => {
      const critNames = (judgeCriteria[j.id] ?? [])
        .map((cId) => getCriterionById(cId)?.shortName)
        .filter(Boolean)
        .join(' + ');
      return `${j.shortLabel} (${j.fullName}${critNames ? ` - ${critNames}` : ''})`;
    }),
    'Tổng điểm',
    'Xếp thứ',
    'Xếp giải',
  ];

  const escapeCsv = (value: string | number): string => {
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
    row.isTeacherTheme ? '+3' : '0',
    ...JUDGE_IDS.map((jId) => (row.scores[jId] !== null ? row.scores[jId] : '')),
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
  link.setAttribute('download', 'bieu-diem-van-nghe-20-11-2026-thcs-le-huu-lap.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
