import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import {
  CriterionInfo,
  EvaluatedPerformance,
  EventMetadata,
  JudgeId,
  JudgeInfo,
  ScoringConfig,
} from '../types/scoring';
import {
  formatTotalScore,
  getJudgeColumnCriterionTitle,
  getJudgeMaxScore,
} from '../utils/scoring';

interface QuickEntryPanelProps {
  performances: EvaluatedPerformance[];
  judges: JudgeInfo[];
  criteria: CriterionInfo[];
  eventMeta: EventMetadata;
  selectedId: string;
  onSelectId: (id: string) => void;
  draftScores: Record<string, string>;
  onScoreInputChange: (perfId: string, judgeId: JudgeId, raw: string) => void;
  onScoreInputBlur: (perfId: string, judgeId: JudgeId) => void;
  onToggleTeacherTheme: (perfId: string) => void;
  config: ScoringConfig;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const QuickEntryPanel: React.FC<QuickEntryPanelProps> = ({
  performances,
  judges,
  criteria,
  eventMeta,
  selectedId,
  onSelectId,
  draftScores,
  onScoreInputChange,
  onScoreInputBlur,
  onToggleTeacherTheme,
  config,
  isOpen,
  onToggleOpen,
}) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentIndex = Math.max(
    0,
    performances.findIndex((p) => p.id === selectedId)
  );
  const current = performances[currentIndex] ?? performances[0];

  if (!current) return null;

  const goToIndex = (nextIdx: number) => {
    const clamped = (nextIdx + performances.length) % performances.length;
    onSelectId(performances[clamped].id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, judgeIdx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (judgeIdx < judges.length - 1) {
        const nextJudge = judges[judgeIdx + 1].id;
        inputRefs.current[nextJudge]?.focus();
        inputRefs.current[nextJudge]?.select();
      } else {
        const nextIdx = (currentIndex + 1) % performances.length;
        onSelectId(performances[nextIdx].id);
        setTimeout(() => {
          const firstJudgeId = judges[0]?.id;
          if (firstJudgeId) {
            inputRefs.current[firstJudgeId]?.focus();
            inputRefs.current[firstJudgeId]?.select();
          }
        }, 20);
      }
    }
  };

