export type JudgeId = 'gk1' | 'gk2' | 'gk3' | 'gk4' | 'gk5';

export type CriterionId =
  | 'chu_de'
  | 'trang_phuc'
  | 'dan_dung'
  | 'hat'
  | 'file_nhac'
  | 'ky_luat';

export interface SubCriterion {
  label: string;
  maxPoints: number;
}

export interface CriterionInfo {
  id: CriterionId;
  stt: number;
  name: string;
  shortName: string;
  description: string;
  maxPoints: number;
  bonusNote?: string;
  subCriteria?: SubCriterion[];
}

export interface JudgeInfo {
  id: JudgeId;
  shortLabel: string;
  fullName: string;
  role: string;
  isChair?: boolean;
}

export type JudgeCriteriaMap = Record<JudgeId, CriterionId[]>;

export type JudgeScores = Record<JudgeId, number | null>;

export interface PerformanceItem {
  id: string;
  stt: number;
  className: string;
  performanceName: string;
  isTeacherTheme: boolean;
  scores: JudgeScores;
}

export type PrizeTier = 'nhat' | 'nhi' | 'ba' | 'khuyen_khich' | 'none';

export interface EvaluatedPerformance extends PerformanceItem {
  judgeScoreSum: number | null;
  teacherBonus: number;
  totalScore: number | null;
  scoredCount: number;
  isComplete: boolean;
  rank: number | null;
  prize: PrizeTier;
  prizeLabel: string;
  hasTiedTotal: boolean;
  resolvedByChair: boolean;
}

export interface ScoringConfig {
  tieBreakByChair: boolean;
  requireAllJudgesToRank: boolean;
  judgeCriteria: JudgeCriteriaMap;
}

export type ActiveTab = 'ledger' | 'standings' | 'jury' | 'rules';
