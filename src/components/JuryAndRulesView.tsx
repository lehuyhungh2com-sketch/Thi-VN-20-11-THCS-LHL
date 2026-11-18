import React from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import {
  CriterionId,
  CriterionInfo,
  EventMetadata,
  JudgeId,
  JudgeInfo,
  PrizeConfig,
  ScoringConfig,
} from '../types/scoring';
import { getCriterionById, getJudgeMaxScore } from '../utils/scoring';

interface JuryViewProps {
  judges: JudgeInfo[];
  criteria: CriterionInfo[];
  config: ScoringConfig;
  eventMeta: EventMetadata;
  performanceCount: number;
  prizeConfig: PrizeConfig;
  onUpdateJudge: (judgeId: JudgeId, partial: Partial<JudgeInfo>) => void;
  onSetChairJudge: (judgeId: JudgeId) => void;
  onAddJudge: () => void;
  onRemoveJudge: (judgeId: JudgeId) => void;
  onUpdateEventMeta: (partial: Partial<EventMetadata>) => void;
  onResetJudges: () => void;
  onBackToLedger: () => void;
}

export const JuryView: React.FC<JuryViewProps> = ({
  judges,
  criteria,
  config,
  eventMeta,
  performanceCount,
  prizeConfig,
  onUpdateJudge,
  onSetChairJudge,
  onAddJudge,
  onRemoveJudge,
  onUpdateEventMeta,
  onResetJudges,
  onBackToLedger,
}) => {
  const totalPrizes =
    prizeConfig.nhat + prizeConfig.nhi + prizeConfig.ba + prizeConfig.khuyen_khich;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1C1917]">
            Ban Giám khảo & Tổ Thư ký (Tùy chỉnh linh hoạt)
          </h2>
          <p className="mt-1 text-sm text-[#57534E]">
            Chỉnh sửa tên, vai trò Giám khảo hoặc Thư ký để sử dụng cho nhiều hội thi khác nhau
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onResetJudges}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-[#D6D0C6] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#57534E]" aria-hidden="true" />
            <span>Khôi phục BGK mặc định</span>
          </button>
          <button
            type="button"
            onClick={onBackToLedger}
            className="min-h-[42px] rounded-lg bg-[#9F1239] px-4 py-2 text-xs font-semibold text-white hover:bg-[#881337] cursor-pointer"
          >
            Quay lại Biểu chấm điểm
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Editable Judges List */}
        <div className="lg:col-span-2 rounded-xl border border-[#E6DFD5] bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E6DFD5] bg-[#FAF7F2] px-5 py-3">
            <h3 className="text-sm font-bold text-[#1C1917]">
              Danh sách {judges.length} thành viên Ban Giám khảo
            </h3>
            <button
              type="button"
              onClick={onAddJudge}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#D6D0C6] bg-white px-3 py-1 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#9F1239]" aria-hidden="true" />
              <span>Thêm GK</span>
            </button>
          </div>

          <div className="divide-y divide-[#EFEAE2]">
            {judges.map((judge, idx) => {
              const assignedIds = config.judgeCriteria[judge.id] ?? [];
              const critNames = assignedIds
                .map((cId) => {
                  const c = getCriterionById(cId, criteria);
                  return c ? `${c.name} (${c.maxPoints}đ)` : null;
                })
                .filter(Boolean)
                .join(' · ');
              const maxScore = getJudgeMaxScore(judge.id, config.judgeCriteria, criteria);

              return (
                <div key={judge.id} className="p-4 sm:px-5 space-y-3">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12 sm:items-center">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-medium text-[#6B655E] mb-1">
                        Ký hiệu
                      </label>
                      <input
                        type="text"
                        value={judge.shortLabel}
                        onChange={(e) =>
                          onUpdateJudge(judge.id, { shortLabel: e.target.value })
                        }
                        className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-2.5 font-mono text-xs font-bold text-[#1C1917] focus:border-[#9F1239] focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-medium text-[#6B655E] mb-1">
                        Họ và tên Giám khảo {idx + 1}
                      </label>
                      <input
                        type="text"
                        value={judge.fullName}
                        onChange={(e) =>
                          onUpdateJudge(judge.id, { fullName: e.target.value })
                        }
                        className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm font-semibold text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-[10px] font-medium text-[#6B655E] mb-1">
                        Chức vụ / Vai trò
                      </label>
                      <input
                        type="text"
                        value={judge.role}
                        onChange={(e) => onUpdateJudge(judge.id, { role: e.target.value })}
                        className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm text-[#44403C] focus:border-[#9F1239] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-[#57534E]">
                      Tiêu chí phụ trách:{' '}
                      <span className="font-medium text-[#1C1917]">
                        {critNames || 'Chưa phân công'}
                      </span>{' '}
                      ·{' '}
                      <span className="font-mono font-semibold text-[#9F1239]">
                        Tối đa {maxScore}đ
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="inline-flex min-h-[36px] items-center gap-1.5 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="chair-judge"
                          checked={Boolean(judge.isChair)}
                          onChange={() => onSetChairJudge(judge.id)}
                          className="accent-[#9F1239]"
                        />
                        <span
                          className={
                            judge.isChair ? 'font-semibold text-[#9F1239]' : 'text-[#57534E]'
                          }
                        >
                          Trưởng ban GK
                        </span>
                      </label>

                      {judges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveJudge(judge.id)}
                          title="Xóa giám khảo này"
                          className="inline-flex min-h-[36px] items-center gap-1 rounded px-2 text-xs text-[#6B655E] hover:bg-[#FEF2F2] hover:text-[#DC2626] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editable Secretary & Event Summary */}
        <div className="rounded-xl border border-[#E6DFD5] bg-white p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#9F1239]">Thư ký Hội thi</div>
              <label className="block text-[11px] text-[#6B655E] mt-2 mb-1">
                Họ và tên Thư ký (có thể để trống hoặc thay đổi)
              </label>
              <input
                type="text"
                value={eventMeta.secretaryName}
                onChange={(e) => onUpdateEventMeta({ secretaryName: e.target.value })}
                className="w-full min-h-[42px] rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-3 text-sm font-semibold text-[#1C1917] focus:border-[#9F1239] focus:bg-white focus:outline-none"
              />
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-[#57534E]">
              Lưu ý bảo mật khi công bố: Biên bản in và file Excel gửi về các lớp chỉ hiển thị cột{' '}
              <strong className="text-[#1C1917]">Tên Tiêu chí chấm</strong> (ví dụ: Điểm Chủ đề, Trang phục & ĐC...), không in tên riêng các Giám khảo.
            </p>
          </div>

          <dl className="space-y-2 border-t border-[#EFEAE2] pt-4 text-xs">
            <div className="flex justify-between">
              <dt className="text-[#6B655E]">Tổng số tiết mục</dt>
              <dd className="font-mono font-semibold text-[#1C1917]">
                {performanceCount} tiết mục
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6B655E]">Số lượng Giám khảo</dt>
              <dd className="font-mono font-semibold text-[#1C1917]">{judges.length} Giám khảo</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6B655E]">Tổng số giải thưởng</dt>
              <dd className="font-mono font-semibold text-[#1C1917]">{totalPrizes} giải</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

interface RulesViewProps {
  criteria: CriterionInfo[];
  eventMeta: EventMetadata;
  prizeConfig: PrizeConfig;
  onUpdateCriterion: (id: CriterionId, partial: Partial<CriterionInfo>) => void;
  onAddCriterion: () => void;
  onRemoveCriterion: (id: CriterionId) => void;
  onUpdateEventMeta: (partial: Partial<EventMetadata>) => void;
  onUpdatePrizeConfig: (partial: Partial<PrizeConfig>) => void;
  onResetAllDefaults: () => void;
  onBackToLedger: () => void;
}

export const RulesView: React.FC<RulesViewProps> = ({
  criteria,
  eventMeta,
  prizeConfig,
  onUpdateCriterion,
  onAddCriterion,
  onRemoveCriterion,
  onUpdateEventMeta,
  onUpdatePrizeConfig,
  onResetAllDefaults,
  onBackToLedger,
}) => {
  const totalStandardPoints = criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1C1917]">
            Tiêu chí chấm điểm & Cơ cấu giải thưởng
          </h2>
          <p className="mt-1 text-sm text-[#57534E]">
            Chỉnh sửa linh hoạt tên tiêu chí, thang điểm chuẩn, điểm cộng và số lượng giải cho bất kỳ hội thi nào
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onResetAllDefaults}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-[#D6D0C6] bg-white px-3.5 py-2 text-xs font-medium text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#57534E]" aria-hidden="true" />
            <span>Khôi phục mặc định 20/11</span>
          </button>
          <button
            type="button"
            onClick={onBackToLedger}
            className="min-h-[42px] rounded-lg bg-[#9F1239] px-4 py-2 text-xs font-semibold text-white hover:bg-[#881337] cursor-pointer"
          >
            Quay lại Biểu chấm điểm
          </button>
        </div>
      </div>

      {/* Editable Criteria List */}
      <div className="rounded-xl border border-[#E6DFD5] bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#E6DFD5] bg-[#FAF7F2] px-5 py-3">
          <h3 className="text-sm font-bold text-[#1C1917]">
            Các tiêu chí chấm điểm (Tổng chuẩn hiện tại: {totalStandardPoints}đ)
          </h3>
          <button
            type="button"
            onClick={onAddCriterion}
            className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-[#D6D0C6] bg-white px-3 py-1 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-[#9F1239]" aria-hidden="true" />
            <span>Thêm tiêu chí</span>
          </button>
        </div>

        <div className="divide-y divide-[#EFEAE2]">
          {criteria.map((c, idx) => (
            <div key={c.id} className="p-4 sm:px-5 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 sm:items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[10px] font-medium text-[#6B655E] mb-1">
                    Tên tiêu chí {idx + 1}
                  </label>
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => onUpdateCriterion(c.id, { name: e.target.value })}
                    className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm font-semibold text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-medium text-[#6B655E] mb-1">
                    Tên ngắn (hiện trên cột bảng)
                  </label>
                  <input
                    type="text"
                    value={c.shortName}
                    onChange={(e) => onUpdateCriterion(c.id, { shortName: e.target.value })}
                    className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-medium text-[#6B655E] mb-1">
                    Điểm chuẩn tối đa
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={c.maxPoints}
                    onChange={(e) =>
                      onUpdateCriterion(c.id, {
                        maxPoints: Math.max(1, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-3 font-mono text-sm font-bold text-[#9F1239] focus:border-[#9F1239] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end">
                  {criteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveCriterion(c.id)}
                      className="inline-flex min-h-[40px] items-center gap-1 rounded-lg px-2.5 text-xs text-[#6B655E] hover:bg-[#FEF2F2] hover:text-[#DC2626] cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-[#6B655E] mb-1">
                  Mô tả chi tiết nội dung chấm
                </label>
                <input
                  type="text"
                  value={c.description}
                  onChange={(e) => onUpdateCriterion(c.id, { description: e.target.value })}
                  className="w-full min-h-[38px] rounded-lg border border-[#EFEAE2] bg-[#FAF7F2]/60 px-3 text-xs text-[#44403C] focus:border-[#9F1239] focus:bg-white focus:outline-none"
                />
                {c.subCriteria && c.subCriteria.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#6B655E]">
                    {c.subCriteria.map((sub, sIdx) => (
                      <span key={sIdx}>
                        • {sub.label} ({sub.maxPoints}đ)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bonus & Prize Quota Config */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E6DFD5] bg-white p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#1C1917] border-b border-[#EFEAE2] pb-3">
            Cấu hình điểm thưởng ưu tiên
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#57534E] mb-1">
                Tên mục điểm cộng
              </label>
              <input
                type="text"
                value={eventMeta.bonusLabel}
                onChange={(e) => onUpdateEventMeta({ bonusLabel: e.target.value })}
                className="w-full min-h-[42px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#57534E] mb-1">
                Số điểm cộng
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={eventMeta.bonusPoints}
                onChange={(e) =>
                  onUpdateEventMeta({
                    bonusPoints: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-full min-h-[42px] rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-3 font-mono text-sm font-bold text-[#9F1239] focus:border-[#9F1239] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-[#6B655E]">
            Điểm tối đa toàn hội thi hiện tại:{' '}
            <strong className="font-mono text-[#1C1917]">
              {totalStandardPoints + eventMeta.bonusPoints}đ
            </strong>{' '}
            (Đặt 0 điểm nếu không áp dụng điểm cộng).
          </p>
        </div>

        <div className="rounded-xl border border-[#E6DFD5] bg-white p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#1C1917] border-b border-[#EFEAE2] pb-3">
            Cấu hình số lượng giải thưởng
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-semibold text-[#9F1239] mb-1">
                Giải Nhất
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={prizeConfig.nhat}
                onChange={(e) =>
                  onUpdatePrizeConfig({ nhat: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full min-h-[42px] rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-3 text-center font-mono text-sm font-bold text-[#1C1917] focus:border-[#9F1239] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#B45309] mb-1">
                Giải Nhì
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={prizeConfig.nhi}
                onChange={(e) =>
                  onUpdatePrizeConfig({ nhi: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full min-h-[42px] rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-3 text-center font-mono text-sm font-bold text-[#1C1917] focus:border-[#9F1239] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E3A8A] mb-1">
                Giải Ba
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={prizeConfig.ba}
                onChange={(e) =>
                  onUpdatePrizeConfig({ ba: Math.max(0, Number(e.target.value) || 0) })
                }
                className="w-full min-h-[42px] rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-3 text-center font-mono text-sm font-bold text-[#1C1917] focus:border-[#9F1239] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#374151] mb-1">
                Khuyến khích
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={prizeConfig.khuyen_khich}
                onChange={(e) =>
                  onUpdatePrizeConfig({
                    khuyen_khich: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className="w-full min-h-[42px] rounded-lg border border-[#D6D0C6] bg-[#FAF7F2] px-3 text-center font-mono text-sm font-bold text-[#1C1917] focus:border-[#9F1239] focus:bg-white focus:outline-none"
              />
            </div>
          </div>
          <p className="text-xs text-[#6B655E]">
            Tổng số giải sẽ trao:{' '}
            <strong className="font-mono text-[#1C1917]">
              {prizeConfig.nhat + prizeConfig.nhi + prizeConfig.ba + prizeConfig.khuyen_khich}{' '}
              giải
            </strong>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