  return (
    <div className="no-print rounded-xl border border-[#E6DFD5] bg-white">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b border-[#EFEAE2]">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onToggleOpen}
            className="min-h-[36px] text-left text-sm font-semibold text-[#1C1917] hover:text-[#9F1239] transition-colors cursor-pointer"
          >
            {isOpen
              ? '▾ Nhập điểm nhanh theo tiết mục'
              : '▸ Mở khung nhập nhanh theo tiết mục'}
          </button>
          <span className="hidden lg:inline text-xs text-[#6B655E]">
            · Nhấn Enter để chuyển nhanh giữa các cột tiêu chí
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            id="quick-perf-select"
            aria-label="Chọn tiết mục đang chấm"
            value={current.id}
            onChange={(e) => onSelectId(e.target.value)}
            className="flex-1 min-w-0 sm:max-w-[340px] min-h-[42px] truncate rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-3 py-2 text-sm sm:text-xs font-medium text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
          >
            {performances.map((p) => (
              <option key={p.id} value={p.id}>
                {p.stt}. Lớp {p.className} — {p.performanceName || '(Chưa nhập tên)'}
              </option>
            ))}
          </select>

          <div className="flex items-center border border-[#D6D0C6] rounded-lg overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => goToIndex(currentIndex - 1)}
              title="Tiết mục trước"
              aria-label="Tiết mục trước"
              className="flex h-[42px] w-[42px] items-center justify-center text-[#57534E] hover:bg-[#FAF7F2] hover:text-[#1C1917] border-r border-[#D6D0C6] cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => goToIndex(currentIndex + 1)}
              title="Tiết mục tiếp theo"
              aria-label="Tiết mục tiếp theo"
              className="flex h-[42px] w-[42px] items-center justify-center text-[#57534E] hover:bg-[#FAF7F2] hover:text-[#1C1917] cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 lg:w-72 shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#6B655E]">
                <span className="font-mono font-semibold text-[#9F1239]">
                  Tiết mục {String(current.stt).padStart(2, '0')}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#1C1917]">Lớp {current.className}</span>
                {current.isComplete && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-[#15803D] font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Đủ điểm
                    </span>
                  </>
                )}
              </div>
              <p
                className="mt-1 text-base sm:text-sm font-semibold text-[#1C1917] leading-snug"
                title={current.performanceName}
              >
                {current.performanceName || '(Chưa nhập tên tiết mục)'}
              </p>

              {eventMeta.bonusPoints > 0 && (
                <label className="mt-2.5 inline-flex min-h-[40px] items-center gap-2.5 rounded-lg border border-[#EFEAE2] bg-[#FAF7F2] px-3 py-1.5 text-xs text-[#44403C] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={current.isTeacherTheme}
                    onChange={() => onToggleTeacherTheme(current.id)}
                    className="h-4 w-4 rounded border-[#D6D0C6] accent-[#9F1239]"
                  />
                  <span>
                    {eventMeta.bonusLabel}{' '}
                    <strong className="font-mono text-[#9F1239]">
                      (+{eventMeta.bonusPoints}đ)
                    </strong>
                  </span>
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 flex-1">
              {judges.map((judge, idx) => {
                const draftKey = `${current.id}-${judge.id}`;
                const scoreVal = current.scores[judge.id];
                const displayValue =
                  draftKey in draftScores
                    ? draftScores[draftKey]
                    : scoreVal !== null && scoreVal !== undefined
                      ? String(scoreVal)
                      : '';

                const critTitle = getJudgeColumnCriterionTitle(
                  judge.id,
                  config.judgeCriteria,
                  criteria,
                  idx
                );
                const maxScore = getJudgeMaxScore(judge.id, config.judgeCriteria, criteria);

                return (
                  <div key={judge.id} className="flex flex-col">
                    <label
                      htmlFor={`quick-${judge.id}`}
                      className="text-xs font-semibold text-[#1C1917] truncate"
                      title={`${critTitle} — ${judge.shortLabel}: ${judge.fullName}`}
                    >
                      {critTitle}
                    </label>
                    <div className="text-[11px] text-[#6B655E] truncate">
                      {judge.fullName}{' '}
                      <span className="font-mono font-semibold text-[#9F1239]">
                        (/{maxScore}đ)
                      </span>
                    </div>
                    <input
                      id={`quick-${judge.id}`}
                      ref={(el) => {
                        inputRefs.current[judge.id] = el;
                      }}
                      type="text"
                      inputMode="decimal"
                      disabled={maxScore === 0}
                      placeholder={maxScore > 0 ? `0–${maxScore}` : '—'}
                      value={displayValue}
                      onChange={(e) => onScoreInputChange(current.id, judge.id, e.target.value)}
                      onBlur={() => onScoreInputBlur(current.id, judge.id)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      className="mt-1.5 w-full min-h-[48px] sm:min-h-[42px] rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-2.5 py-2 text-center font-mono text-base sm:text-sm font-semibold tabular-nums text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#9F1239] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9F1239]/25 disabled:opacity-50"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#EFEAE2] pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5 shrink-0">
              <div className="flex items-center gap-5">
                <div>
                  <div className="text-[11px] font-medium text-[#6B655E]">Tổng điểm</div>
                  <div className="font-mono text-xl font-bold tabular-nums text-[#9F1239]">
                    {formatTotalScore(current.totalScore)}
                  </div>
                  {current.teacherBonus > 0 && (
                    <div className="font-mono text-[10px] text-[#9F1239]">
                      ({formatTotalScore(current.judgeScoreSum)} + {current.teacherBonus}đ)
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-medium text-[#6B655E]">Xếp thứ</div>
                  <div className="font-mono text-xl font-bold tabular-nums text-[#1C1917]">
                    {current.rank !== null ? `#${current.rank}` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-medium text-[#6B655E]">Xếp giải</div>
                  <div className="text-sm font-semibold text-[#1C1917] whitespace-nowrap">
                    {current.rank !== null ? current.prizeLabel : 'Chưa xếp'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => goToIndex(currentIndex + 1)}
                className="sm:hidden inline-flex min-h-[44px] items-center gap-1 rounded-lg bg-[#9F1239] px-3.5 py-2 text-xs font-semibold text-white active:scale-[0.98] cursor-pointer"
              >
                <span>Tiết mục tiếp</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
