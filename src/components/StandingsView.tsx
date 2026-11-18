import React from 'react';
import { Award, Download, Printer } from 'lucide-react';
import { JUDGES, SECRETARY_NAME } from '../data/initialData';
import { EvaluatedPerformance, PrizeTier } from '../types/scoring';
import { formatTotalScore } from '../utils/scoring';

interface StandingsViewProps {
  evaluated: EvaluatedPerformance[];
  onExportCsv: () => void;
  onPrint: () => void;
  onBackToLedger: () => void;
}

const PRIZE_GROUPS: {
  tier: Exclude<PrizeTier, 'none'>;
  title: string;
  quota: number;
  accentClass: string;
}[] = [
  { tier: 'nhat', title: 'Giải Nhất', quota: 1, accentClass: 'text-[#9F1239]' },
  { tier: 'nhi', title: 'Giải Nhì', quota: 2, accentClass: 'text-[#B45309]' },
  { tier: 'ba', title: 'Giải Ba', quota: 2, accentClass: 'text-[#1E3A8A]' },
  { tier: 'khuyen_khich', title: 'Giải Khuyến khích', quota: 6, accentClass: 'text-[#374151]' },
];

export const StandingsView: React.FC<StandingsViewProps> = ({
  evaluated,
  onExportCsv,
  onPrint,
  onBackToLedger,
}) => {
  const rankedList = evaluated
    .filter((item) => item.rank !== null)
    .sort((a, b) => {
      if ((a.rank ?? 99) !== (b.rank ?? 99)) return (a.rank ?? 99) - (b.rank ?? 99);
      return (b.totalScore ?? 0) - (a.totalScore ?? 0);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1C1917]">
            Bảng tổng sắp kết quả & Cơ cấu trao giải
          </h2>
          <p className="mt-1 text-sm text-[#57534E]">
            Tổng hợp thứ hạng tự động từ 5 thành viên Ban Giám khảo ({rankedList.length}/11 tiết mục đã có điểm)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg border border-[#D6D0C6] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF7F2] cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Xuất Excel (CSV)</span>
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-lg bg-[#9F1239] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#881337] cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>In biên bản</span>
          </button>
        </div>
      </div>

      {rankedList.length === 0 ? (
        <div className="rounded-xl border border-[#E6DFD5] bg-white p-8 sm:p-10 text-center">
          <Award className="mx-auto h-8 w-8 text-[#A8A29E]" aria-hidden="true" />
          <h3 className="mt-3 text-base font-semibold text-[#1C1917]">
            Chưa có dữ liệu điểm để xếp hạng
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#6B655E]">
            Thư ký vui lòng chuyển sang Biểu chấm điểm để nhập điểm sau mỗi tiết mục. Bảng xếp hạng và giải thưởng sẽ tự động cập nhật ngay lập tức.
          </p>
          <button
            type="button"
            onClick={onBackToLedger}
            className="mt-5 inline-flex min-h-[44px] items-center rounded-lg bg-[#9F1239] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#881337] cursor-pointer"
          >
            Quay lại Biểu chấm điểm
          </button>
        </div>
      ) : (
        <>
          {/* Prize Tier Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PRIZE_GROUPS.map((group) => {
              const winners = rankedList.filter((item) => item.prize === group.tier);
              return (
                <div
                  key={group.tier}
                  className="rounded-xl border border-[#E6DFD5] bg-white p-4 flex flex-col"
                >
                  <div className="flex items-baseline justify-between border-b border-[#EFEAE2] pb-2.5">
                    <h3 className={`text-sm font-bold ${group.accentClass}`}>{group.title}</h3>
                    <span className="font-mono text-xs tabular-nums text-[#6B655E]">
                      {winners.length}/{group.quota} giải
                    </span>
                  </div>

                  {winners.length === 0 ? (
                    <p className="py-4 text-xs text-[#A8A29E]">Chưa đủ tiết mục ở hạng này</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-[#F4EFE6]">
                      {winners.map((w) => (
                        <li key={w.id} className="py-2 first:pt-0 last:pb-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-sm font-semibold text-[#1C1917]">
                              Hạng {w.rank} · Lớp {w.className}
                            </span>
                            <span className="font-mono text-sm font-bold tabular-nums text-[#9F1239]">
                              {formatTotalScore(w.totalScore)}
                            </span>
                          </div>
                          <p
                            className="mt-0.5 text-xs text-[#57534E] truncate"
                            title={w.performanceName}
                          >
                            {w.performanceName}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Ranked Cards */}
          <div className="space-y-2.5 md:hidden">
            {rankedList.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#E6DFD5] bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#9F1239]">
                      #{item.rank}
                    </span>
                    <span className="text-sm font-semibold text-[#1C1917]">
                      Lớp {item.className}
                    </span>
                    <span className="text-xs text-[#6B655E]">(STT {item.stt})</span>
                  </div>
                  <p className="mt-0.5 text-xs text-[#57534E] line-clamp-1">
                    {item.performanceName}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-base font-bold tabular-nums text-[#1C1917]">
                    {formatTotalScore(item.totalScore)}
                  </div>
                  <div
                    className={`text-xs font-semibold ${
                      item.prize === 'nhat'
                        ? 'text-[#9F1239]'
                        : item.prize === 'nhi'
                          ? 'text-[#B45309]'
                          : item.prize === 'ba'
                            ? 'text-[#1E3A8A]'
                            : 'text-[#374151]'
                    }`}
                  >
                    {item.prizeLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Ranked Table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-[#E6DFD5] bg-white">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#E6DFD5] bg-[#FAF7F2] text-xs font-semibold text-[#57534E]">
                  <th className="px-4 py-3 text-center w-20">Xếp thứ</th>
                  <th className="px-4 py-3 w-24">Lớp</th>
                  <th className="px-4 py-3">Tên tiết mục</th>
                  <th className="px-4 py-3 text-center w-20">STT</th>
                  <th className="px-4 py-3 text-right w-28">GK1 (TB)</th>
                  <th className="px-4 py-3 text-right w-28">Tổng điểm</th>
                  <th className="px-4 py-3 w-40">Xếp giải</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEAE2]">
                {rankedList.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF7F2]">
                    <td className="px-4 py-2.5 text-center font-mono font-bold tabular-nums text-[#1C1917]">
                      {item.rank}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-[#1C1917]">
                      Lớp {item.className}
                    </td>
                    <td className="px-4 py-2.5 text-[#292524]">{item.performanceName}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-xs tabular-nums text-[#6B655E]">
                      {String(item.stt).padStart(2, '0')}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs tabular-nums text-[#57534E]">
                      {item.scores.gk1 !== null ? item.scores.gk1 : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold tabular-nums text-[#9F1239]">
                      {formatTotalScore(item.totalScore)}
                    </td>
                    <td
                      className={`px-4 py-2.5 font-semibold ${
                        item.prize === 'nhat'
                          ? 'text-[#9F1239]'
                          : item.prize === 'nhi'
                            ? 'text-[#B45309]'
                            : item.prize === 'ba'
                              ? 'text-[#1E3A8A]'
                              : 'text-[#374151]'
                      }`}
                    >
                      {item.prizeLabel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official Jury Sign-off Preview */}
          <div className="rounded-xl border border-[#E6DFD5] bg-white p-5 sm:p-6">
            <h3 className="text-sm font-bold text-[#1C1917]">
              Thành phần ký xác nhận biên bản chấm điểm
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6 text-center">
              {JUDGES.map((j) => (
                <div key={j.id} className="space-y-1">
                  <div className="text-xs font-semibold text-[#1C1917]">{j.shortLabel}</div>
                  <div className="text-[11px] text-[#6B655E]">
                    {j.isChair ? 'Trưởng ban GK' : 'Ủy viên BGK'}
                  </div>
                  <div className="pt-6 sm:pt-8 text-xs font-semibold text-[#1C1917]">
                    {j.fullName}
                  </div>
                </div>
              ))}
              <div className="space-y-1 border-t pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 border-[#EFEAE2]">
                <div className="text-xs font-semibold text-[#9F1239]">Thư ký hội thi</div>
                <div className="text-[11px] text-[#6B655E]">Tổng hợp biểu điểm</div>
                <div className="pt-6 sm:pt-8 text-xs font-semibold text-[#1C1917]">
                  {SECRETARY_NAME}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
