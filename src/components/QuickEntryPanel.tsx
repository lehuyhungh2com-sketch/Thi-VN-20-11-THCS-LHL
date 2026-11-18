import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { JUDGES } from '../data/initialData';
import { EvaluatedPerformance, JudgeId, ScoringConfig } from '../types/scoring';
import {
  formatTotalScore,
  getCriterionById,
  getJudgeMaxScore,
} from '../utils/scoring';

interface QuickEntryPanelProps {
  performances: EvaluatedPerformance[];
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
  const inputRefs = useRef<Record<JudgeId, HTMLInputElement | null>>({
    gk1: null,
    gk2: null,
    gk3: null,
    gk4: null,
    gk5: null,
  });

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
      if (judgeIdx < JUDGES.length - 1) {
        const nextJudge = JUDGES[judgeIdx + 1].id;
        inputRefs.current[nextJudge]?.focus();
        inputRefs.current[nextJudge]?.select();
      } else {
        const nextIdx = (currentIndex + 1) % performances.length;
        onSelectId(performances[nextIdx].id);
        setTimeout(() => {
          inputRefs.current.gk1?.focus();
          inputRefs.current.gk1?.select();
        }, 20);
      }
    }
  };

  return (
    <div className="no-print rounded-md border border-[#E5E0D8] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#ECE7DF]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleOpen}
            className="text-sm font-semibold text-[#1C1917] hover:text-[#9F1239] transition-colors cursor-pointer"
          >
            {isOpen
              ? '▾ Thu gọn khung nhập nhanh theo tiết mục'
              : '▸ Mở khung nhập nhanh sau mỗi tiết mục'}
          </button>
          <span className="hidden sm:inline text-xs text-[#6B655E]">
            · Nhấn Enter để chuyển nhanh từ GK1 → GK5 và sang tiết mục tiếp theo
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="quick-perf-select" className="text-xs font-medium text-[#6B655E]">
            Đang chấm:
          </label>
          <select
            id="quick-perf-select"
            value={current.id}
            onChange={(e) => onSelectId(e.target.value)}
            className="max-w-[260px] sm:max-w-[360px] truncate rounded border border-[#D6D0C6] bg-[#FAF8F5] px-2.5 py-1.5 text-xs font-medium text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
          >
            {performances.map((p) => (
              <option key={p.id} value={p.id}>
                STT {p.stt} — Lớp {p.className}:{' '}
                {p.performanceName || '(Chưa nhập tên tiết mục)'}
              </option>
            ))}
          </select>

          <div className="flex items-center border border-[#D6D0C6] rounded overflow-hidden">
            <button
              type="button"
              onClick={() => goToIndex(currentIndex - 1)}
              title="Tiết mục trước"
              aria-label="Tiết mục trước"
              className="p-1.5 text-[#57534E] hover:bg-[#FAF8F5] hover:text-[#1C1917] border-r border-[#D6D0C6] cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => goToIndex(currentIndex + 1)}
              title="Tiết mục tiếp theo"
              aria-label="Tiết mục tiếp theo"
              className="p-1.5 text-[#57534E] hover:bg-[#FAF8F5] hover:text-[#1C1917] cursor-pointer"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Selected performance header + teacher-theme +3 toggle */}
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
                className="mt-1 text-sm font-semibold text-[#1C1917] truncate"
                title={current.performanceName}
              >
                {current.performanceName || 'Chưa đăng ký tên tiết mục'}
              </p>

              <label className="mt-2 inline-flex items-center gap-2 text-xs text-[#57534E] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={current.isTeacherTheme}
                  onChange={() => onToggleTeacherTheme(current.id)}
                  className="h-3.5 w-3.5 rounded border-[#D6D0C6] accent-[#9F1239]"
                />
                <span>
                  Chủ đề ca ngợi thầy cô{' '}
                  <strong className="font-mono text-[#9F1239]">(+3đ)</strong>
                </span>
              </label>
            </div>

            {/* 5 judge score inputs showing assigned criteria and max ceiling */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 flex-1">
              {JUDGES.map((judge, idx) => {
                const draftKey = `${current.id}-${judge.id}`;
                const scoreVal = current.scores[judge.id];
                const displayValue =
                  draftKey in draftScores
                    ? draftScores[draftKey]
                    : scoreVal !== null
                      ? String(scoreVal)
                      : '';

                const assignedIds = config.judgeCriteria[judge.id] ?? [];
                const assignedNames = assignedIds
                  .map((cId) => getCriterionById(cId)?.shortName)
                  .filter(Boolean)
                  .join(' + ');
                const maxScore = getJudgeMaxScore(judge.id, config.judgeCriteria);

                return (
                  <div key={judge.id} className="flex flex-col">
                    <label
                      htmlFor={`quick-${judge.id}`}
                      className="text-[11px] font-medium text-[#57534E] truncate"
                      title={`${judge.shortLabel}: ${judge.fullName} — Phụ trách: ${assignedNames || 'Chưa chọn'} (Tối đa ${maxScore}đ)`}
                    >
                      <span className="font-semibold text-[#1C1917]">{judge.shortLabel}</span>{' '}
                      {judge.fullName}
                    </label>
                    <div className="text-[10px] text-[#6B655E] truncate">
                      {assignedNames ? (
                        <>
                          {assignedNames}{' '}
                          <span className="font-mono font-semibold text-[#9F1239]">
                            (/{maxScore}đ)
                          </span>
                        </>
                      ) : (
                        <span className="text-[#A8A29E]">Chưa phân công TC</span>
                      )}
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
                      className="mt-1 w-full rounded border border-[#D6D0C6] bg-[#FAF8F5] px-2.5 py-2 text-center font-mono text-sm font-semibold tabular-nums text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#9F1239] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9F1239] disabled:opacity-50"
                    />
                  </div>
                );
              })}
            </div>

            {/* Live calculated total (+3đ if teacher theme), rank, prize */}
            <div className="flex items-center justify-between gap-4 border-t border-[#ECE7DF] pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5 shrink-0">
              <div>
                <div className="text-[11px] font-medium text-[#6B655E]">Tổng điểm</div>
                <div className="font-mono text-xl font-bold tabular-nums text-[#9F1239]">
                  {formatTotalScore(current.totalScore)}
                </div>
                {current.teacherBonus > 0 && (
                  <div className="font-mono text-[10px] text-[#9F1239]">
                    ({formatTotalScore(current.judgeScoreSum)} + 3đ CĐ)
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
          </div>
        </div>
      )}
    </div>
  );
};
