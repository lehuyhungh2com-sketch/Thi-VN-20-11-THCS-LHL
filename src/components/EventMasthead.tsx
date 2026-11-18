import React from 'react';
import {
  EVENT_DATE_RANGE,
  EVENT_LOCATION_DATE,
  EVENT_TITLE,
  SCHOOL_NAME,
  SECRETARY_NAME,
} from '../data/initialData';
import { EvaluatedPerformance, ScoringConfig } from '../types/scoring';
import { formatTotalScore, getCriteriaCoverageStats } from '../utils/scoring';

interface EventMastheadProps {
  evaluated: EvaluatedPerformance[];
  config: ScoringConfig;
}

const LotusBookEmblem: React.FC = () => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="h-11 w-11 sm:h-12 sm:w-12 shrink-0"
    aria-hidden="true"
  >
    {/* Outer subtle ceremonial ring */}
    <circle cx="24" cy="24" r="22.5" stroke="#E6DFD5" strokeWidth="1" fill="#FFFDF9" />
    {/* Stylised lotus petals (Vietnamese Teachers' Day homage) */}
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
    {/* Open book base */}
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

export const EventMasthead: React.FC<EventMastheadProps> = ({ evaluated, config }) => {
  const fullyScoredCount = evaluated.filter((item) => item.isComplete).length;
  const anyScoredCount = evaluated.filter((item) => item.scoredCount > 0).length;
  const coverage = getCriteriaCoverageStats(config.judgeCriteria);

  const topPerformer = evaluated.find((item) => item.rank === 1);
  const tiedCount = evaluated.filter((item) => item.hasTiedTotal).length;

  return (
    <section className="no-print border-b border-[#E6DFD5] bg-gradient-to-b from-[#FFFDF9] to-white">
      <div className="mx-auto max-w-[1400px] px-4 py-5 sm:py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <LotusBookEmblem />

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-[#6B655E]">
                <span className="text-[#9F1239] font-semibold">{SCHOOL_NAME}</span>
                <span aria-hidden="true">·</span>
                <span>Kỷ niệm 44 năm Ngày Nhà giáo Việt Nam ({EVENT_DATE_RANGE})</span>
              </div>

              <h1 className="font-display text-xl font-bold tracking-tight text-[#1C1917] sm:text-3xl text-balance leading-snug">
                {EVENT_TITLE}
              </h1>

              <p className="text-xs sm:text-sm text-[#57534E]">
                11 tiết mục dự thi · 5 Giám khảo · Thư ký: <span className="font-medium text-[#1C1917]">{SECRETARY_NAME}</span> · {EVENT_LOCATION_DATE} · Thang chuẩn{' '}
                <span className="font-mono tabular-nums font-semibold text-[#1C1917]">
                  {coverage.totalAssignedPoints}đ
                </span>{' '}
                (+<span className="font-mono font-semibold text-[#9F1239]">3đ</span> CĐ thầy cô)
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
                <span className="text-xs font-normal text-[#6B655E]">/11 đủ</span>
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
                Cơ cấu 11 giải
              </dt>
              <dd className="mt-0.5 font-mono text-[11px] sm:text-xs font-semibold tabular-nums text-[#1C1917] leading-6 whitespace-nowrap">
                1N · 2Nh · 2B · 6KK
              </dd>
              {tiedCount > 0 && (
                <dd className="text-[10px] text-[#B45309]">{tiedCount} đồng điểm</dd>
              )}
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};
