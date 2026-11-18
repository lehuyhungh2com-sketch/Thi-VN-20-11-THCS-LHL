export type JudgeId = string;

export type CriterionId = string;

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

export interface EventMetadata {
  organizationHeader: string;
  schoolName: string;
  eventTitle: string;
  eventDateRange: string;
  eventLocationDate: string;
  secretaryName: string;
  bonusLabel: string;
  bonusPoints: number;
}

export interface PrizeConfig {
  nhat: number;
  nhi: number;
  ba: number;
  khuyen_khich: number;
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
