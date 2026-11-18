import React from 'react';
import { Award, BookOpenCheck, ClipboardList, Printer, Users } from 'lucide-react';
import { ActiveTab } from '../types/scoring';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onPrint: () => void;
}

const NAV_ITEMS: {
  id: ActiveTab;
  label: string;
  mobileLabel: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}[] = [
  { id: 'ledger', label: 'Biểu chấm điểm', mobileLabel: 'Chấm điểm', icon: ClipboardList },
  { id: 'standings', label: 'Bảng xếp hạng', mobileLabel: 'Xếp hạng', icon: Award },
  { id: 'jury', label: 'Ban giám khảo', mobileLabel: 'Giám khảo', icon: Users },
  { id: 'rules', label: 'Tiêu chí & Giải', mobileLabel: 'Tiêu chí', icon: BookOpenCheck },
];

export const TopBar: React.FC<TopBarProps> = ({ activeTab, onSelectTab, onPrint }) => {
  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-[#E6DFD5] bg-[#FAF7F2]/95 backdrop-blur-md">
        <div className="mx-auto flex h-13 md:h-15 max-w-[1400px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Brand wordmark (single text element) */}
          <button
            type="button"
            onClick={() => onSelectTab('ledger')}
            className="font-display text-base sm:text-lg font-bold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1239] rounded-sm cursor-pointer"
          >
            THCS Lê Hữu Lập
          </button>

          {/* Zone 2: 4 single-line navigation links (Desktop) */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1239] rounded-sm cursor-pointer ${
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
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#9F1239] px-3.5 sm:px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#881337] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F1239] focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>In biên bản</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Tab Bar (Thumb-zone ergonomic navigation) */}
      <nav
        aria-label="Điều hướng di động"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#E6DFD5] bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-4 h-[60px]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                  isActive ? 'text-[#9F1239]' : 'text-[#6B655E] active:text-[#1C1917]'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden={true} />
                <span className="text-[11px] font-medium leading-none whitespace-nowrap">
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
