import React from 'react';
import {
  CRITERIA,
  EVENT_DATE_RANGE,
  EVENT_TITLE,
  JUDGES,
  SCHOOL_NAME,
  SECRETARY_NAME,
} from '../data/initialData';
import { ScoringConfig } from '../types/scoring';
import { getCriterionById, getJudgeMaxScore } from '../utils/scoring';

interface JuryViewProps {
  config: ScoringConfig;
  onBackToLedger: () => void;
}

export const JuryView: React.FC<JuryViewProps> = ({ config, onBackToLedger }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1C1917]">
            Ban Giám khảo & Tổ Thư ký Hội thi
          </h2>
          <p className="mt-1 text-sm text-[#57534E]">
            {SCHOOL_NAME} · {EVENT_TITLE} ({EVENT_DATE_RANGE})
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToLedger}
          className="self-start min-h-[42px] rounded-lg border border-[#D6D0C6] bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
        >
          Quay lại Biểu chấm điểm
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[#E6DFD5] bg-white overflow-hidden">
          <div className="border-b border-[#E6DFD5] bg-[#FAF7F2] px-5 py-3">
            <h3 className="text-sm font-bold text-[#1C1917]">
              Danh sách 05 thành viên Ban Giám khảo & Tiêu chí phụ trách
            </h3>
          </div>
          <div className="divide-y divide-[#EFEAE2]">
            {JUDGES.map((judge, idx) => {
              const assignedIds = config.judgeCriteria[judge.id] ?? [];
              const critNames = assignedIds
                .map((cId) => {
                  const c = getCriterionById(cId);
                  return c ? `${c.name} (${c.maxPoints}đ)` : null;
                })
                .filter(Boolean)
                .join(' · ');
              const maxScore = getJudgeMaxScore(judge.id, config.judgeCriteria);

              return (
                <div
                  key={judge.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-4"
                >
                  <div className="flex items-start gap-3.5 sm:gap-4">
                    <span className="font-mono text-xs font-bold text-[#6B655E] w-7 pt-0.5">
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-[#1C1917]">
                        {judge.fullName}{' '}
                        <span className="font-mono text-xs font-normal text-[#6B655E]">
                          ({judge.shortLabel})
                        </span>
                      </div>
                      <div className="text-xs text-[#6B655E]">{judge.role}</div>
                      <div className="mt-1 text-xs text-[#44403C]">
                        Phụ trách:{' '}
                        <span className="font-medium text-[#1C1917]">
                          {critNames || 'Chưa phân công tiêu chí'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="sm:text-right shrink-0 pl-10 sm:pl-0">
                    <div className="font-mono text-sm font-bold tabular-nums text-[#9F1239]">
                      Tối đa {maxScore}đ
                    </div>
                    {judge.isChair && (
                      <div className="text-[11px] font-medium text-[#6B655E]">
                        Phân định đồng điểm
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[#E6DFD5] bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-[#9F1239]">Thư ký Hội thi</div>
            <h3 className="mt-1 font-display text-xl font-bold text-[#1C1917]">
              {SECRETARY_NAME}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#57534E]">
              Phụ trách thu nhận điểm từng tiêu chí từ 05 thành viên Ban Giám khảo ngay sau mỗi tiết mục biểu diễn, nhập điểm vào biểu chấm, rà soát cộng điểm thưởng chủ đề thầy cô (+3đ) và xuất biên bản trình Ban Tổ chức.
            </p>
          </div>
          <dl className="mt-6 space-y-2 border-t border-[#EFEAE2] pt-4 text-xs">
            <div className="flex justify-between">
              <dt className="text-[#6B655E]">Tổng số tiết mục</dt>
              <dd className="font-mono font-semibold text-[#1C1917]">11 tiết mục</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6B655E]">Số lượng Giám khảo</dt>
              <dd className="font-mono font-semibold text-[#1C1917]">05 Giám khảo</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6B655E]">Thang điểm chuẩn</dt>
              <dd className="font-mono font-semibold text-[#1C1917]">100đ (+3đ CĐ thầy cô)</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6B655E]">Tổng số giải thưởng</dt>
              <dd className="font-mono font-semibold text-[#1C1917]">11 giải</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

interface RulesViewProps {
  onBackToLedger: () => void;
}

export const RulesView: React.FC<RulesViewProps> = ({ onBackToLedger }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1C1917]">
            Tiêu chí chấm điểm (Thang 100đ) & Cơ cấu giải thưởng
          </h2>
          <p className="mt-1 text-sm text-[#57534E]">
            Ban Giám khảo chấm điểm theo thang điểm 100; tiết mục có chủ đề ca ngợi thầy cô được cộng thêm 3 điểm (tối đa 103 điểm)
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToLedger}
          className="self-start min-h-[42px] rounded-lg border border-[#D6D0C6] bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
        >
          Quay lại Biểu chấm điểm
        </button>
      </div>

      {/* Mobile Rubric Cards */}
      <div className="space-y-3 md:hidden">
        {CRITERIA.map((c) => (
          <div key={c.id} className="rounded-xl border border-[#E6DFD5] bg-white p-4 space-y-2">
            <div className="flex items-baseline justify-between gap-2 border-b border-[#EFEAE2] pb-2">
              <div className="text-sm font-bold text-[#1C1917]">
                <span className="font-mono text-[#6B655E] mr-1.5">{c.stt}.</span>
                {c.name}
              </div>
              <span className="font-mono text-sm font-bold text-[#9F1239] shrink-0">
                {c.maxPoints}đ
              </span>
            </div>
            {c.subCriteria ? (
              <ul className="space-y-1.5 text-xs text-[#292524]">
                {c.subCriteria.map((sub, idx) => (
                  <li key={idx} className="flex items-baseline justify-between gap-3">
                    <span>• {sub.label}</span>
                    <span className="font-mono font-semibold text-[#57534E] shrink-0">
                      ({sub.maxPoints}đ)
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#44403C] leading-relaxed">{c.description}</p>
            )}
          </div>
        ))}
        <div className="rounded-xl border border-[#9F1239]/30 bg-[#FFF1F2]/50 p-4 flex items-center justify-between text-xs font-bold text-[#9F1239]">
          <span>Tổng chuẩn 100đ · Chủ đề thầy cô (+3đ)</span>
          <span className="font-mono text-sm">103đ</span>
        </div>
      </div>

      {/* Desktop Rubric Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#E6DFD5] bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E6DFD5] bg-[#FAF7F2] text-xs font-semibold text-[#57534E]">
              <th className="w-16 px-4 py-3 text-center">STT</th>
              <th className="w-48 px-4 py-3">Nhóm tiêu chí</th>
              <th className="px-4 py-3">Nội dung tiêu chí đánh giá chi tiết</th>
              <th className="w-32 px-4 py-3 text-right">Điểm chuẩn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFEAE2]">
            {CRITERIA.map((c) => (
              <tr key={c.id} className="align-top hover:bg-[#FAF7F2]/60">
                <td className="px-4 py-3 text-center font-mono text-xs font-bold text-[#6B655E]">
                  {c.stt}
                </td>
                <td className="px-4 py-3 font-semibold text-[#1C1917]">{c.name}</td>
                <td className="px-4 py-3 text-[#292524]">
                  {c.subCriteria ? (
                    <ul className="space-y-1.5">
                      {c.subCriteria.map((sub, idx) => (
                        <li
                          key={idx}
                          className="flex items-baseline justify-between gap-4 text-sm"
                        >
                          <span>• {sub.label}</span>
                          <span className="font-mono text-xs font-semibold tabular-nums text-[#57534E] shrink-0">
                            ({sub.maxPoints}đ)
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{c.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono text-sm font-bold tabular-nums text-[#1C1917]">
                  {c.maxPoints}đ
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#E6DFD5] bg-[#FAF7F2]">
              <td colSpan={3} className="px-4 py-2.5 text-right text-sm font-bold text-[#1C1917]">
                Tổng điểm chuẩn
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-base font-bold tabular-nums text-[#1C1917]">
                100đ
              </td>
            </tr>
            <tr className="border-t border-[#EFEAE2] bg-[#FFF1F2]/50">
              <td colSpan={3} className="px-4 py-2.5 text-right text-sm font-bold text-[#9F1239]">
                Tiết mục có chủ đề ca ngợi thầy, cô (+3đ)
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-base font-bold tabular-nums text-[#9F1239]">
                103đ
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Prize structure + submission note */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#E6DFD5] bg-white p-5">
          <h3 className="text-sm font-bold text-[#1C1917] border-b border-[#EFEAE2] pb-3">
            Cơ cấu 11 giải thưởng chính thức
          </h3>
          <dl className="mt-3 divide-y divide-[#F4EFE6] text-sm">
            <div className="flex items-center justify-between py-2.5">
              <div>
                <dt className="font-bold text-[#9F1239]">01 Giải Nhất</dt>
                <dd className="text-xs text-[#6B655E]">Tiết mục xếp thứ 1 toàn hội thi</dd>
              </div>
              <span className="font-mono text-sm font-bold tabular-nums text-[#1C1917]">
                Hạng 1
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <dt className="font-semibold text-[#B45309]">02 Giải Nhì</dt>
                <dd className="text-xs text-[#6B655E]">Các tiết mục xếp thứ 2 và thứ 3</dd>
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums text-[#1C1917]">
                Hạng 2 – 3
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <dt className="font-semibold text-[#1E3A8A]">02 Giải Ba</dt>
                <dd className="text-xs text-[#6B655E]">Các tiết mục xếp thứ 4 và thứ 5</dd>
              </div>
              <span className="font-mono text-sm font-semibold tabular-nums text-[#1C1917]">
                Hạng 4 – 5
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <div>
                <dt className="font-medium text-[#374151]">06 Giải Khuyến khích</dt>
                <dd className="text-xs text-[#6B655E]">Các tiết mục xếp thứ 6 đến thứ 11</dd>
              </div>
              <span className="font-mono text-sm font-medium tabular-nums text-[#1C1917]">
                Hạng 6 – 11
              </span>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-[#E6DFD5] bg-white p-5 space-y-3 text-sm text-[#44403C]">
          <h3 className="text-sm font-bold text-[#1C1917] border-b border-[#EFEAE2] pb-3">
            Quy định phân công chấm & Tổng hợp điểm
          </h3>
          <p>
            <strong className="text-[#1C1917]">1. Phân công tiêu chí:</strong> 05 thành viên Ban Giám khảo tích chọn tiêu chí phụ trách trong mục <em>Giám khảo tích chọn tiêu chí phụ trách</em>. Mỗi cột GK chỉ nhận điểm trong giới hạn điểm chuẩn của các tiêu chí đã chọn.
          </p>
          <p>
            <strong className="text-[#1C1917]">2. Công thức Tổng điểm:</strong> Tổng điểm = Tổng điểm các Giám khảo + <strong className="text-[#9F1239]">3 điểm</strong> (nếu tiết mục thuộc chủ đề ca ngợi thầy cô).
          </p>
          <p>
            <strong className="text-[#1C1917]">3. Đồng điểm:</strong> Khi có 2 tiết mục bằng tổng điểm, hệ thống ưu tiên xét điểm của Trưởng ban Giám khảo (GK1 Lê Thị Hoa) nếu bật tùy chọn phân định đồng điểm.
          </p>
        </div>
      </div>
    </div>
  );
};
