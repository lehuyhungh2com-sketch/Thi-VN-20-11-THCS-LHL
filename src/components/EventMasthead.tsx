import React, { useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import {
  CriterionInfo,
  EvaluatedPerformance,
  EventMetadata,
  JudgeInfo,
  PrizeConfig,
  ScoringConfig,
} from '../types/scoring';
import { formatTotalScore, getCriteriaCoverageStats } from '../utils/scoring';

interface EventMastheadProps {
  eventMeta: EventMetadata;
  onUpdateEventMeta: (partial: Partial<EventMetadata>) => void;
  evaluated: EvaluatedPerformance[];
  judges: JudgeInfo[];
  criteria: CriterionInfo[];
  config: ScoringConfig;
  prizeConfig: PrizeConfig;
}

const LotusBookEmblem: React.FC = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-11 w-11 sm:h-12 sm:w-12 shrink-0"
    aria-hidden="true"
  >
    <circle cx="24" cy="24" r="22.5" stroke="#E6DFD5" strokeWidth="1" fill="#FFFDF9" />
    <path
      d="M24 10C21.5 14.5 21.5 19.5 24 23.5C26.5 19.5 26.5 14.5 24 10Z"
      fill="#9F1239"
      fillOpacity="0.14"
      stroke="#9F1239"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path
      d="M15 14.5C15.2 19 18 22.5 22.8 24C21.2 19.2 18.6 15.8 15 14.5Z"
      fill="#B45309"
      fillOpacity="0.12"
      stroke="#B45309"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M33 14.5C32.8 19 30 22.5 25.2 24C26.8 19.2 29.4 15.8 33 14.5Z"
      fill="#B45309"
      fillOpacity="0.12"
      stroke="#B45309"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path
      d="M11.5 27.5C15.5 26 20 26.5 24 29C28 26.5 32.5 26 36.5 27.5V35.5C32.5 34 28 34.5 24 37C20 34.5 15.5 34 11.5 35.5V27.5Z"
      stroke="#9F1239"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="#FFFDF9"
    />
    <path d="M24 29V37" stroke="#9F1239" strokeWidth="1.3" />
  </svg>
);

