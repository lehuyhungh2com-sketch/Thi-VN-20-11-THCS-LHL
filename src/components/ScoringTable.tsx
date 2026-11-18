import React, { useRef, useState } from 'react';
import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  CriterionInfo,
  EvaluatedPerformance,
  EventMetadata,
  JudgeId,
  JudgeInfo,
  PrizeTier,
  ScoringConfig,
} from '../types/scoring';
import {
  formatTotalScore,
  getJudgeColumnCriterionTitle,
  getJudgeMaxScore,
} from '../utils/scoring';

interface ScoringTableProps {
  evaluated: EvaluatedPerformance[];
  judges: JudgeInfo[];
  criteria: CriterionInfo[];
  eventMeta: EventMetadata;
  selectedId: string;
  onSelectId: (id: string) => void;
  draftScores: Record<string, string>;
  onScoreInputChange: (perfId: string, judgeId: JudgeId, raw: string) => void;
  onScoreInputBlur: (perfId: string, judgeId: JudgeId) => void;
  onUpdateClassName: (perfId: string, value: string) => void;
  onUpdatePerformanceName: (perfId: string, value: string) => void;
  onToggleTeacherTheme: (perfId: string) => void;
  onAddPerformance: () => void;
  onRemovePerformance: (perfId: string) => void;
  config: ScoringConfig;
  onChangeConfig: (next: Partial<ScoringConfig>) => void;
  onLoadSampleScores: () => void;
  onClearAllScores: () => void;
  onExportCsv: () => void;
}

const PRIZE_TEXT_STYLE: Record<PrizeTier, string> = {
  nhat: 'font-bold text-[#9F1239]',
  nhi: 'font-semibold text-[#B45309]',
  ba: 'font-semibold text-[#1E3A8A]',
  khuyen_khich: 'font-medium text-[#374151]',
  none: 'text-[#A8A29E]',
};

