import React from 'react';
import { Printer } from 'lucide-react';
import { ActiveTab } from '../types/scoring';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onPrint: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'ledger', label: 'Biểu chấm điểm' },
  { id: 'standings', label: 'Bảng xếp hạng' },
  { id: 'jury', label: 'Ban giám khảo' },
  { id: 'rules', label: 'Tiêu chí & Giải' },
];

export const TopBar: React.FC<TopBarProps> = ({ activeTab, onSelectTab, onPrint }) => {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-[#E5E0D8] bg-[#FAF8F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <button
          type="button"
          onClick={() => onSelectTab('ledger')}
          className="font-display text-lg font-bold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1239] rounded-sm"
        >
          THCS Lê Hữu Lập
        </button>

        {/* Zone 2: 4 single-line navigation links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6B655E]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1239] rounded-sm ${
                  isActive
                    ? 'text-[#9F1239] font-semibold'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[15px] h-[2px] bg-[#9F1239]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary CTA action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-md bg-[#9F1239] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#881337] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1239] focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span>In biên bản</span>
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Điều hướng di động"
        className="flex md:hidden items-center gap-4 overflow-x-auto border-t border-[#ECE7DF] px-4 py-2 text-xs font-medium"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`py-1 whitespace-nowrap shrink-0 ${
                isActive ? 'text-[#9F1239] font-semibold underline underline-offset-4' : 'text-[#57534E]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
