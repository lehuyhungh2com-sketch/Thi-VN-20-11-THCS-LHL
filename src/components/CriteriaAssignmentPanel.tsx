import React from 'react';
import { RotateCcw, Check } from 'lucide-react';
import { CRITERIA, JUDGES } from '../data/initialData';
import { CriterionId, JudgeCriteriaMap, JudgeId } from '../types/scoring';
import {
  getCriteriaCoverageStats,
  getJudgeMaxScore,
} from '../utils/scoring';

interface CriteriaAssignmentPanelProps {
  judgeCriteria: JudgeCriteriaMap;
  onToggleJudgeCriterion: (judgeId: JudgeId, criterionId: CriterionId) => void;
  onResetDefaultAssignment: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const CriteriaAssignmentPanel: React.FC<CriteriaAssignmentPanelProps> = ({
  judgeCriteria,
  onToggleJudgeCriterion,
  onResetDefaultAssignment,
  isOpen,
  onToggleOpen,
}) => {
  const coverage = getCriteriaCoverageStats(judgeCriteria);
  const isBalanced100 =
    coverage.totalAssignedPoints === 100 &&
    coverage.unassignedCriteria.length === 0 &&
    coverage.duplicatedCriteria.length === 0;

  return (
    <div className="no-print rounded-md border border-[#E5E0D8] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[#ECE7DF]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            onClick={onToggleOpen}
            className="text-sm font-semibold text-[#1C1917] hover:text-[#9F1239] transition-colors cursor-pointer"
          >
            {isOpen
              ? '▾ Thu gọn phân công tiêu chí Ban Giám khảo'
              : '▸ Giám khảo tích chọn tiêu chí phụ trách chấm'}
          </button>
          <span className="text-xs text-[#6B655E]">
            · Tổng điểm chuẩn đã phân công:{' '}
            <strong
              className={`font-mono tabular-nums ${
                isBalanced100 ? 'text-[#15803D]' : 'text-[#B45309]'
              }`}
            >
              {coverage.totalAssignedPoints}/100đ
            </strong>
            {coverage.unassignedCriteria.length > 0 && (
              <span className="ml-2 text-[#DC2626]">
                (Còn {coverage.unassignedCriteria.length} tiêu chí chưa có GK chọn)
              </span>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={onResetDefaultAssignment}
          className="inline-flex items-center gap-1.5 rounded border border-[#D6D0C6] bg-[#FAF8F5] px-2.5 py-1 text-xs font-medium text-[#1C1917] hover:bg-white cursor-pointer whitespace-nowrap"
        >
          <RotateCcw className="h-3 w-3 text-[#57534E]" aria-hidden="true" />
          <span>Phân công chuẩn (100đ)</span>
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-3">
          <p className="text-xs text-[#57534E]">
            Mỗi thành viên Ban Giám khảo tích chọn tiêu chí mình phụ trách chấm. Trần điểm tối đa của từng cột <strong className="font-semibold text-[#1C1917]">GK1–GK5</strong> sẽ tự động cộng theo các tiêu chí đã chọn (cộng thêm <strong className="font-semibold text-[#9F1239]">+3đ</strong> tự động nếu tiết mục có chủ đề ca ngợi thầy cô).
          </p>

          <div className="overflow-x-auto rounded border border-[#E5E0D8]">
            <table className="w-full min-w-[780px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E0D8] bg-[#FAF8F5] text-[#57534E]">
                  <th className="px-3 py-2.5 font-semibold w-52">Giám khảo</th>
                  {CRITERIA.map((c) => (
                    <th
                      key={c.id}
                      scope="col"
                      className="border-l border-[#ECE7DF] px-2.5 py-2 text-center"
                      title={c.description}
                    >
                      <div className="font-semibold text-[#1C1917]">
                        {c.stt}. {c.shortName}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] font-medium text-[#9F1239]">
                        {c.maxPoints}đ{c.bonusNote ? ' (+3đ)' : ''}
                      </div>
                    </th>
                  ))}
                  <th className="border-l border-[#E5E0D8] bg-[#F5F2EC] px-3 py-2.5 text-right font-semibold text-[#1C1917] w-24">
                    Điểm tối đa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE7DF]">
                {JUDGES.map((judge) => {
                  const assigned = judgeCriteria[judge.id] ?? [];
                  const maxScore = getJudgeMaxScore(judge.id, judgeCriteria);

                  return (
                    <tr key={judge.id} className="hover:bg-[#FAF8F5]/70">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#1C1917]">
                            {judge.shortLabel}
                          </span>
                          <span className="font-medium text-[#1C1917]">{judge.fullName}</span>
                          {judge.isChair && (
                            <span className="text-[10px] font-semibold text-[#9F1239]">
                              (TB)
                            </span>
                          )}
                        </div>
                      </td>

                      {CRITERIA.map((crit) => {
                        const checked = assigned.includes(crit.id);
                        return (
                          <td
                            key={crit.id}
                            className={`border-l border-[#ECE7DF] px-2 py-2 text-center transition-colors ${
                              checked ? 'bg-[#FFF1F2]/60' : ''
                            }`}
                          >
                            <label className="inline-flex h-7 w-7 items-center justify-center rounded cursor-pointer hover:bg-[#FAF8F5]">
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

                      <td className="border-l border-[#E5E0D8] bg-[#FAF8F5]/60 px-3 py-2 text-right font-mono font-bold tabular-nums text-[#1C1917]">
                        {maxScore > 0 ? `${maxScore}đ` : '0đ'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#E5E0D8] bg-[#FAF8F5] text-[11px]">
                  <td className="px-3 py-2 font-medium text-[#57534E]">
                    Tình trạng phân công
                  </td>
                  {CRITERIA.map((crit) => {
                    const count = coverage.assignedCountByCriterion[crit.id] ?? 0;
                    return (
                      <td
                        key={crit.id}
                        className="border-l border-[#ECE7DF] px-2 py-2 text-center font-mono tabular-nums"
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
                  <td className="border-l border-[#E5E0D8] bg-[#F5F2EC] px-3 py-2 text-right font-mono font-bold tabular-nums text-[#9F1239]">
                    {coverage.totalAssignedPoints}đ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