export const ScoringTable: React.FC<ScoringTableProps> = ({
  evaluated,
  judges,
  criteria,
  eventMeta,
  selectedId,
  onSelectId,
  draftScores,
  onScoreInputChange,
  onScoreInputBlur,
  onUpdateClassName,
  onUpdatePerformanceName,
  onToggleTeacherTheme,
  onAddPerformance,
  onRemovePerformance,
  config,
  onChangeConfig,
  onLoadSampleScores,
  onClearAllScores,
  onExportCsv,
}) => {
  const [sortByRank, setSortByRank] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const cellRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const displayedRows = sortByRank
    ? [...evaluated].sort((a, b) => {
        if (a.rank !== null && b.rank !== null) {
          if (a.rank !== b.rank) return a.rank - b.rank;
          return (b.totalScore ?? 0) - (a.totalScore ?? 0);
        }
        if (a.rank !== null) return -1;
        if (b.rank !== null) return 1;
        return a.stt - b.stt;
      })
    : evaluated;

  const hasAnyScore = evaluated.some((r) => r.scoredCount > 0);
  const chairJudge = judges.find((j) => j.isChair) ?? judges[0];

  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    judgeIndex: number
  ) => {
    const focusCell = (rIdx: number, jIdx: number) => {
      const targetRow = displayedRows[rIdx];
      const targetJudge = judges[jIdx];
      if (!targetRow || !targetJudge) return;
      const key = `${targetRow.id}-${targetJudge.id}`;
      const el = cellRefs.current[key];
      if (el) {
        onSelectId(targetRow.id);
        el.focus();
        el.select();
      }
    };

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (rowIndex < displayedRows.length - 1) {
        focusCell(rowIndex + 1, judgeIndex);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (rowIndex > 0) {
        focusCell(rowIndex - 1, judgeIndex);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (judgeIndex < judges.length - 1) {
        focusCell(rowIndex, judgeIndex + 1);
      } else if (rowIndex < displayedRows.length - 1) {
        focusCell(rowIndex + 1, 0);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Workspace Toolbar */}
      <div className="no-print flex flex-col gap-3 rounded-xl border border-[#E6DFD5] bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Sắp xếp bảng điểm"
            className="inline-flex items-center rounded-lg border border-[#E6DFD5] bg-[#FAF7F2] p-0.5"
          >
            <button
              type="button"
              onClick={() => setSortByRank(false)}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                !sortByRank
                  ? 'bg-white text-[#1C1917] shadow-xs'
                  : 'text-[#6B655E] hover:text-[#1C1917]'
              }`}
            >
              <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Theo STT</span>
            </button>
            <button
              type="button"
              onClick={() => setSortByRank(true)}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                sortByRank
                  ? 'bg-white text-[#9F1239] shadow-xs'
                  : 'text-[#6B655E] hover:text-[#1C1917]'
              }`}
            >
              <ArrowDownWideNarrow className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Theo thứ hạng</span>
            </button>
          </div>

          {chairJudge && (
            <label className="inline-flex min-h-[38px] items-center gap-2 text-xs text-[#57534E] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.tieBreakByChair}
                onChange={(e) => onChangeConfig({ tieBreakByChair: e.target.checked })}
                className="h-4 w-4 rounded border-[#D6D0C6] accent-[#9F1239]"
              />
              <span>Ưu tiên điểm Trưởng ban ({chairJudge.shortLabel}) khi đồng điểm</span>
            </label>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onAddPerformance}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#D6D0C6] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#FAF7F2] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#9F1239]" aria-hidden="true" />
            <span>Thêm tiết mục</span>
          </button>

          <button
            type="button"
            onClick={onLoadSampleScores}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#D6D0C6] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#FAF7F2] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#B45309]" aria-hidden="true" />
            <span>Điền điểm mẫu</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#D6D0C6] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#FAF7F2] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-[#57534E]" aria-hidden="true" />
            <span>Xuất Excel</span>
          </button>

          {hasAnyScore && !confirmClear && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E6DFD5] bg-white px-3 py-1.5 text-xs font-medium text-[#6B655E] transition-colors hover:border-[#DC2626]/40 hover:text-[#DC2626] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Xóa điểm</span>
            </button>
          )}

          {confirmClear && (
            <div className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#DC2626]/40 bg-[#FEF2F2] px-3 py-1">
              <span className="text-xs font-medium text-[#991B1B]">Xóa hết?</span>
              <button
                type="button"
                onClick={() => {
                  onClearAllScores();
                  setConfirmClear(false);
                }}
                className="rounded bg-[#DC2626] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#B91C1C] cursor-pointer"
              >
                Xác nhận
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded px-2 py-1 text-xs font-medium text-[#57534E] hover:text-[#1C1917] cursor-pointer"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE CARD LEDGER (< md) */}
      <div className="space-y-3 md:hidden">
        {displayedRows.map((row) => {
          const isExpanded = row.id === selectedId;
          return (
            <div
              key={row.id}
              className={`rounded-xl border bg-white transition-colors ${
                isExpanded ? 'border-[#9F1239]/50 shadow-xs' : 'border-[#E6DFD5]'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectId(isExpanded ? '' : row.id)}
                className="flex w-full min-h-[60px] items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-[#6B655E]">
                    <span className="font-mono font-bold text-[#9F1239]">
                      #{String(row.stt).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-[#1C1917]">Lớp {row.className}</span>
                    {row.isTeacherTheme && eventMeta.bonusPoints > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px] font-medium text-[#9F1239]">
                          +{eventMeta.bonusPoints}đ CĐ
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-[#1C1917] line-clamp-1">
                    {row.performanceName || '(Chưa nhập tên tiết mục)'}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-mono text-base font-bold tabular-nums text-[#1C1917]">
                      {formatTotalScore(row.totalScore)}
                    </div>
                    <div className={`text-[11px] ${PRIZE_TEXT_STYLE[row.prize]}`}>
                      {row.rank !== null ? `Hạng ${row.rank} · ${row.prizeLabel}` : 'Chưa chấm'}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[#6B655E]" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#6B655E]" aria-hidden="true" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-[#EFEAE2] px-4 py-3.5 space-y-3.5 bg-[#FAF7F2]/40">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[11px] font-medium text-[#6B655E] mb-1">
                        Lớp
                      </label>
                      <input
                        type="text"
                        value={row.className}
                        onChange={(e) => onUpdateClassName(row.id, e.target.value)}
                        className="w-full min-h-[44px] rounded-lg border border-[#D6D0C6] bg-white px-2.5 text-sm font-semibold text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[11px] font-medium text-[#6B655E] mb-1">
                        Tên tiết mục
                      </label>
                      <input
                        type="text"
                        value={row.performanceName}
                        onChange={(e) => onUpdatePerformanceName(row.id, e.target.value)}
                        placeholder="Nhập tên tiết mục"
                        className="w-full min-h-[44px] rounded-lg border border-[#D6D0C6] bg-white px-2.5 text-sm text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
                      />
                    </div>
                  </div>

                  {eventMeta.bonusPoints > 0 && (
                    <label className="flex min-h-[44px] items-center justify-between rounded-lg border border-[#E6DFD5] bg-white px-3 py-2 text-xs text-[#44403C] cursor-pointer">
                      <span>
                        {eventMeta.bonusLabel}{' '}
                        <strong className="font-mono text-[#9F1239]">
                          (+{eventMeta.bonusPoints}đ)
                        </strong>
                      </span>
                      <input
                        type="checkbox"
                        checked={row.isTeacherTheme}
                        onChange={() => onToggleTeacherTheme(row.id)}
                        className="h-4.5 w-4.5 rounded border-[#D6D0C6] accent-[#9F1239]"
                      />
                    </label>
                  )}

                  <div className="grid grid-cols-2 gap-2.5">
                    {judges.map((judge, jIdx) => {
                      const key = `${row.id}-${judge.id}`;
                      const scoreVal = row.scores[judge.id];
                      const displayValue =
                        key in draftScores
                          ? draftScores[key]
                          : scoreVal !== null && scoreVal !== undefined
                            ? String(scoreVal)
                            : '';
                      const critTitle = getJudgeColumnCriterionTitle(
                        judge.id,
                        config.judgeCriteria,
                        criteria,
                        jIdx
                      );
                      const maxScore = getJudgeMaxScore(
                        judge.id,
                        config.judgeCriteria,
                        criteria
                      );

                      return (
                        <div key={judge.id} className="flex flex-col">
                          <label className="text-[11px] font-semibold text-[#1C1917] truncate">
                            {critTitle}
                          </label>
                          <div className="text-[10px] text-[#6B655E] truncate mb-1">
                            {judge.fullName} ·{' '}
                            <span className="font-mono font-semibold text-[#9F1239]">
                              /{maxScore}đ
                            </span>
                          </div>
                          <input
                            type="text"
                            inputMode="decimal"
                            disabled={maxScore === 0}
                            placeholder={maxScore > 0 ? `0–${maxScore}` : '—'}
                            value={displayValue}
                            onChange={(e) =>
                              onScoreInputChange(row.id, judge.id, e.target.value)
                            }
                            onBlur={() => onScoreInputBlur(row.id, judge.id)}
                            className="w-full min-h-[48px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-center font-mono text-base font-semibold tabular-nums text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#9F1239] focus:outline-none focus:ring-2 focus:ring-[#9F1239]/25 disabled:opacity-45"
                          />
                        </div>
                      );
                    })}
                  </div>

                  {evaluated.length > 1 && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onRemovePerformance(row.id)}
                        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Xóa tiết mục này</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DESKTOP SPREADSHEET LEDGER (>= md) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#E6DFD5] bg-white">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E6DFD5] bg-[#FAF7F2] text-xs text-[#57534E]">
              <th scope="col" className="w-12 px-3 py-3 text-center font-semibold">
                STT
              </th>
              <th scope="col" className="w-20 px-2.5 py-3 font-semibold">
                Tên lớp
              </th>
              <th scope="col" className="min-w-[260px] px-3 py-3 font-semibold">
                Tên Tiết mục
              </th>
              {judges.map((judge, idx) => {
                const critTitle = getJudgeColumnCriterionTitle(
                  judge.id,
                  config.judgeCriteria,
                  criteria,
                  idx
                );
                const maxScore = getJudgeMaxScore(
                  judge.id,
                  config.judgeCriteria,
                  criteria
                );

                return (
                  <th
                    key={judge.id}
                    scope="col"
                    className="w-32 border-l border-[#EFEAE2] px-2 py-2.5 text-center align-top"
                  >
                    <div className="text-xs font-bold text-[#1C1917] leading-tight">
                      {critTitle}
                    </div>
                    <div className="font-mono text-[11px] font-semibold text-[#9F1239] mt-0.5">
                      Tối đa {maxScore}đ
                    </div>
                    <div className="mt-1 text-[10px] font-normal text-[#6B655E] truncate">
                      {judge.shortLabel}: {judge.fullName}
                    </div>
                  </th>
                );
              })}
              <th
                scope="col"
                className="w-28 border-l border-[#E6DFD5] bg-[#F4EFE6] px-3 py-3 text-right font-semibold text-[#1C1917]"
              >
                Tổng điểm
              </th>
              <th
                scope="col"
                className="w-20 border-l border-[#EFEAE2] bg-[#F4EFE6] px-2 py-3 text-center font-semibold text-[#1C1917]"
              >
                Xếp thứ
              </th>
              <th
                scope="col"
                className="w-32 border-l border-[#EFEAE2] bg-[#F4EFE6] px-3 py-3 font-semibold text-[#1C1917]"
              >
                Xếp giải
              </th>
              {evaluated.length > 1 && (
                <th
                  scope="col"
                  className="w-10 border-l border-[#EFEAE2] bg-[#F4EFE6] px-1 py-3 text-center"
                >
                  <span className="sr-only">Xóa</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EFEAE2]">
            {displayedRows.map((row, rowIdx) => {
              const isSelected = row.id === selectedId;
              const isTopThree = row.rank !== null && row.rank <= 3;

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectId(row.id)}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-[#FFF1F2]/45'
                      : isTopThree
                        ? 'bg-[#FFFBEB]/35 hover:bg-[#FAF7F2]'
                        : 'hover:bg-[#FAF7F2]'
                  }`}
                >
                  <td className="px-3 py-2 text-center font-mono text-xs font-semibold tabular-nums text-[#6B655E]">
                    {String(row.stt).padStart(2, '0')}
                  </td>

                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      aria-label={`Tên lớp tiết mục ${row.stt}`}
                      value={row.className}
                      onChange={(e) => onUpdateClassName(row.id, e.target.value)}
                      className="w-full rounded border border-transparent bg-transparent px-1.5 py-1.5 text-sm font-semibold text-[#1C1917] hover:border-[#E6DFD5] focus:border-[#9F1239] focus:bg-white focus:outline-none"
                    />
                  </td>

                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      aria-label={`Tên tiết mục lớp ${row.className}`}
                      placeholder="Nhập tên tiết mục"
                      value={row.performanceName}
                      onChange={(e) => onUpdatePerformanceName(row.id, e.target.value)}
                      className="w-full rounded border border-transparent bg-transparent px-2 py-1 text-sm text-[#1C1917] placeholder:text-[#A8A29E] hover:border-[#E6DFD5] focus:border-[#9F1239] focus:bg-white focus:outline-none"
                    />
                    {eventMeta.bonusPoints > 0 && (
                      <label
                        onClick={(e) => e.stopPropagation()}
                        className="mt-0.5 inline-flex items-center gap-1.5 px-2 text-[11px] text-[#6B655E] cursor-pointer select-none hover:text-[#1C1917]"
                      >
                        <input
                          type="checkbox"
                          checked={row.isTeacherTheme}
                          onChange={() => onToggleTeacherTheme(row.id)}
                          className="h-3 w-3 rounded border-[#D6D0C6] accent-[#9F1239]"
                        />
                        <span className={row.isTeacherTheme ? 'text-[#9F1239] font-medium' : ''}>
                          {eventMeta.bonusLabel} (+{eventMeta.bonusPoints}đ)
                        </span>
                      </label>
                    )}
                  </td>

                  {judges.map((judge, judgeIdx) => {
                    const key = `${row.id}-${judge.id}`;
                    const scoreVal = row.scores[judge.id];
                    const displayValue =
                      key in draftScores
                        ? draftScores[key]
                        : scoreVal !== null && scoreVal !== undefined
                          ? String(scoreVal)
                          : '';
                    const maxScore = getJudgeMaxScore(
                      judge.id,
                      config.judgeCriteria,
                      criteria
                    );

                    return (
                      <td
                        key={judge.id}
                        className="border-l border-[#EFEAE2] px-1.5 py-1.5 text-center"
                      >
                        <input
                          ref={(el) => {
                            cellRefs.current[key] = el;
                          }}
                          type="text"
                          inputMode="decimal"
                          disabled={maxScore === 0}
                          aria-label={`Điểm ${getJudgeColumnCriterionTitle(judge.id, config.judgeCriteria, criteria, judgeIdx)} cho lớp ${row.className}`}
                          placeholder={maxScore > 0 ? `/${maxScore}` : '—'}
                          value={displayValue}
                          onFocus={() => onSelectId(row.id)}
                          onChange={(e) =>
                            onScoreInputChange(row.id, judge.id, e.target.value)
                          }
                          onBlur={() => onScoreInputBlur(row.id, judge.id)}
                          onKeyDown={(e) => handleCellKeyDown(e, rowIdx, judgeIdx)}
                          className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-center font-mono text-sm font-medium tabular-nums text-[#1C1917] placeholder:text-[#C7C2BA] placeholder:text-xs hover:border-[#D6D0C6] hover:bg-white focus:border-[#9F1239] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9F1239] disabled:opacity-40"
                        />
                      </td>
                    );
                  })}

                  <td className="border-l border-[#E6DFD5] bg-[#FAF7F2]/60 px-3 py-2 text-right">
                    <div className="font-mono text-sm font-bold tabular-nums text-[#1C1917]">
                      {formatTotalScore(row.totalScore)}
                    </div>
                    {row.teacherBonus > 0 && (
                      <div className="font-mono text-[10px] font-medium text-[#9F1239] tabular-nums">
                        +{row.teacherBonus}đ CĐ
                      </div>
                    )}
                  </td>

                  <td className="border-l border-[#EFEAE2] bg-[#FAF7F2]/60 px-2 py-2 text-center font-mono text-sm font-semibold tabular-nums">
                    {row.rank !== null ? (
                      <span
                        className={
                          row.rank === 1
                            ? 'text-[#9F1239] font-bold'
                            : row.rank <= 5
                              ? 'text-[#1C1917]'
                              : 'text-[#57534E]'
                        }
                      >
                        {row.rank}
                        {row.resolvedByChair && (
                          <sup
                            title="Đồng tổng điểm, phân định theo điểm Trưởng ban"
                            className="ml-0.5 text-[10px] text-[#B45309]"
                          >
                            *
                          </sup>
                        )}
                      </span>
                    ) : (
                      <span className="text-[#C7C2BA]">—</span>
                    )}
                  </td>

                  <td className="border-l border-[#EFEAE2] bg-[#FAF7F2]/60 px-3 py-2 text-sm whitespace-nowrap">
                    {row.rank !== null ? (
                      <span className={PRIZE_TEXT_STYLE[row.prize]}>{row.prizeLabel}</span>
                    ) : (
                      <span className="text-xs text-[#A8A29E]">Chưa xếp</span>
                    )}
                  </td>

                  {evaluated.length > 1 && (
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="border-l border-[#EFEAE2] bg-[#FAF7F2]/60 px-1 py-2 text-center"
                    >
                      <button
                        type="button"
                        onClick={() => onRemovePerformance(row.id)}
                        title={`Xóa tiết mục lớp ${row.className}`}
                        aria-label={`Xóa tiết mục lớp ${row.className}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded text-[#A8A29E] hover:bg-[#FEF2F2] hover:text-[#DC2626] cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quiet legend */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B655E]">
        <p>
          Gợi ý: Bạn có thể sửa trực tiếp tên lớp, tên tiết mục, thêm/xóa tiết mục hoặc xuất Excel / In biên bản gửi các lớp (chỉ hiển thị cột Tiêu chí chấm, không hiển thị tên Giám khảo).
        </p>
        {evaluated.some((r) => r.resolvedByChair) && chairJudge && (
          <p className="text-[#B45309]">
            * Ký hiệu sao: Các lớp đồng tổng điểm được phân định theo điểm Trưởng ban ({chairJudge.shortLabel}).
          </p>
        )}
      </div>
    </div>
  );
};
