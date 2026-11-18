import React from 'react';
import { RotateCcw, Check } from 'lucide-react';
import {
  CriterionId,
  CriterionInfo,
  JudgeCriteriaMap,
  JudgeId,
  JudgeInfo,
} from '../types/scoring';
import { getCriteriaCoverageStats, getJudgeMaxScore } from '../utils/scoring';

interface CriteriaAssignmentPanelProps {
  judges: JudgeInfo[];
  criteria: CriterionInfo[];
  judgeCriteria: JudgeCriteriaMap;
  onToggleJudgeCriterion: (judgeId: JudgeId, criterionId: CriterionId) => void;
  onUpdateJudge: (judgeId: JudgeId, partial: Partial<JudgeInfo>) => void;
  onResetDefaultAssignment: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const CriteriaAssignmentPanel: React.FC<CriteriaAssignmentPanelProps> = ({
  judges,
  criteria,
  judgeCriteria,
  onToggleJudgeCriterion,
  onUpdateJudge,
  onResetDefaultAssignment,
  isOpen,
  onToggleOpen,
}) => {
  const coverage = getCriteriaCoverageStats(judges, judgeCriteria, criteria);
  const isBalanced =
    coverage.totalAssignedPoints === coverage.totalStandardPoints &&
    coverage.unassignedCriteria.length === 0 &&
    coverage.duplicatedCriteria.length === 0;

  return (
    <div className="no-print rounded-xl border border-[#E6DFD5] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#EFEAE2]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={onToggleOpen}
            className="min-h-[36px] text-left text-sm font-semibold text-[#1C1917] hover:text-[#9F1239] transition-colors cursor-pointer"
          >
            {isOpen
              ? '▾ Thu gọn phân công tiêu chí & tên Ban Giám khảo'
              : '▸ Giám khảo tích chọn tiêu chí phụ trách & sửa tên BGK'}
          </button>
          <span className="text-xs text-[#6B655E]">
            Đã gán:{' '}
            <strong
              className={`font-mono tabular-nums ${
                isBalanced ? 'text-[#15803D]' : 'text-[#B45309]'
              }`}
            >
              {coverage.totalAssignedPoints}/{coverage.totalStandardPoints}đ
            </strong>
            {coverage.unassignedCriteria.length > 0 && (
              <span className="ml-1.5 text-[#DC2626]">
                (Thiếu {coverage.unassignedCriteria.length} TC)
              </span>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={onResetDefaultAssignment}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-3 py-1.5 text-xs font-medium text-[#1C1917] hover:bg-white cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="h-3.5 w-3.5 text-[#57534E]" aria-hidden="true" />
          <span>Khôi phục phân công mặc định</span>
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-[#57534E] leading-relaxed">
            Nhấp trực tiếp vào <strong className="font-semibold text-[#1C1917]">tên Giám khảo</strong> để thay đổi nhân sự cho lần tổ chức khác, và tích chọn tiêu chí mà mỗi Giám khảo phụ trách chấm. Khi in hoặc xuất biên bản gửi các lớp, bảng điểm sẽ <strong className="font-semibold text-[#9F1239]">chỉ hiển thị tên Tiêu chí chấm (ẩn tên Giám khảo)</strong>.
          </p>

          {/* Desktop Matrix */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-[#E6DFD5]">
            <table className="w-full min-w-[820px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6DFD5] bg-[#FAF7F2] text-[#57534E]">
                  <th className="px-3 py-2.5 font-semibold w-56">Giám khảo (nhấp để sửa tên)</th>
                  {criteria.map((c) => (
                    <th
                      key={c.id}
                      scope="col"
                      className="border-l border-[#EFEAE2] px-2.5 py-2 text-center"
                      title={c.description}
                    >
                      <div className="font-semibold text-[#1C1917]">
                        {c.stt}. {c.shortName}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] font-medium text-[#9F1239]">
                        {c.maxPoints}đ
                      </div>
                    </th>
                  ))}
                  <th className="border-l border-[#E6DFD5] bg-[#F4EFE6] px-3 py-2.5 text-right font-semibold text-[#1C1917] w-24">
                    Điểm tối đa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEAE2]">
                {judges.map((judge) => {
                  const assigned = judgeCriteria[judge.id] ?? [];
                  const maxScore = getJudgeMaxScore(judge.id, judgeCriteria, criteria);

                  return (
                    <tr key={judge.id} className="hover:bg-[#FAF7F2]/70">
                      <td className="px-2.5 py-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#6B655E] shrink-0">
                            {judge.shortLabel}
                          </span>
                          <input
                            type="text"
                            aria-label={`Tên ${judge.shortLabel}`}
                            value={judge.fullName}
                            onChange={(e) =>
                              onUpdateJudge(judge.id, { fullName: e.target.value })
                            }
                            className="w-full min-w-0 rounded border border-transparent bg-transparent px-1.5 py-1 text-xs font-medium text-[#1C1917] hover:border-[#E6DFD5] focus:border-[#9F1239] focus:bg-white focus:outline-none"
                          />
                          {judge.isChair && (
                            <span
                              title="Trưởng ban Giám khảo"
                              className="text-[10px] font-semibold text-[#9F1239] shrink-0"
                            >
                              (TB)
                            </span>
                          )}
                        </div>
                      </td>

                      {criteria.map((crit) => {
                        const checked = assigned.includes(crit.id);
                        return (
                          <td
                            key={crit.id}
                            className={`border-l border-[#EFEAE2] px-2 py-2 text-center transition-colors ${
                              checked ? 'bg-[#FFF1F2]/60' : ''
                            }`}
                          >
                            <label className="inline-flex h-8 w-8 items-center justify-center rounded cursor-pointer hover:bg-[#FAF7F2]">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => onToggleJudgeCriterion(judge.id, crit.id)}
                                aria-label={`${judge.fullName} phụ trách tiêu chí ${crit.name}`}
                                className="sr-only"
                              />
                              <span
                                className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition-colors ${
                                  checked
                                    ? 'border-[#9F1239] bg-[#9F1239] text-white'
                                    : 'border-[#C7C2BA] bg-white text-transparent'
                                }`}
                              >
                                <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                              </span>
                            </label>
                          </td>
                        );
                      })}

                      <td className="border-l border-[#E6DFD5] bg-[#FAF7F2]/60 px-3 py-2 text-right font-mono font-bold tabular-nums text-[#1C1917]">
                        {maxScore > 0 ? `${maxScore}đ` : '0đ'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#E6DFD5] bg-[#FAF7F2] text-[11px]">
                  <td className="px-3 py-2 font-medium text-[#57534E]">
                    Tình trạng phân công
                  </td>
                  {criteria.map((crit) => {
                    const count = coverage.assignedCountByCriterion[crit.id] ?? 0;
                    return (
                      <td
                        key={crit.id}
                        className="border-l border-[#EFEAE2] px-2 py-2 text-center font-mono tabular-nums"
                      >
                        {count === 0 ? (
                          <span className="font-semibold text-[#DC2626]">Chưa chọn</span>
                        ) : count === 1 ? (
                          <span className="font-medium text-[#15803D]">1 GK</span>
                        ) : (
                          <span className="font-semibold text-[#B45309]">{count} GK</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="border-l border-[#E6DFD5] bg-[#F4EFE6] px-3 py-2 text-right font-mono font-bold tabular-nums text-[#9F1239]">
                    {coverage.totalAssignedPoints}đ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Touch Cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {judges.map((judge) => {
              const assigned = judgeCriteria[judge.id] ?? [];
              const maxScore = getJudgeMaxScore(judge.id, judgeCriteria, criteria);

              return (
                <div
                  key={judge.id}
                  className="rounded-xl border border-[#E6DFD5] bg-[#FAF7F2]/60 p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#9F1239] shrink-0">
                        {judge.shortLabel}
                      </span>
                      <input
                        type="text"
                        aria-label={`Tên ${judge.shortLabel}`}
                        value={judge.fullName}
                        onChange={(e) =>
                          onUpdateJudge(judge.id, { fullName: e.target.value })
                        }
                        className="w-full min-w-0 min-h-[38px] rounded-lg border border-[#D6D0C6] bg-white px-2.5 text-sm font-semibold text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
                      />
                    </div>
                    <span className="font-mono text-xs font-bold tabular-nums text-[#9F1239] shrink-0">
                      /{maxScore}đ
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {criteria.map((crit) => {
                      const checked = assigned.includes(crit.id);
                      return (
                        <button
                          key={crit.id}
                          type="button"
                          onClick={() => onToggleJudgeCriterion(judge.id, crit.id)}
                          aria-pressed={checked}
                          className={`flex min-h-[44px] items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                            checked
                              ? 'border-[#9F1239] bg-[#FFF1F2] text-[#9F1239]'
                              : 'border-[#E6DFD5] bg-white text-[#44403C]'
                          }`}
                        >
                          <span className="truncate">{crit.shortName}</span>
                          <span className="font-mono font-semibold shrink-0">
                            {crit.maxPoints}đ
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