export const EventMasthead: React.FC<EventMastheadProps> = ({
  eventMeta,
  onUpdateEventMeta,
  evaluated,
  judges,
  criteria,
  config,
  prizeConfig,
}) => {
  const [editingMeta, setEditingMeta] = useState(false);

  const totalCount = evaluated.length;
  const fullyScoredCount = evaluated.filter((item) => item.isComplete).length;
  const anyScoredCount = evaluated.filter((item) => item.scoredCount > 0).length;
  const coverage = getCriteriaCoverageStats(judges, config.judgeCriteria, criteria);

  const topPerformer = evaluated.find((item) => item.rank === 1);
  const tiedCount = evaluated.filter((item) => item.hasTiedTotal).length;
  const totalPrizes =
    prizeConfig.nhat + prizeConfig.nhi + prizeConfig.ba + prizeConfig.khuyen_khich;

  return (
    <section className="no-print border-b border-[#E6DFD5] bg-gradient-to-b from-[#FFFDF9] to-white">
      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:py-6 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
            <LotusBookEmblem />

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-[#6B655E]">
                <span className="text-[#9F1239] font-semibold">{eventMeta.schoolName}</span>
                {eventMeta.eventDateRange && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{eventMeta.eventDateRange}</span>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setEditingMeta((v) => !v)}
                  className="inline-flex items-center gap-1 ml-1 text-xs font-medium text-[#9F1239] hover:underline cursor-pointer"
                >
                  {editingMeta ? (
                    <>
                      <Check className="h-3 w-3" aria-hidden="true" />
                      <span>Xong</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="h-3 w-3" aria-hidden="true" />
                      <span>Sửa thông tin hội thi</span>
                    </>
                  )}
                </button>
              </div>

              <h1 className="font-display text-xl font-bold tracking-tight text-[#1C1917] sm:text-3xl text-balance leading-snug">
                {eventMeta.eventTitle}
              </h1>

              <p className="text-xs sm:text-sm text-[#57534E]">
                {totalCount} tiết mục dự thi · {judges.length} Giám khảo · Thư ký:{' '}
                <span className="font-medium text-[#1C1917]">{eventMeta.secretaryName}</span> ·{' '}
                {eventMeta.eventLocationDate} · Thang chuẩn{' '}
                <span className="font-mono tabular-nums font-semibold text-[#1C1917]">
                  {coverage.totalAssignedPoints}đ
                </span>
                {eventMeta.bonusPoints > 0 && (
                  <>
                    {' '}
                    (+<span className="font-mono font-semibold text-[#9F1239]">{eventMeta.bonusPoints}đ</span>{' '}
                    {eventMeta.bonusLabel})
                  </>
                )}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-[#E6DFD5] border border-[#E6DFD5] rounded-xl bg-[#FAF7F2] shrink-0">
            <div className="px-3 py-2.5 sm:px-4">
              <dt className="text-[11px] font-medium text-[#6B655E] whitespace-nowrap">
                Tiến độ chấm
              </dt>
              <dd className="mt-0.5 font-mono text-sm sm:text-base font-bold tabular-nums text-[#1C1917]">
                {fullyScoredCount}
                <span className="text-xs font-normal text-[#6B655E]">/{totalCount} đủ</span>
              </dd>
              {anyScoredCount > fullyScoredCount && (
                <dd className="text-[10px] text-[#B45309]">
                  {anyScoredCount - fullyScoredCount} đang nhập
                </dd>
              )}
            </div>

            <div className="px-3 py-2.5 sm:px-4">
              <dt className="text-[11px] font-medium text-[#6B655E] whitespace-nowrap">
                Đang dẫn đầu
              </dt>
              <dd className="mt-0.5 font-mono text-sm sm:text-base font-bold tabular-nums text-[#9F1239] truncate">
                {topPerformer ? (
                  <>
                    {topPerformer.className}{' '}
                    <span className="text-xs font-normal text-[#57534E]">
                      ({formatTotalScore(topPerformer.totalScore)})
                    </span>
                  </>
                ) : (
                  <span className="text-[#A8A29E] font-normal text-xs sm:text-sm">Chưa có</span>
                )}
              </dd>
            </div>

            <div className="px-3 py-2.5 sm:px-4">
              <dt className="text-[11px] font-medium text-[#6B655E] whitespace-nowrap">
                Cơ cấu {totalPrizes} giải
              </dt>
              <dd className="mt-0.5 font-mono text-[11px] sm:text-xs font-semibold tabular-nums text-[#1C1917] leading-6 whitespace-nowrap">
                {prizeConfig.nhat}N · {prizeConfig.nhi}Nh · {prizeConfig.ba}B ·{' '}
                {prizeConfig.khuyen_khich}KK
              </dd>
              {tiedCount > 0 && (
                <dd className="text-[10px] text-[#B45309]">{tiedCount} đồng điểm</dd>
              )}
            </div>
          </dl>
        </div>

        {/* Inline Editable Event Metadata Drawer */}
        {editingMeta && (
          <div className="rounded-xl border border-[#E6DFD5] bg-[#FAF7F2] p-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                Đơn vị chủ quản (dòng trên bản in)
              </label>
              <input
                type="text"
                value={eventMeta.organizationHeader}
                onChange={(e) => onUpdateEventMeta({ organizationHeader: e.target.value })}
                className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                Tên trường / Đơn vị tổ chức
              </label>
              <input
                type="text"
                value={eventMeta.schoolName}
                onChange={(e) => onUpdateEventMeta({ schoolName: e.target.value })}
                className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                Tên Hội thi / Sự kiện
              </label>
              <input
                type="text"
                value={eventMeta.eventTitle}
                onChange={(e) => onUpdateEventMeta({ eventTitle: e.target.value })}
                className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                Dịp kỷ niệm / Thời gian
              </label>
              <input
                type="text"
                value={eventMeta.eventDateRange}
                onChange={(e) => onUpdateEventMeta({ eventDateRange: e.target.value })}
                className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                Địa điểm, ngày tháng
              </label>
              <input
                type="text"
                value={eventMeta.eventLocationDate}
                onChange={(e) => onUpdateEventMeta({ eventLocationDate: e.target.value })}
                className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#57534E] mb-1">
                Thư ký Hội thi
              </label>
              <input
                type="text"
                value={eventMeta.secretaryName}
                onChange={(e) => onUpdateEventMeta({ secretaryName: e.target.value })}
                className="w-full min-h-[40px] rounded-lg border border-[#D6D0C6] bg-white px-3 text-sm text-[#1C1917] focus:border-[#9F1239] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
