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

export const EventMasthead: React.FC<EventMastheadProps> = ({ evaluated, config }) => {
  const fullyScoredCount = evaluated.filter((item) => item.isComplete).length;
  const anyScoredCount = evaluated.filter((item) => item.scoredCount > 0).length;
  const coverage = getCriteriaCoverageStats(config.judgeCriteria);

  const topPerformer = evaluated.find((item) => item.rank === 1);
  const tiedCount = evaluated.filter((item) => item.hasTiedTotal).length;

  return (
    <section className="no-print border-b border-[#E5E0D8] bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#6B655E]">
              <span className="text-[#9F1239] font-semibold">{SCHOOL_NAME}</span>
              <span aria-hidden="true">·</span>
              <span>{EVENT_DATE_RANGE}</span>
              <span aria-hidden="true">·</span>
              <span>{EVENT_LOCATION_DATE}</span>
              <span aria-hidden="true">·</span>
              <span>Thư ký: {SECRETARY_NAME}</span>
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-[#1C1917] sm:text-3xl text-balance">
              {EVENT_TITLE}
            </h1>

            <p className="text-sm text-[#57534E]">
              12 tiết mục dự thi · 5 Giám khảo chấm theo 6 tiêu chí · Thang điểm chuẩn{' '}
              <span className="font-mono tabular-nums font-medium text-[#1C1917]">
                {coverage.totalAssignedPoints}
              </span>{' '}
              điểm (+<span className="font-mono font-medium text-[#9F1239]">3đ</span> chủ đề ca ngợi thầy cô, tối đa{' '}
              <span className="font-mono tabular-nums font-medium text-[#1C1917]">
                {coverage.totalAssignedPoints + 3}
              </span>
              đ)
            </p>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-[#E5E0D8] border border-[#E5E0D8] rounded-md bg-[#FAF8F5] shrink-0">
            <div className="px-4 py-2.5">
              <dt className="text-[11px] font-medium text-[#6B655E] whitespace-nowrap">
                Tiến độ chấm
              </dt>
              <dd className="mt-0.5 font-mono text-base font-semibold tabular-nums text-[#1C1917]">
                {fullyScoredCount}
                <span className="text-xs font-normal text-[#6B655E]">/12 đủ điểm</span>
              </dd>
              {anyScoredCount > fullyScoredCount && (
                <dd className="text-[11px] text-[#B45309]">
                  {anyScoredCount - fullyScoredCount} tiết mục đang nhập
                </dd>
              )}
            </div>

            <div className="px-4 py-2.5">
              <dt className="text-[11px] font-medium text-[#6B655E] whitespace-nowrap">
                Đang dẫn đầu
              </dt>
              <dd className="mt-0.5 font-mono text-base font-semibold tabular-nums text-[#9F1239]">
                {topPerformer ? (
                  <>
                    Lớp {topPerformer.className}{' '}
                    <span className="text-xs font-normal text-[#57534E]">
                      ({formatTotalScore(topPerformer.totalScore)})
                    </span>
                  </>
                ) : (
                  <span className="text-[#A8A29E] font-normal">Chưa có</span>
                )}
              </dd>
            </div>

            <div className="px-4 py-2.5">
              <dt className="text-[11px] font-medium text-[#6B655E] whitespace-nowrap">
                Cơ cấu 12 giải
              </dt>
              <dd className="mt-0.5 font-mono text-xs font-semibold tabular-nums text-[#1C1917] leading-6 whitespace-nowrap">
                1 Nhất · 2 Nhì · 2 Ba · 7 KK
              </dd>
              {tiedCount > 0 && (
                <dd className="text-[11px] text-[#B45309]">
                  {tiedCount} lớp có điểm bằng nhau
                </dd>
              )}
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};
