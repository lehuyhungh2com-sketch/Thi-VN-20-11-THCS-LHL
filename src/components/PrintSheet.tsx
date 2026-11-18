import React from 'react';
import {
  EVENT_DATE_RANGE,
  EVENT_LOCATION_DATE,
  EVENT_TITLE,
  JUDGES,
  SCHOOL_NAME,
  SECRETARY_NAME,
} from '../data/initialData';
import { EvaluatedPerformance, ScoringConfig } from '../types/scoring';
import {
  formatTotalScore,
  getCriterionById,
  getJudgeMaxScore,
} from '../utils/scoring';

interface PrintSheetProps {
  evaluated: EvaluatedPerformance[];
  config: ScoringConfig;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({ evaluated, config }) => {
  return (
    <div className="hidden print-only bg-white text-black p-2">
      {/* Official Vietnamese Administrative Header */}
      <div className="flex items-start justify-between text-center mb-3">
        <div className="w-2/5">
          <p className="text-xs font-bold uppercase tracking-wide">
            ĐỘI TNTP HỒ CHÍ MINH
          </p>
          <p className="text-xs font-bold">{SCHOOL_NAME}</p>
          <div className="mx-auto mt-1 w-28 border-b border-black" />
        </div>
        <div className="w-3/5">
          <p className="text-xs font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p className="text-[11px] font-semibold underline underline-offset-4">
            Độc lập - Tự do - Hạnh phúc
          </p>
          <p className="text-[11px] italic mt-1">{EVENT_LOCATION_DATE}</p>
        </div>
      </div>

      <div className="text-center mb-3">
        <h1 className="font-display text-lg font-bold uppercase">
          BIỂU ĐIỂM CHẤM THI VĂN NGHỆ
        </h1>
        <p className="text-xs font-semibold mt-0.5">
          {EVENT_TITLE} ({EVENT_DATE_RANGE})
        </p>
      </div>

      {/* Print Table */}
      <table className="w-full border-collapse border border-black text-[10.5px]">
        <thead>
          <tr className="bg-neutral-100">
            <th className="border border-black px-1.5 py-1.5 text-center w-8">STT</th>
            <th className="border border-black px-1.5 py-1.5 text-left w-14">Lớp</th>
            <th className="border border-black px-2 py-1.5 text-left">Tên tiết mục</th>
            <th className="border border-black px-1 py-1.5 text-center w-12">CĐ +3đ</th>
            {JUDGES.map((j) => {
              const critNames = (config.judgeCriteria[j.id] ?? [])
                .map((cId) => getCriterionById(cId)?.shortName)
                .filter(Boolean)
                .join(' + ');
              const maxScore = getJudgeMaxScore(j.id, config.judgeCriteria);

              return (
                <th key={j.id} className="border border-black px-1.5 py-1 text-center w-24">
                  <div>{j.shortLabel}</div>
                  <div className="font-normal text-[9px]">{j.fullName}</div>
                  {critNames && (
                    <div className="font-normal text-[8.5px] text-neutral-700">
                      {critNames} ({maxScore}đ)
                    </div>
                  )}
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
              <td className="border border-black px-1 py-1.5 text-center font-mono">
                {row.isTeacherTheme ? '+3' : ''}
              </td>
              {JUDGES.map((j) => (
                <td key={j.id} className="border border-black px-1.5 py-1.5 text-center font-mono">
                  {row.scores[j.id] !== null ? row.scores[j.id] : ''}
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

      {/* Official Signature Footer */}
      <div className="mt-5 grid grid-cols-6 gap-2 text-center text-[10px]">
        {JUDGES.map((j) => (
          <div key={j.id}>
            <div className="font-bold">{j.shortLabel}</div>
            <div className="italic">{j.isChair ? 'Trưởng ban GK' : 'Giám khảo'}</div>
            <div className="mt-12 font-semibold">{j.fullName}</div>
          </div>
        ))}
        <div>
          <div className="font-bold">THƯ KÝ</div>
          <div className="italic">(Ký, ghi rõ họ tên)</div>
          <div className="mt-12 font-semibold">{SECRETARY_NAME}</div>
        </div>
      </div>
    </div>
  );
};
