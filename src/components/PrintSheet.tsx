import React from 'react';
import {
  CriterionInfo,
  EvaluatedPerformance,
  EventMetadata,
  JudgeInfo,
  ScoringConfig,
} from '../types/scoring';
import {
  formatTotalScore,
  getJudgeColumnCriterionTitle,
  getJudgeMaxScore,
} from '../utils/scoring';

interface PrintSheetProps {
  evaluated: EvaluatedPerformance[];
  judges: JudgeInfo[];
  criteria: CriterionInfo[];
  eventMeta: EventMetadata;
  config: ScoringConfig;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({
  evaluated,
  judges,
  criteria,
  eventMeta,
  config,
}) => {
  return (
    <div className="hidden print-only bg-white text-black p-2">
      {/* Official Vietnamese Administrative Header */}
      <div className="flex items-start justify-between text-center mb-3">
        <div className="w-2/5">
          <p className="text-xs font-bold uppercase tracking-wide">
            {eventMeta.organizationHeader}
          </p>
          <p className="text-xs font-bold">{eventMeta.schoolName}</p>
          <div className="mx-auto mt-1 w-28 border-b border-black" />
        </div>
        <div className="w-3/5">
          <p className="text-xs font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="text-[11px] font-semibold underline underline-offset-4">
            Độc lập - Tự do - Hạnh phúc
          </p>
          <p className="text-[11px] italic mt-1">{eventMeta.eventLocationDate}</p>
        </div>
      </div>

      <div className="text-center mb-3">
        <h1 className="font-display text-lg font-bold uppercase">
          BIÊN BẢN CHẤM ĐIỂM HỘI THI VĂN NGHỆ
        </h1>
        <p className="text-xs font-semibold mt-0.5">
          {eventMeta.eventTitle}
          {eventMeta.eventDateRange ? ` (${eventMeta.eventDateRange})` : ''}
        </p>
      </div>

      {/* Print Table sent to classes: Criterion column headers ONLY, zero judge personal names */}
      <table className="w-full border-collapse border border-black text-[10.5px]">
        <thead>
          <tr className="bg-neutral-100">
            <th className="border border-black px-1.5 py-1.5 text-center w-8">STT</th>
            <th className="border border-black px-1.5 py-1.5 text-left w-14">Lớp</th>
            <th className="border border-black px-2 py-1.5 text-left">Tên tiết mục</th>
            {eventMeta.bonusPoints > 0 && (
              <th className="border border-black px-1 py-1.5 text-center w-14">
                <div>CĐ</div>
                <div className="font-normal text-[9px]">(+{eventMeta.bonusPoints}đ)</div>
              </th>
            )}
            {judges.map((j, idx) => {
              const title = getJudgeColumnCriterionTitle(
                j.id,
                config.judgeCriteria,
                criteria,
                idx
              );
              const maxScore = getJudgeMaxScore(j.id, config.judgeCriteria, criteria);

              return (
                <th key={j.id} className="border border-black px-1.5 py-1 text-center w-24">
                  <div className="font-bold leading-tight">{title}</div>
                  <div className="font-normal text-[9px]">({maxScore}đ)</div>
                </th>
              );
            })}
            <th className="border border-black px-1.5 py-1.5 text-right w-16">Tổng điểm</th>
            <th className="border border-black px-1.5 py-1.5 text-center w-14">Xếp thứ</th>
            <th className="border border-black px-2 py-1.5 text-left w-24">Xếp giải</th>
          </tr>
        </thead>
        <tbody>
          {evaluated.map((row) => (
            <tr key={row.id}>
              <td className="border border-black px-1.5 py-1.5 text-center font-mono">
                {row.stt}
              </td>
              <td className="border border-black px-1.5 py-1.5 font-semibold">
                {row.className}
              </td>
              <td className="border border-black px-2 py-1.5">{row.performanceName}</td>
              {eventMeta.bonusPoints > 0 && (
                <td className="border border-black px-1 py-1.5 text-center font-mono">
                  {row.isTeacherTheme ? `+${eventMeta.bonusPoints}` : ''}
                </td>
              )}
              {judges.map((j) => (
                <td key={j.id} className="border border-black px-1.5 py-1.5 text-center font-mono">
                  {row.scores[j.id] !== null && row.scores[j.id] !== undefined
                    ? row.scores[j.id]
                    : ''}
                </td>
              ))}
              <td className="border border-black px-1.5 py-1.5 text-right font-mono font-bold">
                {row.totalScore !== null ? formatTotalScore(row.totalScore) : ''}
              </td>
              <td className="border border-black px-1.5 py-1.5 text-center font-mono font-semibold">
                {row.rank !== null ? row.rank : ''}
              </td>
              <td className="border border-black px-2 py-1.5 font-semibold">
                {row.rank !== null ? row.prizeLabel : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Official Signature Footer — anonymous to classes (no individual judge names) */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center text-[11px]">
        <div>
          <div className="font-bold uppercase">ĐẠI DIỆN BAN GIÁM KHẢO</div>
          <div className="italic text-[10px]">(Ký, ghi rõ họ tên)</div>
        </div>
        <div>
          <div className="font-bold uppercase">TM. BAN TỔ CHỨC</div>
          <div className="italic text-[10px]">(Ký tên, đóng dấu)</div>
        </div>
        <div>
          <div className="font-bold uppercase">THƯ KÝ HỘI THI</div>
          <div className="italic text-[10px]">(Ký, ghi rõ họ tên)</div>
          {eventMeta.secretaryName && (
            <div className="mt-14 font-semibold">{eventMeta.secretaryName}</div>
          )}
        </div>
      </div>
    </div>
  );
};
